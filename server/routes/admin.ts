/**
 * API d'administration — toutes les routes exigent une session valide.
 *
 * Défense en profondeur :
 *  1. cookie de session HttpOnly signé (server/auth.ts) ;
 *  2. vérification en base de is_active + token_version ;
 *  3. contrôle d'origine + en-tête personnalisé sur chaque mutation (CSRF) ;
 *  4. validation Zod de toutes les entrées ;
 *  5. liste blanche de colonnes pour les requêtes SQL dynamiques.
 */
import type { z } from 'zod'
import { query, queryOne } from '../db.js'
import { HttpError, json, readJson, sameOrigin } from '../http.js'
import { Router, type RouteContext } from '../router.js'
import {
  adminInviteSchema,
  courseSchema,
  messageUpdateSchema,
  projectSchema,
  propertySchema,
  quoteUpdateSchema,
  registrationUpdateSchema,
  serviceSchema,
} from '../validators.js'
import { toAdminUser, toContactMessage, toCourse, toProperty, toProject, toQuote, toRegistration, toService } from '../mappers.js'
import { requireAdmin, requireSuperAdmin, hashPassword } from '../auth.js'
import { getAllSettings, saveSettings } from '../settings.js'

export const adminRouter = new Router()

// --- Garde centrale --------------------------------------------------------

