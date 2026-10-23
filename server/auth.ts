/**
 * Authentification administrateur.
 *
 * - Mots de passe : scrypt (N=16384) + sel aléatoire, comparaison en temps constant.
 * - Session : jeton signé HMAC-SHA256 (équivalent JWT minimal), stocké dans un
 *   cookie HttpOnly / SameSite=Lax / Secure en production. Aucun jeton n'est
 *   exposé au JavaScript du navigateur, donc pas de vol via XSS.
 * - Révocation : le jeton embarque `ver` (token_version). Incrémenter cette
 *   colonne en base invalide immédiatement toutes les sessions de l'utilisateur.
 */
import crypto from 'node:crypto'
import type { IncomingMessage } from 'node:http'
import { env } from './env.js'
import { queryOne } from './db.js'
import { HttpError, parseCookies, serializeCookie, clearCookie } from './http.js'

export const SESSION_COOKIE = 'bg_admin_session'
export const SESSION_TTL_SECONDS = 8 * 60 * 60 // 8 h

export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'superadmin'
}

interface SessionPayload {
  sub: string
  email: string
  role: 'admin' | 'superadmin'
  ver: number
  iat: number
  exp: number
}

// --- Mots de passe ---------------------------------------------------------

const SCRYPT_N = 16384
const SCRYPT_KEYLEN = 64

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16)
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_N, r: 8, p: 1 })
  return `scrypt$${SCRYPT_N}$${salt.toString('hex')}$${hash.toString('hex')}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, nRaw, saltHex, hashHex] = stored.split('$')
    if (scheme !== 'scrypt') return false
    const salt = Buffer.from(saltHex, 'hex')
    const expected = Buffer.from(hashHex, 'hex')
    const actual = crypto.scryptSync(password, salt, expected.length, {
      N: Number(nRaw),
      r: 8,
      p: 1,
    })
    return crypto.timingSafeEqual(expected, actual)
  } catch {
    return false
  }
}

// --- Jetons de session -----------------------------------------------------

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url')
}

function sign(data: string): string {
  return crypto.createHmac('sha256', env.authSecret).update(data).digest('base64url')
}

export function createSessionToken(user: AdminUser & { token_version: number }): string {
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    ver: user.token_version,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  }
  const body = b64url(JSON.stringify(payload))
  return `${body}.${sign(body)}`
}

export function readSessionToken(token: string): SessionPayload | null {
  const [body, signature] = token.split('.')
  if (!body || !signature) return null
  const expected = sign(body)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload
    if (!payload.sub || !payload.exp) return null
    if (payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function sessionCookie(token: string): string {
  return serializeCookie(SESSION_COOKIE, token, {
    maxAge: SESSION_TTL_SECONDS,
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'Lax',
  })
}

export function expiredSessionCookie(): string {
  return clearCookie(SESSION_COOKIE)
}

// --- Résolution de l'utilisateur courant ----------------------------------

export async function getCurrentAdmin(req: IncomingMessage): Promise<AdminUser | null> {
  const cookies = parseCookies(req.headers.cookie)
  const token = cookies[SESSION_COOKIE]
  if (!token) return null
  const payload = readSessionToken(token)
  if (!payload) return null

  const row = await queryOne<{
    id: string
    email: string
    full_name: string
    role: 'admin' | 'superadmin'
    is_active: boolean
    token_version: number
  }>(
    `SELECT id, email, full_name, role, is_active, token_version
       FROM admin_users WHERE id = $1`,
    [payload.sub],
  )
  if (!row || !row.is_active || row.token_version !== payload.ver) return null
  return { id: row.id, email: row.email, full_name: row.full_name, role: row.role }
}

export async function requireAdmin(req: IncomingMessage): Promise<AdminUser> {
  const admin = await getCurrentAdmin(req)
  if (!admin) throw new HttpError(401, 'Authentification requise.', 'unauthorized')
  return admin
}

export async function requireSuperAdmin(req: IncomingMessage): Promise<AdminUser> {
  const admin = await requireAdmin(req)
  if (admin.role !== 'superadmin') {
    throw new HttpError(403, 'Action réservée au super administrateur.', 'forbidden')
  }
  return admin
}

// --- Anti-force brute ------------------------------------------------------

const loginAttempts = new Map<string, { count: number; resetAt: number }>()

export function checkLoginThrottle(key: string) {
  const now = Date.now()
  const entry = loginAttempts.get(key)
  if (entry && entry.resetAt > now && entry.count >= 8) {
    const retryIn = Math.ceil((entry.resetAt - now) / 1000)
    throw new HttpError(429, `Trop de tentatives. Réessayez dans ${retryIn} secondes.`, 'too_many_attempts')
  }
}

export function registerLoginFailure(key: string) {
  const now = Date.now()
  const entry = loginAttempts.get(key)
  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 })
  } else {
    entry.count += 1
  }
}

export function clearLoginFailures(key: string) {
  loginAttempts.delete(key)
}
