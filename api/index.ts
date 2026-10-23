/**
 * Point d'entrée unique des fonctions serverless Vercel pour /api/*.
 *
 * Sur un projet Vite (hors Next.js), un fichier dynamique `api/[...path].ts`
 * ne capture qu'un seul segment d'URL sur Vercel (/api/health fonctionne,
 * mais /api/public/site ou /api/auth/login renvoient 404 plateforme).
 * La réécriture `/api/(.*) -> /api/index?__bg_path=/api/$1` dans vercel.json
 * achemine 100 % des routes /api/* vers ce handler tout en préservant le
 * chemin exact et tous les paramètres de requête d'origine.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleApi } from '../server/app.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const parsed = new URL(req.url ?? '/', 'http://localhost')
  const rewrittenPath = parsed.searchParams.get('__bg_path')
  if (rewrittenPath) {
    parsed.searchParams.delete('__bg_path')
    const normalizedPath = rewrittenPath.startsWith('/') ? rewrittenPath : `/${rewrittenPath}`
    const queryString = parsed.searchParams.toString()
    req.url = queryString ? `${normalizedPath}?${queryString}` : normalizedPath
  }

  const handled = await handleApi(req, res)
  if (!handled) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Ressource introuvable.', code: 'not_found' }))
  }
}
