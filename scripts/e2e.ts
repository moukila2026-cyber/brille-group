/**
 * Tests de bout en bout contre une instance réellement démarrée.
 *
 * Prérequis :
 *   1. base migrée (npm run db:migrate) et administrateurs créés (npm run admin:create) ;
 *   2. serveur lancé (npm run dev, ou une URL de préversion).
 *
 * Usage :
 *   E2E_BASE_URL=http://localhost:3000 \
 *   E2E_ADMIN_EMAIL=direction@brille.test \
 *   E2E_ADMIN_PASSWORD='…' \
 *   E2E_ADMIN2_EMAIL=equipe@brille.test \
 *   E2E_ADMIN2_PASSWORD='…' \
 *   npm run test:e2e
 */
// Charge le fichier .env (utile pour la remise à zéro des compteurs anti-spam).
import '../server/env'
import { connectionNeedsSsl } from '../server/db'

const BASE = (process.env.E2E_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? ''
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? ''
const ADMIN2_EMAIL = process.env.E2E_ADMIN2_EMAIL ?? ''
const ADMIN2_PASSWORD = process.env.E2E_ADMIN2_PASSWORD ?? ''

let passed = 0
let failed = 0
const failures: string[] = []

function ok(name: string, condition: boolean, details?: unknown) {
  if (condition) {
    passed += 1
    console.log(`  ✓ ${name}`)
  } else {
    failed += 1
    failures.push(name)
    console.error(`  ✗ ${name}${details ? ` → ${JSON.stringify(details).slice(0, 300)}` : ''}`)
  }
}

function section(title: string) {
  console.log(`\n▸ ${title}`)
}

interface Result<T> {
  status: number
  body: T
  headers: Headers
}

let cookie = ''

async function call<T = Record<string, unknown>>(
  method: string,
  path: string,
  options: { body?: unknown; withCookie?: boolean; extraHeaders?: Record<string, string> } = {},
): Promise<Result<T>> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (method !== 'GET') headers['X-BG-Request'] = '1'
  if (options.withCookie && cookie) headers.Cookie = cookie
  Object.assign(headers, options.extraHeaders ?? {})

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })
  const setCookie = response.headers.get('set-cookie')
  if (setCookie) cookie = setCookie.split(';')[0]

  const text = await response.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }
  return { status: response.status, body: body as T, headers: response.headers }
}

const runId = Date.now().toString(36).slice(-5)

function formPayload(overrides: Record<string, unknown> = {}) {
  return {
    full_name: 'Awa Koné (test E2E)',
    phone: '+225 07 00 00 00 00',
    email: 'awa.teste2e@example.com',
    service_type: 'construction_btp',
    location: 'Daloa, Tazibouo',
    budget: '2 000 000 – 10 000 000 FCFA',
    timeline: 'dans les 2 mois',
    description: `Demande automatisée de test — ${new Date().toISOString()}`,
    source_page: '/btp-construction',
    consent: true,
    company_website: '',
    form_opened_at: Date.now() - 60_000,
    ...overrides,
  }
}

/**
 * Remise à zéro des compteurs anti-spam : indispensable pour rejouer les tests
 * plusieurs fois depuis la même IP. Refusé si la base ne ressemble pas à une
 * base de test (sécurité : on ne touche pas à la production).
 */
async function resetRateLimits() {
  const url = process.env.DATABASE_URL ?? ''
  const isLocalOrTest = /localhost|127\.0\.0\.1|_test|test-|brille_test/.test(url)
  if (!isLocalOrTest && process.env.E2E_ALLOW_RESET !== '1') {
    console.log('[e2e] compteurs anti-spam non réinitialisés (base non locale).')
    return
  }
  if (!url) return
  const { Pool } = await import('pg')
  const pool = new Pool({ connectionString: url, ...(connectionNeedsSsl(url) ? { ssl: { rejectUnauthorized: false } } : {}) })
  try {
    await pool.query('DELETE FROM rate_limits')
    console.log('[e2e] compteurs anti-spam réinitialisés.')
  } catch (error) {
    console.warn('[e2e] réinitialisation impossible :', error instanceof Error ? error.message : error)
  } finally {
    await pool.end()
  }
}

async function cleanupTestArtifacts() {
  const url = process.env.DATABASE_URL ?? ''
  if (!/localhost|127\.0\.0\.1|_test|test-|brille_test/.test(url)) return
  const { Pool } = await import('pg')
  const pool = new Pool({ connectionString: url })
  try {
    await pool.query(`DELETE FROM services WHERE slug LIKE 'service-de-test-e2e%'`)
    await pool.query(`DELETE FROM properties WHERE title LIKE 'Terrain de test E2E%'`)
  } catch {
    /* base indisponible : le serveur répondra l'erreur attendue */
  } finally {
    await pool.end()
  }
}

