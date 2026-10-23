/**
 * Authentification de l'espace d'administration.
 */
import { query, queryOne } from '../db.js'
import { HttpError, json, readJson, clientIp, sameOrigin, parseCookies } from '../http.js'
import { Router } from '../router.js'
import { loginSchema } from '../validators.js'
import {
  SESSION_COOKIE,
  checkLoginThrottle,
  clearLoginFailures,
  createSessionToken,
  expiredSessionCookie,
  getCurrentAdmin,
  registerLoginFailure,
  sessionCookie,
  verifyPassword,
} from '../auth.js'
import { enforceRateLimit } from '../security.js'

export const authRouter = new Router()

authRouter.post('/api/auth/login', async ({ req, res }) => {
  if (!sameOrigin(req)) throw new HttpError(403, 'Origine non autorisée.', 'bad_origin')

  const ip = clientIp(req)
  checkLoginThrottle(`ip:${ip}`)
  await enforceRateLimit(`login:${ip}`, 20, 900)

  const parsed = loginSchema.safeParse(await readJson(req))
  if (!parsed.success) {
    throw new HttpError(422, 'Identifiants invalides.', 'validation_error')
  }
  const { email, password } = parsed.data

  const user = await queryOne<{
    id: string
    email: string
    full_name: string
    role: 'admin' | 'superadmin'
    password_hash: string
    is_active: boolean
    token_version: number
  }>(`SELECT * FROM admin_users WHERE lower(email) = lower($1)`, [email])

  // Message identique dans tous les cas : on n'indique jamais si l'e-mail existe.
  const invalid = new HttpError(401, 'E-mail ou mot de passe incorrect.', 'invalid_credentials')
  if (!user || !user.is_active) {
    registerLoginFailure(`ip:${ip}`)
    registerLoginFailure(`email:${email.toLowerCase()}`)
    throw invalid
  }
  checkLoginThrottle(`email:${email.toLowerCase()}`)
  if (!verifyPassword(password, user.password_hash)) {
    registerLoginFailure(`ip:${ip}`)
    registerLoginFailure(`email:${email.toLowerCase()}`)
    throw invalid
  }

  clearLoginFailures(`ip:${ip}`)
  clearLoginFailures(`email:${email.toLowerCase()}`)

  await query(`UPDATE admin_users SET last_login_at = now() WHERE id = $1`, [user.id])

  const token = createSessionToken({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    token_version: user.token_version,
  })
  res.setHeader('Set-Cookie', sessionCookie(token))
  json(res, 200, {
    admin: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
  })
})

authRouter.post('/api/auth/logout', async ({ res }) => {
  res.setHeader('Set-Cookie', expiredSessionCookie())
  json(res, 200, { ok: true })
})

authRouter.get('/api/auth/me', async ({ req, res }) => {
  const cookies = parseCookies(req.headers.cookie)
  if (!cookies[SESSION_COOKIE]) return json(res, 200, { admin: null })
  const admin = await getCurrentAdmin(req)
  json(res, 200, { admin: admin ?? null, authenticated: Boolean(admin) })
})
