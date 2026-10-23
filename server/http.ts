/**
 * Petits utilitaires HTTP partagés par l'API (aucune dépendance externe).
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import crypto from 'node:crypto'
import { env } from './env.js'

export type Req = IncomingMessage & { body?: unknown }
export type Res = ServerResponse

export class HttpError extends Error {
  status: number
  code: string
  details?: unknown
  constructor(status: number, message: string, code = 'error', details?: unknown) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export function json(res: Res, status: number, data: unknown) {
  const payload = JSON.stringify(data)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(payload)
}

export function noContent(res: Res) {
  res.statusCode = 204
  res.end()
}

export async function readJson(req: Req, maxBytes = 64 * 1024): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > maxBytes) {
        reject(new HttpError(413, 'Charge utile trop volumineuse.', 'payload_too_large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (chunks.length === 0) return resolve({})
      const raw = Buffer.concat(chunks).toString('utf8')
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new HttpError(400, 'Corps de requête JSON invalide.', 'invalid_json'))
      }
    })
    req.on('error', () => reject(new HttpError(400, 'Requête illisible.', 'bad_request')))
  })
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const key = part.slice(0, idx).trim()
    const value = part.slice(idx + 1).trim()
    if (key) out[key] = decodeURIComponent(value)
  }
  return out
}

export function serializeCookie(
  name: string,
  value: string,
  options: { maxAge?: number; path?: string; httpOnly?: boolean; secure?: boolean; sameSite?: 'Lax' | 'Strict' | 'None' } = {},
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`]
  parts.push(`Path=${options.path ?? '/'}`)
  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(options.maxAge)}`)
  if (options.httpOnly !== false) parts.push('HttpOnly')
  if (options.secure ?? env.isProd) parts.push('Secure')
  parts.push(`SameSite=${options.sameSite ?? 'Lax'}`)
  return parts.join('; ')
}

export function clearCookie(name: string): string {
  return serializeCookie(name, '', { maxAge: 0 })
}

/** IP du client, normalisée (Vercel renseigne x-forwarded-for). */
export function clientIp(req: IncomingMessage): string {
  const header = req.headers['x-forwarded-for']
  const raw = Array.isArray(header) ? header[0] : header
  const ip = (raw ?? '').split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'
  return ip
}

/** Empreinte non réversible de l'IP : sert au comptage anti-spam uniquement. */
export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(`brille:${ip}`).digest('hex').slice(0, 32)
}

export function sameOrigin(req: IncomingMessage): boolean {
  const origin = req.headers.origin
  if (!origin) return true // requêtes serveur / formulaires non navigateur
  try {
    const originHost = new URL(origin).host
    const host = (req.headers['x-forwarded-host'] as string | undefined) ?? req.headers.host
    if (!host) return false
    if (originHost === host) return true
    // domaine personnalisé vs URL de préversion Vercel
    const allowed = new Set(
      [env.siteUrl, process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '']
        .filter(Boolean)
        .map((u) => new URL(u).host),
    )
    return allowed.has(originHost)
  } catch {
    return false
  }
}