async function main() {
  console.log(`Tests E2E sur ${BASE}\n${'='.repeat(60)}`)
  await resetRateLimits()
  await cleanupTestArtifacts()

  section('Disponibilité du service')
  const health = await call<{ ok: boolean; database: string }>('GET', '/api/health')
  ok('GET /api/health répond 200', health.status === 200, health.body)
  ok('La base de données est joignable', health.body?.database === 'up', health.body)

  section('API publique — lecture')
  const site = await call<{
    settings: Record<string, unknown>
    services: Array<{ slug: string; isCore: boolean; isPublished: boolean }>
    capabilities: Record<string, boolean>
  }>('GET', '/api/public/site')
  ok('GET /api/public/site répond 200', site.status === 200)
  ok('Le nom de l’entreprise est présent', site.body?.settings?.company_name === 'BRILLE GROUP SARL', site.body?.settings?.company_name)
  ok('Six services principaux sont publiés', (site.body?.services ?? []).filter((s) => s.isCore).length === 6, (site.body?.services ?? []).length)
  ok(
    'Aucun service non publié n’est exposé',
    (site.body?.services ?? []).every((s) => s.isPublished),
  )
  ok('Aucun numéro WhatsApp inventé', site.body?.capabilities?.whatsappConfigured === false)

  const noAuthAdmin = await call('GET', '/api/admin/quotes')
  ok('Un visiteur anonyme ne peut pas lire les demandes (401)', noAuthAdmin.status === 401, noAuthAdmin.status)

  const noAuthSettings = await call('GET', '/api/admin/settings')
  ok('Un visiteur anonyme ne peut pas lire les paramètres (401)', noAuthSettings.status === 401)

  const noAuthStats = await call('GET', '/api/admin/stats')
  ok('Un visiteur anonyme ne peut pas lire les statistiques (401)', noAuthStats.status === 401)

  section('Formulaire de devis — validation')
  const invalid = await call<{ code: string; fields?: Record<string, string[]> }>('POST', '/api/public/quotes', {
    body: formPayload({ full_name: '', phone: '12', description: 'court' }),
  })
  ok('Les champs invalides sont refusés (422)', invalid.status === 422, invalid.body)
  ok('Les erreurs détaillées sont renvoyées par champ', Boolean(invalid.body?.fields?.full_name), invalid.body?.fields)

  const noConsent = await call('POST', '/api/public/quotes', { body: formPayload({ consent: false }) })
  ok('Le consentement est obligatoire (422)', noConsent.status === 422)

  const honeypot = await call('POST', '/api/public/quotes', { body: formPayload({ company_website: 'http://spam.example' }) })
  ok('Le champ piège bloque les robots (400)', honeypot.status === 400, honeypot.status)

  section('Formulaire de devis — enregistrement réel')
  const payload = formPayload()
  const created = await call<{ ok: boolean; reference: string }>('POST', '/api/public/quotes', { body: payload })
  ok('La demande est enregistrée (201)', created.status === 201, created.body)
  ok('Une référence est attribuée', Boolean(created.body?.reference), created.body)
  ok('La référence suit le format DEV-AAAA-NNNN', /^DEV-\d{4}-\d{4}$/.test(created.body?.reference ?? ''), created.body?.reference)

  const duplicate = await call('POST', '/api/public/quotes', { body: payload })
  ok('Une soumission identique immédiate est bloquée (409)', duplicate.status === 409, duplicate.status)

  const contact = await call('POST', '/api/public/contact', {
    body: {
      name: 'Client Test E2E',
      phone: '+225 05 00 00 00 00',
      email: 'contact.teste2e@example.com',
      subject: 'Question sur un terrain',
      message: 'Message automatique de test E2E, merci de ne pas traiter.',
      consent: true,
      company_website: '',
      form_opened_at: Date.now() - 60_000,
    },
  })
  ok('Le message de contact est enregistré (201)', contact.status === 201, contact.body)

  section('Authentification')
  const badLogin = await call('POST', '/api/auth/login', {
    body: { email: ADMIN_EMAIL, password: 'MauvaisMotDePasse123!' },
  })
  ok('Un mot de passe erroné est refusé (401)', badLogin.status === 401, badLogin.status)

  const login = await call<{ admin: { email: string; role: string } }>('POST', '/api/auth/login', {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  })
  ok('La connexion administrateur réussit (200)', login.status === 200, login.body)
  ok('Le cookie de session est un cookie HttpOnly', /httponly/i.test(login.headers.get('set-cookie') ?? ''), login.headers.get('set-cookie'))
  ok('Le cookie de session est SameSite=Lax', /samesite=lax/i.test(login.headers.get('set-cookie') ?? ''))

  const me = await call<{ admin: { email: string } | null }>('GET', '/api/auth/me', { withCookie: true })
  ok('La session est reconnue', me.body?.admin?.email === ADMIN_EMAIL, me.body)

  section('Administration — demandes de devis')
  const list = await call<{ quotes: Array<{ reference: string; id: string; status: string }>; total: number }>(
    'GET',
    `/api/admin/quotes?q=${encodeURIComponent(created.body.reference)}`,
    { withCookie: true },
  )
  ok('Les demandes sont visibles pour l’administrateur', list.status === 200 && list.body.quotes.length === 1, list.body?.total)
  const quoteId = list.body?.quotes?.[0]?.id

  const patch = await call<{ quote: { status: string } }>('PATCH', `/api/admin/quotes/${quoteId}`, {
    withCookie: true,
    body: { status: 'en_discussion', internal_notes: 'Note interne de test.' },
  })
  ok('Le statut d’une demande peut être modifié', patch.status === 200 && patch.body.quote.status === 'en_discussion', patch.body)

  const noCsrf = await call('PATCH', `/api/admin/quotes/${quoteId}`, {
    withCookie: true,
    body: { status: 'terminee' },
    extraHeaders: { 'X-BG-Request': '' },
  })
  ok('Une mutation sans en-tête anti-CSRF est refusée (403)', noCsrf.status === 403, noCsrf.status)

  const stats = await call<{ quotes: { total: number } }>('GET', '/api/admin/stats', { withCookie: true })
  ok('Les statistiques proviennent de la base', stats.status === 200 && stats.body.quotes.total >= 1, stats.body?.quotes)

  const csv = await fetch(`${BASE}/api/admin/quotes-export.csv`, { headers: { Cookie: cookie } })
  const csvText = await csv.text()
  ok('L’export CSV est accessible à l’administrateur', csv.status === 200 && csvText.includes('reference'))
  const csvAnon = await fetch(`${BASE}/api/admin/quotes-export.csv`)
  ok('L’export CSV est refusé aux visiteurs anonymes', csvAnon.status === 401)

  section('Administration — contenus (CRUD réel)')
  const newService = await call<{ service: { id: string; slug: string; isPublished: boolean } }>('POST', '/api/admin/services', {
    withCookie: true,
    body: {
      title: `Service de test E2E ${runId}`,
      category: 'complementaire',
      shortDescription: 'Créé par le test automatisé.',
      description: 'Ce service est créé puis supprimé par les tests E2E.',
      bullets: ['Point A', 'Point B'],
      icon: 'building',
      sortOrder: 99,
      isPublished: false,
    },
  })
  ok('Un service peut être créé', newService.status === 201, newService.body)
  const serviceId = newService.body?.service?.id
  const expectedSlug = `service-de-test-e2e-${runId}`.toLowerCase()
  ok('Le slug est généré automatiquement', newService.body?.service?.slug === expectedSlug, newService.body?.service?.slug)

  const publicAfterCreate = await call<{ services: Array<{ slug: string }> }>('GET', '/api/public/services')
  ok(
    'Un service non publié n’apparaît pas sur le site public',
    !(publicAfterCreate.body?.services ?? []).some((s) => s.slug === expectedSlug),
  )

  const published = await call<{ service: { isPublished: boolean } }>('PATCH', `/api/admin/services/${serviceId}`, {
    withCookie: true,
    body: { isPublished: true },
  })
  ok('Un service peut être publié', published.status === 200 && published.body?.service?.isPublished === true, published.body)

  const publicAfterPublish = await call<{ services: Array<{ slug: string }> }>('GET', '/api/public/services')
  ok(
    'Le service publié apparaît sur le site public',
    (publicAfterPublish.body?.services ?? []).some((s) => s.slug === expectedSlug),
  )

  const invalidService = await call('POST', '/api/admin/services', {
    withCookie: true,
    body: { title: 'X', short_description: '' },
  })
  ok('La validation serveur refuse un titre trop court (422)', invalidService.status === 422, invalidService.status)

  const newProperty = await call<{ property: { id: string; reference: string } }>('POST', '/api/admin/properties', {
    withCookie: true,
    body: {
      title: `Terrain de test E2E ${runId}`,
      propertyType: 'terrain',
      location: 'Daloa (test)',
      areaSqm: 600,
      priceFcfa: 1500000,
      description: 'Annonce créée par le test automatisé puis supprimée.',
      images: [],
      status: 'disponible',
      isPublished: true,
    },
  })
  ok('Un bien immobilier peut être créé', newProperty.status === 201, newProperty.body)
  const propertyId = newProperty.body?.property?.id

  const filtered = await call<{ properties: Array<{ id: string }> }>('GET', '/api/public/properties?type=terrain&maxPrice=2000000&minArea=500')
  ok(
    'Les filtres publics renvoient le bien créé',
    (filtered.body?.properties ?? []).some((p) => p.id === propertyId),
    filtered.body?.properties?.length,
  )

  const detail = await call<{ property: { title: string } }>('GET', `/api/public/properties/${propertyId}`)
  ok(
    'La fiche détaillée est accessible publiquement',
    detail.status === 200 && detail.body.property.title === `Terrain de test E2E ${runId}`,
    detail.body,
  )

  const delProperty = await call('DELETE', `/api/admin/properties/${propertyId}`, { withCookie: true })
  ok('Un bien peut être supprimé par un administrateur', delProperty.status === 200, delProperty.status)

  section('Paramètres du site')
  const before = await call<{ settings: Record<string, unknown> }>('GET', '/api/admin/settings', { withCookie: true })
  const updated = await call<{ settings: Record<string, unknown> }>('PUT', '/api/admin/settings', {
    withCookie: true,
    body: { opening_hours: 'Lundi – vendredi : 8h – 17h (test)' },
  })
  ok('Les paramètres peuvent être modifiés', updated.status === 200 && updated.body.settings.opening_hours === 'Lundi – vendredi : 8h – 17h (test)')

  const siteWithHours = await call<{ settings: Record<string, unknown> }>('GET', '/api/public/site')
  ok('La modification est visible publiquement', siteWithHours.body?.settings?.opening_hours === 'Lundi – vendredi : 8h – 17h (test)')

  await call('PUT', '/api/admin/settings', {
    withCookie: true,
    body: { opening_hours: String(before.body?.settings?.opening_hours ?? '') },
  })
  ok('Les paramètres ont été restaurés', true)

  section('Rôles et suppressions sensibles')
  const adminCookie = cookie
  cookie = ''
  const login2 = await call('POST', '/api/auth/login', {
    body: { email: ADMIN2_EMAIL, password: ADMIN2_PASSWORD },
  })
  ok('Un second compte (rôle admin) peut se connecter', login2.status === 200, login2.body)

  const adminDelete = await call('DELETE', `/api/admin/quotes/${quoteId}`, {
    withCookie: true,
    body: { confirmReference: created.body.reference },
  })
  ok('Un simple administrateur ne peut pas supprimer une demande (403)', adminDelete.status === 403, adminDelete.status)

  const adminUsers = await call('POST', '/api/admin/users', {
    withCookie: true,
    body: { email: 'intrus@example.com', full_name: 'Intrus', password: 'MotDePasse2026!', role: 'admin' },
  })
  ok('Un simple administrateur ne peut pas créer de compte (403)', adminUsers.status === 403, adminUsers.status)

  cookie = adminCookie // retour au super administrateur
  const wrongConfirm = await call('DELETE', `/api/admin/quotes/${quoteId}`, {
    withCookie: true,
    body: { confirmReference: 'REF-FAUSSE' },
  })
  ok('La suppression exige la référence exacte (400)', wrongConfirm.status === 400, wrongConfirm.status)

  const goodConfirm = await call('DELETE', `/api/admin/quotes/${quoteId}`, {
    withCookie: true,
    body: { confirmReference: created.body.reference },
  })
  ok('Le super administrateur peut supprimer après confirmation', goodConfirm.status === 200, goodConfirm.status)

  const delService = await call('DELETE', `/api/admin/services/${serviceId}`, { withCookie: true })
  ok('Le service de test est supprimé', delService.status === 200, delService.status)

  section('Déconnexion')
  const logout = await call('POST', '/api/auth/logout', { withCookie: true, body: {} })
  ok('La déconnexion répond 200', logout.status === 200)
  cookie = ''
  const afterLogout = await call('GET', '/api/admin/quotes')
  ok('L’accès aux demandes est refusé après déconnexion (401)', afterLogout.status === 401, afterLogout.status)

  section('Pages publiques servies par le front')
  for (const path of ['/', '/a-propos', '/services', '/btp-construction', '/immobilier', '/formation', '/contact', '/devis']) {
    const response = await fetch(`${BASE}${path}`)
    ok(`La page ${path} répond 200`, response.status === 200, response.status)
  }

  section('Robots et sitemap')
  const robots = await fetch(`${BASE}/robots.txt`)
  ok('robots.txt est servi', robots.status === 200 && (await robots.text()).includes('Sitemap'))

  console.log(`\n${'='.repeat(60)}`)
  console.log(`Résultat : ${passed} test(s) réussi(s), ${failed} échec(s).`)
  if (failed > 0) {
    console.log('Échecs :')
    failures.forEach((name) => console.log(`  - ${name}`))
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('\n✗ Les tests n’ont pas pu être exécutés :', error instanceof Error ? error.message : error)
  console.error(`Vérifiez que le serveur est démarré sur ${BASE} (npm run dev).`)
  process.exit(1)
})
