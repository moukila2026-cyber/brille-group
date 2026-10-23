/**
 * Point d'entrée unique de l'API.
 * Utilisé par :
 *  - le serveur de développement local (server/dev.ts) ;
 *  - la fonction serverless Vercel (api/[...path].ts).
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { Router } from './router.js'
import { publicRouter } from './routes/public.js'
import { authRouter } from './routes/auth.js'
import { adminRouter } from './routes/admin.js'
import { HttpError, json } from './http.js'
import { queryOne } from './db.js'

const root = new Router()

root.get('/api/health', async ({ res }) => {
  let db: 'up' | 'down' = 'down'
  try {
    const row = await queryOne<{ ok: number }>('SELECT 1 AS ok')
    db = row?.ok === 1 ? 'up' : 'down'
  } catch {
    db = 'down'
  }
  json(res, db === 'up' ? 200 : 503, {
    ok: db === 'up',
    database: db,
    timestamp: new Date().toISOString(),
  })
})

const trim = (path: string) => path.replace(/\/+$/, '') || '/'

export async function handleApi(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const host = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost'
  const url = new URL(req.url ?? '/', `http://${host}`)
  const pathname = trim(url.pathname)

  if (!pathname.startsWith('/api')) return false

  const method = (req.method ?? 'GET').toUpperCase()

  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('X-Frame-Options', 'DENY')

  try {
    for (const router of [root, publicRouter, authRouter, adminRouter]) {
      const handled = await router.dispatch(method, pathname, req, res, url)
      if (handled) return true
    }
    throw new HttpError(404, 'Ressource introuvable.', 'not_found')
  } catch (error) {
    if (error instanceof HttpError) {
      json(res, error.status, {
        error: error.message,
        code: error.code,
        ...(error.details ? { fields: error.details } : {}),
      })
      return true
    }
    // On journalise côté serveur uniquement : aucun détail technique au client.
    console.error('[api] erreur inattendue', error instanceof Error ? error.stack : error)
    json(res, 500, {
      error: 'Une erreur interne est survenue. Merci de réessayer ou de nous appeler.',
      code: 'internal_error',
    })
    return true
  }
}
