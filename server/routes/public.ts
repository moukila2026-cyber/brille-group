/**
 * API publique (lecture des contenus publiés + dépôt des formulaires).
 * Toutes les autorisations sont vérifiées ici, côté serveur.
 */
import { query, queryOne } from '../db.js'
import { getPublicSettings } from '../settings.js'
import { HttpError, json, readJson, clientIp, sameOrigin, hashIp } from '../http.js'
import { Router } from '../router.js'
import {
  quoteSchema,
  contactSchema,
  registrationSchema,
} from '../validators.js'
import {
  toCourse,
  toProperty,
  toProject,
  toService,
} from '../mappers.js'
import { antiSpamChecks, enforceRateLimit, publicFormKey } from '../security.js'

export const publicRouter = new Router()

// --- Contenus --------------------------------------------------------------

publicRouter.get('/api/public/site', async ({ res }) => {
  const [settings, services, flags, caches] = await Promise.all([
    getPublicSettings(),
    query(
      `SELECT * FROM services WHERE is_published = true ORDER BY sort_order ASC, title ASC`,
    ),
    queryOne<{ properties: string; projects: string; courses: string }>(
      `SELECT
         (SELECT count(*)::text FROM properties WHERE is_published = true) AS properties,
         (SELECT count(*)::text FROM projects WHERE is_published = true) AS projects,
         (SELECT count(*)::text FROM training_courses WHERE is_published = true) AS courses`,
    ),
    Promise.resolve(null),
  ])
  void caches

  const whatsapp = String(settings.whatsapp_number ?? '').replace(/[^0-9]/g, '')
  json(res, 200, {
    settings,
    services: services.map(toService),
    capabilities: {
      hasProperties: Number(flags?.properties ?? 0) > 0,
      hasProjects: Number(flags?.projects ?? 0) > 0,
      hasCourses: Number(flags?.courses ?? 0) > 0,
      whatsappConfigured: whatsapp.length >= 8 && settings.whatsapp_enabled === true,
    },
  })
})

publicRouter.get('/api/public/services', async ({ res }) => {
  const rows = await query(`SELECT * FROM services WHERE is_published = true ORDER BY sort_order ASC`)
  json(res, 200, { services: rows.map(toService) })
})

publicRouter.get('/api/public/services/:slug', async ({ res, params }) => {
  const row = await queryOne(`SELECT * FROM services WHERE slug = $1 AND is_published = true`, [params.slug])
  if (!row) throw new HttpError(404, 'Service introuvable.', 'not_found')
  json(res, 200, { service: toService(row) })
})

publicRouter.get('/api/public/properties', async ({ res, url }) => {
  const filters: string[] = ['is_published = true']
  const params: unknown[] = []

  const type = url.searchParams.get('type')
  if (type) {
    params.push(type)
    filters.push(`property_type = $${params.length}`)
  }
  const status = url.searchParams.get('status')
  if (status) {
    params.push(status)
    filters.push(`status = $${params.length}`)
  }
  const location = url.searchParams.get('location')
  if (location) {
    params.push(`%${location}%`)
    filters.push(`location ILIKE $${params.length}`)
  }
  const minArea = Number(url.searchParams.get('minArea'))
  if (Number.isFinite(minArea) && minArea > 0) {
    params.push(minArea)
    filters.push(`area_sqm >= $${params.length}`)
  }
  const maxArea = Number(url.searchParams.get('maxArea'))
  if (Number.isFinite(maxArea) && maxArea > 0) {
    params.push(maxArea)
    filters.push(`area_sqm <= $${params.length}`)
  }
  const minPrice = Number(url.searchParams.get('minPrice'))
  if (Number.isFinite(minPrice) && minPrice > 0) {
    params.push(minPrice)
    filters.push(`price_fcfa >= $${params.length}`)
  }
  const maxPrice = Number(url.searchParams.get('maxPrice'))
  if (Number.isFinite(maxPrice) && maxPrice > 0) {
    params.push(maxPrice)
    filters.push(`price_fcfa <= $${params.length}`)
  }

  const rows = await query(
    `SELECT * FROM properties WHERE ${filters.join(' AND ')}
     ORDER BY (status = 'disponible') DESC, created_at DESC LIMIT 60`,
    params,
  )
  json(res, 200, { properties: rows.map(toProperty) })
})

publicRouter.get('/api/public/properties/:idOrRef', async ({ res, params }) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.idOrRef)
  const row = await queryOne(
    isUuid
      ? `SELECT * FROM properties WHERE id = $1 AND is_published = true`
      : `SELECT * FROM properties WHERE lower(reference) = lower($1) AND is_published = true`,
    [params.idOrRef],
  )
  if (!row) throw new HttpError(404, 'Annonce introuvable.', 'not_found')
  json(res, 200, { property: toProperty(row) })
})