async function guard(ctx: RouteContext, minRole: 'admin' | 'superadmin' = 'admin') {
  const method = ctx.req.method ?? 'GET'
  if (method !== 'GET' && method !== 'HEAD') {
    if (!sameOrigin(ctx.req)) throw new HttpError(403, 'Origine non autorisée.', 'bad_origin')
    if (ctx.req.headers['x-bg-request'] !== '1') {
      throw new HttpError(403, 'En-tête de sécurité manquant.', 'csrf_missing')
    }
  }
  if (ctx.params.id && !UUID_RE.test(ctx.params.id)) {
    throw new HttpError(404, 'Élément introuvable.', 'not_found')
  }
  return minRole === 'superadmin' ? requireSuperAdmin(ctx.req) : requireAdmin(ctx.req)
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function intParam(value: string | null, fallback: number, max: number): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.min(Math.floor(n), max)
}

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value)
  if (/[";\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

// --- Vue d'ensemble --------------------------------------------------------

adminRouter.get('/api/admin/stats', async (ctx) => {
  await guard(ctx)
  const [quotes, messages, registrations, properties, projects, courses, services, recent] = await Promise.all([
    queryOne<{ total: string; nouvelle: string; en_cours: string; traitees: string }>(
      `SELECT count(*)::text AS total,
              count(*) FILTER (WHERE status = 'nouvelle')::text AS nouvelle,
              count(*) FILTER (WHERE status IN ('a_contacter','en_discussion','devis_envoye'))::text AS en_cours,
              count(*) FILTER (WHERE status IN ('acceptee','terminee'))::text AS traitees
         FROM quote_requests`,
    ),
    queryOne<{ total: string; nouveau: string }>(
      `SELECT count(*)::text AS total, count(*) FILTER (WHERE status = 'nouveau')::text AS nouveau FROM contact_messages`,
    ),
    queryOne<{ total: string; nouvelle: string }>(
      `SELECT count(*)::text AS total, count(*) FILTER (WHERE status = 'nouvelle')::text AS nouvelle FROM training_registrations`,
    ),
    queryOne<{ total: string; publiees: string; disponibles: string }>(
      `SELECT count(*)::text AS total,
              count(*) FILTER (WHERE is_published)::text AS publiees,
              count(*) FILTER (WHERE is_published AND status = 'disponible')::text AS disponibles
         FROM properties`,
    ),
    queryOne<{ total: string; publies: string }>(
      `SELECT count(*)::text AS total, count(*) FILTER (WHERE is_published)::text AS publies FROM projects`,
    ),
    queryOne<{ total: string; publiees: string }>(
      `SELECT count(*)::text AS total, count(*) FILTER (WHERE is_published)::text AS publiees FROM training_courses`,
    ),
    queryOne<{ total: string; publies: string }>(
      `SELECT count(*)::text AS total, count(*) FILTER (WHERE is_published)::text AS publies FROM services`,
    ),
    query(
      `SELECT q.*, a.full_name AS assigned_name FROM quote_requests q
       LEFT JOIN admin_users a ON a.id = q.assigned_to
       ORDER BY q.created_at DESC LIMIT 5`,
    ),
  ])
  const n = (v: string | undefined) => Number(v ?? 0)
  json(ctx.res, 200, {
    quotes: { total: n(quotes?.total), nouvelle: n(quotes?.nouvelle), enCours: n(quotes?.en_cours), traitees: n(quotes?.traitees) },
    messages: { total: n(messages?.total), nouveau: n(messages?.nouveau) },
    registrations: { total: n(registrations?.total), nouvelle: n(registrations?.nouvelle) },
    properties: { total: n(properties?.total), publiees: n(properties?.publiees), disponibles: n(properties?.disponibles) },
    projects: { total: n(projects?.total), publies: n(projects?.publies) },
    courses: { total: n(courses?.total), publiees: n(courses?.publiees) },
    services: { total: n(services?.total), publies: n(services?.publies) },
    recentQuotes: recent.map(toQuote),
  })
})

// --- Demandes de devis -----------------------------------------------------

adminRouter.get('/api/admin/quotes', async (ctx) => {
  await guard(ctx)
  const status = ctx.url.searchParams.get('status')
  const search = (ctx.url.searchParams.get('q') ?? '').trim()
  const page = intParam(ctx.url.searchParams.get('page'), 1, 10_000)
  const limit = intParam(ctx.url.searchParams.get('limit'), 20, 100)

  const filters: string[] = []
  const params: unknown[] = []
  if (status && status !== 'tous') {
    params.push(status)
    filters.push(`q.status = $${params.length}`)
  }
  if (search) {
    params.push(`%${search}%`)
    filters.push(
      `(q.full_name ILIKE $${params.length} OR q.phone ILIKE $${params.length} OR q.email ILIKE $${params.length} OR q.reference ILIKE $${params.length} OR q.description ILIKE $${params.length})`,
    )
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

  const totalRow = await queryOne<{ count: string }>(
    `SELECT count(*)::text AS count FROM quote_requests q ${where}`,
    params,
  )
  const rows = await query(
    `SELECT q.*, a.full_name AS assigned_name FROM quote_requests q
       LEFT JOIN admin_users a ON a.id = q.assigned_to
       ${where}
       ORDER BY q.created_at DESC
       LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
    params,
  )
  json(ctx.res, 200, {
    quotes: rows.map(toQuote),
    total: Number(totalRow?.count ?? 0),
    page,
    limit,
  })
})

adminRouter.get('/api/admin/quotes/:id', async (ctx) => {
  await guard(ctx)
  const row = await queryOne(
    `SELECT q.*, a.full_name AS assigned_name FROM quote_requests q
       LEFT JOIN admin_users a ON a.id = q.assigned_to WHERE q.id = $1`,
    [ctx.params.id],
  )
  if (!row) throw new HttpError(404, 'Demande introuvable.', 'not_found')
  json(ctx.res, 200, { quote: toQuote(row) })
})

adminRouter.patch('/api/admin/quotes/:id', async (ctx) => {
  await guard(ctx)
  const parsed = quoteUpdateSchema.safeParse(await readJson(ctx.req))
  if (!parsed.success) throw new HttpError(422, 'Données invalides.', 'validation_error', parsed.error.flatten().fieldErrors)
  const { status, internal_notes, assigned_to } = parsed.data

  const row = await queryOne(
    `UPDATE quote_requests SET
        status = COALESCE($2, status),
        internal_notes = COALESCE($3, internal_notes),
        assigned_to = CASE WHEN $4::text IS NULL THEN assigned_to
                           WHEN $4 = '' THEN NULL ELSE $4::uuid END
      WHERE id = $1
      RETURNING *`,
    [ctx.params.id, status ?? null, internal_notes ?? null, assigned_to === undefined ? null : (assigned_to ?? '')],
  )
  if (!row) throw new HttpError(404, 'Demande introuvable.', 'not_found')
  json(ctx.res, 200, { quote: toQuote(row) })
})

adminRouter.delete('/api/admin/quotes/:id', async (ctx) => {
  await guard(ctx, 'superadmin')
  const body = (await readJson(ctx.req)) as { confirmReference?: string }
  const row = await queryOne<{ reference: string }>(`SELECT reference FROM quote_requests WHERE id = $1`, [ctx.params.id])
  if (!row) throw new HttpError(404, 'Demande introuvable.', 'not_found')
  if (body.confirmReference !== row.reference) {
    throw new HttpError(400, 'Confirmation incorrecte : saisissez la référence exacte de la demande.', 'confirm_required')
  }
  await query(`DELETE FROM quote_requests WHERE id = $1`, [ctx.params.id])
  json(ctx.res, 200, { ok: true })
})

adminRouter.get('/api/admin/quotes-export.csv', async (ctx) => {
  await guard(ctx)
  const rows = await query(
    `SELECT reference, created_at, full_name, phone, email, service_type, location, budget, timeline, status, description
       FROM quote_requests ORDER BY created_at DESC`,
  )
  const header = ['reference', 'date', 'nom', 'telephone', 'email', 'service', 'localisation', 'budget', 'delai', 'statut', 'description']
  const lines = [header.join(';')]
  for (const row of rows) {
    lines.push(
      [
        row.reference,
        new Date(row.created_at as string).toISOString(),
        row.full_name,
        row.phone,
        row.email,
        row.service_type,
        row.location,
        row.budget,
        row.timeline,
        row.status,
        row.description,
      ]
        .map(csvEscape)
        .join(';'),
    )
  }
  const csv = '\uFEFF' + lines.join('\r\n')
  ctx.res.statusCode = 200
  ctx.res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  ctx.res.setHeader('Content-Disposition', `attachment; filename="demandes-devis-brille-group-${new Date().toISOString().slice(0, 10)}.csv"`)
  ctx.res.setHeader('Cache-Control', 'no-store')
  ctx.res.end(csv)
})

// --- Messages de contact ---------------------------------------------------

adminRouter.get('/api/admin/messages', async (ctx) => {
  await guard(ctx)
  const status = ctx.url.searchParams.get('status')
  const rows = await query(
    status && status !== 'tous'
      ? `SELECT * FROM contact_messages WHERE status = $1 ORDER BY created_at DESC LIMIT 200`
      : `SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200`,
    status && status !== 'tous' ? [status] : [],
  )
  json(ctx.res, 200, { messages: rows.map(toContactMessage) })
})

adminRouter.patch('/api/admin/messages/:id', async (ctx) => {
  await guard(ctx)
  const parsed = messageUpdateSchema.safeParse(await readJson(ctx.req))
  if (!parsed.success || !parsed.data.status) throw new HttpError(422, 'Données invalides.', 'validation_error')
  const row = await queryOne(
    `UPDATE contact_messages SET status = $2 WHERE id = $1 RETURNING *`,
    [ctx.params.id, parsed.data.status],
  )
  if (!row) throw new HttpError(404, 'Message introuvable.', 'not_found')
  json(ctx.res, 200, { message: toContactMessage(row) })
})

adminRouter.delete('/api/admin/messages/:id', async (ctx) => {
  await guard(ctx)
  await query(`DELETE FROM contact_messages WHERE id = $1`, [ctx.params.id])
  json(ctx.res, 200, { ok: true })
})

// --- Inscriptions formation ------------------------------------------------

adminRouter.get('/api/admin/registrations', async (ctx) => {
  await guard(ctx)
  const rows = await query(`SELECT * FROM training_registrations ORDER BY created_at DESC LIMIT 200`)
  json(ctx.res, 200, { registrations: rows.map(toRegistration) })
})

adminRouter.patch('/api/admin/registrations/:id', async (ctx) => {
  await guard(ctx)
  const parsed = registrationUpdateSchema.safeParse(await readJson(ctx.req))
  if (!parsed.success || !parsed.data.status) throw new HttpError(422, 'Données invalides.', 'validation_error')
  const row = await queryOne(
    `UPDATE training_registrations SET status = $2 WHERE id = $1 RETURNING *`,
    [ctx.params.id, parsed.data.status],
  )
  if (!row) throw new HttpError(404, 'Inscription introuvable.', 'not_found')
  json(ctx.res, 200, { registration: toRegistration(row) })
})

adminRouter.delete('/api/admin/registrations/:id', async (ctx) => {
  await guard(ctx)
  await query(`DELETE FROM training_registrations WHERE id = $1`, [ctx.params.id])
  json(ctx.res, 200, { ok: true })
})

// --- CRUD génériques -------------------------------------------------------

type CrudConfig = {
  base: string // ex: 'services'
  table: string
  columns: Record<string, string>
  schema: z.AnyZodObject
  mapper: (row: Record<string, unknown>) => unknown
  orderBy: string
  singletonKey: string // clé du DTO dans les réponses
  deleteRole?: 'admin' | 'superadmin'
}

function buildInsert(cfg: CrudConfig, data: Record<string, unknown>) {
  const cols: string[] = []
  const placeholders: string[] = []
  const values: unknown[] = []
  for (const [key, column] of Object.entries(cfg.columns)) {
    if (!(key in data)) continue
    let value = data[key]
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) value = JSON.stringify(value)
    cols.push(column)
    values.push(value)
    placeholders.push(`$${values.length}`)
  }
  return { cols, placeholders, values }
}

function buildUpdate(cfg: CrudConfig, data: Record<string, unknown>) {
  const sets: string[] = []
  const values: unknown[] = []
  for (const [key, column] of Object.entries(cfg.columns)) {
    if (!(key in data)) continue
    let value = data[key]
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) value = JSON.stringify(value)
    values.push(value)
    sets.push(`${column} = $${values.length}`)
  }
  return { sets, values }
}

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
}

function registerCrud(cfg: CrudConfig) {
  adminRouter.get(`/api/admin/${cfg.base}`, async (ctx) => {
    await guard(ctx)
    const rows = await query(`SELECT * FROM ${cfg.table} ORDER BY ${cfg.orderBy}`)
    json(ctx.res, 200, { [cfg.base]: rows.map(cfg.mapper) })
  })

  adminRouter.post(`/api/admin/${cfg.base}`, async (ctx) => {
    await guard(ctx)
    const parsed = cfg.schema.safeParse(await readJson(ctx.req))
    if (!parsed.success) {
      throw new HttpError(422, 'Données invalides.', 'validation_error', parsed.error.flatten().fieldErrors)
    }
    const data = { ...(parsed.data as Record<string, unknown>) }
    if (cfg.table === 'services' && !data.slug) data.slug = slugify(String(data.title))
    if (cfg.table === 'properties' && !data.reference) {
      data.reference = `REF-${Date.now().toString(36).toUpperCase().slice(-6)}`
    }
    const { cols, placeholders, values } = buildInsert(cfg, data)
    try {
      const row = await queryOne(
        `INSERT INTO ${cfg.table} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
        values,
      )
      json(ctx.res, 201, { [cfg.singletonKey]: cfg.mapper(row as Record<string, unknown>) })
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message.includes('duplicate key')) {
        throw new HttpError(409, 'Cet identifiant (slug ou référence) existe déjà.', 'duplicate')
      }
      throw error
    }
  })

  adminRouter.patch(`/api/admin/${cfg.base}/:id`, async (ctx) => {
    await guard(ctx)
    const parsed = cfg.schema.partial().safeParse(await readJson(ctx.req))
    if (!parsed.success) {
      throw new HttpError(422, 'Données invalides.', 'validation_error', parsed.error.flatten().fieldErrors)
    }
    const { sets, values } = buildUpdate(cfg, parsed.data as Record<string, unknown>)
    if (sets.length === 0) throw new HttpError(400, 'Aucune modification à enregistrer.', 'empty_update')
    values.push(ctx.params.id)
    try {
      const row = await queryOne(
        `UPDATE ${cfg.table} SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values,
      )
      if (!row) throw new HttpError(404, 'Élément introuvable.', 'not_found')
      json(ctx.res, 200, { [cfg.singletonKey]: cfg.mapper(row) })
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message.includes('duplicate key')) {
        throw new HttpError(409, 'Cet identifiant (slug ou référence) existe déjà.', 'duplicate')
      }
      throw error
    }
  })

  adminRouter.delete(`/api/admin/${cfg.base}/:id`, async (ctx) => {
    await guard(ctx, cfg.deleteRole ?? 'admin')
    const row = await queryOne(`DELETE FROM ${cfg.table} WHERE id = $1 RETURNING id`, [ctx.params.id])
    if (!row) throw new HttpError(404, 'Élément introuvable.', 'not_found')
    json(ctx.res, 200, { ok: true })
  })
}

registerCrud({
  base: 'services',
  table: 'services',
  columns: {
    slug: 'slug',
    title: 'title',
    category: 'category',
    shortDescription: 'short_description',
    description: 'description',
    bullets: 'bullets',
    imageUrl: 'image_url',
    icon: 'icon',
    sortOrder: 'sort_order',
    isCore: 'is_core',
    isPublished: 'is_published',
  },
  schema: serviceSchema,
  mapper: toService,
  orderBy: 'sort_order ASC, title ASC',
  singletonKey: 'service',
})

registerCrud({
  base: 'properties',
  table: 'properties',
  columns: {
    reference: 'reference',
    title: 'title',
    propertyType: 'property_type',
    location: 'location',
    areaSqm: 'area_sqm',
    priceFcfa: 'price_fcfa',
    description: 'description',
    images: 'images',
    status: 'status',
    extraInfo: 'extra_info',
    isPublished: 'is_published',
  },
  schema: propertySchema,
  mapper: toProperty,
  orderBy: 'created_at DESC',
  singletonKey: 'property',
})

registerCrud({
  base: 'projects',
  table: 'projects',
  columns: {
    title: 'title',
    category: 'category',
    description: 'description',
    location: 'location',
    period: 'period',
    coverImage: 'cover_image',
    images: 'images',
    sortOrder: 'sort_order',
    isPublished: 'is_published',
  },
  schema: projectSchema,
  mapper: toProject,
  orderBy: 'sort_order ASC, created_at DESC',
  singletonKey: 'project',
})

registerCrud({
  base: 'courses',
  table: 'training_courses',
  columns: {
    title: 'title',
    objective: 'objective',
    audience: 'audience',
    duration: 'duration',
    modalities: 'modalities',
    priceText: 'price_text',
    sortOrder: 'sort_order',
    isPublished: 'is_published',
  },
  schema: courseSchema,
  mapper: toCourse,
  orderBy: 'sort_order ASC, title ASC',
  singletonKey: 'course',
})

// --- Paramètres du site ----------------------------------------------------

adminRouter.get('/api/admin/settings', async (ctx) => {
  await guard(ctx)
  json(ctx.res, 200, { settings: await getAllSettings() })
})

adminRouter.put('/api/admin/settings', async (ctx) => {
  await guard(ctx)
  const body = await readJson(ctx.req)
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new HttpError(422, 'Format de paramètres invalide.', 'validation_error')
  }
  const entries = body as Record<string, unknown>
  const allowed = /^[a-z0-9_]{2,64}$/
  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(entries)) {
    if (!allowed.test(key)) continue
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && key !== 'values_json') {
      throw new HttpError(422, `Paramètre ${key} invalide.`, 'validation_error')
    }
    clean[key] = value
  }
  if (Object.keys(clean).length === 0) throw new HttpError(400, 'Aucun paramètre à enregistrer.', 'empty_update')
  await saveSettings(clean)
  json(ctx.res, 200, { settings: await getAllSettings() })
})

// --- Utilisateurs administrateurs (superadmin) -----------------------------

adminRouter.get('/api/admin/users', async (ctx) => {
  await guard(ctx)
  const rows = await query(`SELECT id, email, full_name, role, is_active, last_login_at FROM admin_users ORDER BY created_at ASC`)
  json(ctx.res, 200, { users: rows.map(toAdminUser) })
})

adminRouter.post('/api/admin/users', async (ctx) => {
  await guard(ctx, 'superadmin')
  const parsed = adminInviteSchema.safeParse(await readJson(ctx.req))
  if (!parsed.success) {
    throw new HttpError(422, 'Données invalides.', 'validation_error', parsed.error.flatten().fieldErrors)
  }
  const { email, full_name, password, role } = parsed.data
  const existing = await queryOne(`SELECT id FROM admin_users WHERE lower(email) = lower($1)`, [email])
  if (existing) throw new HttpError(409, 'Un compte existe déjà avec cette adresse e-mail.', 'duplicate')
  const row = await queryOne(
    `INSERT INTO admin_users (email, full_name, password_hash, role)
     VALUES (lower($1), $2, $3, $4)
     RETURNING id, email, full_name, role, is_active, last_login_at`,
    [email, full_name, hashPassword(password), role],
  )
  json(ctx.res, 201, { user: toAdminUser(row as Record<string, unknown>) })
})

adminRouter.patch('/api/admin/users/:id', async (ctx) => {
  const me = await guard(ctx, 'superadmin')
  const body = (await readJson(ctx.req)) as { isActive?: boolean; role?: 'admin' | 'superadmin'; resetTokenVersion?: boolean }
  if (body.isActive === false && ctx.params.id === me.id) {
    throw new HttpError(400, 'Vous ne pouvez pas désactiver votre propre compte.', 'self_lockout')
  }
  if (body.role && ctx.params.id === me.id && body.role !== 'superadmin') {
    throw new HttpError(400, 'Vous ne pouvez pas retirer votre propre rôle super administrateur.', 'self_lockout')
  }
  const row = await queryOne(
    `UPDATE admin_users SET
        is_active = COALESCE($2, is_active),
        role = COALESCE($3, role),
        token_version = CASE WHEN $4::boolean THEN token_version + 1 ELSE token_version END
      WHERE id = $1
      RETURNING id, email, full_name, role, is_active, last_login_at`,
    [ctx.params.id, body.isActive ?? null, body.role ?? null, body.resetTokenVersion === true],
  )
  if (!row) throw new HttpError(404, 'Utilisateur introuvable.', 'not_found')
  json(ctx.res, 200, { user: toAdminUser(row as Record<string, unknown>) })
})