publicRouter.get('/api/public/projects', async ({ res, url }) => {
  const category = url.searchParams.get('category')
  const rows = category
    ? await query(
        `SELECT * FROM projects WHERE is_published = true AND category = $1 ORDER BY sort_order ASC, created_at DESC`,
        [category],
      )
    : await query(`SELECT * FROM projects WHERE is_published = true ORDER BY sort_order ASC, created_at DESC`)
  json(res, 200, { projects: rows.map(toProject) })
})

publicRouter.get('/api/public/courses', async ({ res }) => {
  const rows = await query(
    `SELECT * FROM training_courses WHERE is_published = true ORDER BY sort_order ASC, title ASC`,
  )
  json(res, 200, { courses: rows.map(toCourse) })
})

// --- Formulaires publics ---------------------------------------------------

publicRouter.post('/api/public/quotes', async ({ req, res }) => {
  if (!sameOrigin(req)) throw new HttpError(403, 'Origine non autorisée.', 'bad_origin')
  const ip = clientIp(req)
  await enforceRateLimit(publicFormKey('quote', ip), 6, 3600)

  const parsed = quoteSchema.safeParse(await readJson(req))
  if (!parsed.success) {
    throw new HttpError(422, 'Certains champs sont invalides.', 'validation_error', parsed.error.flatten().fieldErrors)
  }
  const data = parsed.data
  antiSpamChecks(data)

  // Doublon probable (même téléphone + même description dans les 10 minutes)
  const duplicate = await queryOne(
    `SELECT id FROM quote_requests
      WHERE phone = $1 AND description = $2 AND created_at > now() - interval '10 minutes'`,
    [data.phone, data.description],
  )
  if (duplicate) {
    throw new HttpError(
      409,
      'Nous avons déjà reçu cette demande il y a quelques instants. Notre équipe vous répondra rapidement.',
      'duplicate',
    )
  }

  const row = await queryOne<{ reference: string; created_at: Date }>(
    `INSERT INTO quote_requests
       (reference, full_name, phone, email, service_type, location, budget, timeline,
        description, source_page, ip_hash)
     VALUES (
       'DEV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('quote_reference_seq')::text, 4, '0'),
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
     )
     RETURNING reference, created_at`,
    [
      data.full_name,
      data.phone,
      data.email,
      data.service_type,
      data.location,
      data.budget,
      data.timeline,
      data.description,
      data.source_page,
      hashIp(ip),
    ],
  )

  json(res, 201, {
    ok: true,
    reference: row?.reference,
    message:
      'Votre demande de devis a bien été enregistrée. Notre équipe vous contactera pour préciser votre besoin.',
  })
})

publicRouter.post('/api/public/contact', async ({ req, res }) => {
  if (!sameOrigin(req)) throw new HttpError(403, 'Origine non autorisée.', 'bad_origin')
  const ip = clientIp(req)
  await enforceRateLimit(publicFormKey('contact', ip), 8, 3600)

  const parsed = contactSchema.safeParse(await readJson(req))
  if (!parsed.success) {
    throw new HttpError(422, 'Certains champs sont invalides.', 'validation_error', parsed.error.flatten().fieldErrors)
  }
  const data = parsed.data
  antiSpamChecks(data)

  await query(
    `INSERT INTO contact_messages (name, phone, email, subject, message)
     VALUES ($1, $2, $3, $4, $5)`,
    [data.name, data.phone ?? '', data.email, data.subject, data.message],
  )
  json(res, 201, { ok: true, message: 'Votre message a bien été envoyé. Merci de nous avoir contactés.' })
})

publicRouter.post('/api/public/registrations', async ({ req, res }) => {
  if (!sameOrigin(req)) throw new HttpError(403, 'Origine non autorisée.', 'bad_origin')
  const ip = clientIp(req)
  await enforceRateLimit(publicFormKey('registration', ip), 8, 3600)

  const parsed = registrationSchema.safeParse(await readJson(req))
  if (!parsed.success) {
    throw new HttpError(422, 'Certains champs sont invalides.', 'validation_error', parsed.error.flatten().fieldErrors)
  }
  const data = parsed.data
  antiSpamChecks(data)

  let courseTitle = data.course_title
  if (data.course_id) {
    const course = await queryOne<{ title: string }>(
      `SELECT title FROM training_courses WHERE id = $1 AND is_published = true`,
      [data.course_id],
    )
    if (course) courseTitle = course.title
  }

  await query(
    `INSERT INTO training_registrations (course_id, course_title, full_name, phone, email, message)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [data.course_id ?? null, courseTitle, data.full_name, data.phone, data.email, data.message],
  )
  json(res, 201, {
    ok: true,
    message: 'Votre demande a bien été transmise. Nous vous recontacterons pour les modalités.',
  })
})
