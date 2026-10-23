/**
 * Fonction serverless Vercel : toutes les requêtes /api/* arrivent ici.
 * Runtime Node.js (pas Edge) car on utilise le pool TCP de `pg`.
 * Aucun type propriétaire Vercel n'est importé : l'entrée/sortie est
 * strictement celle de Node (IncomingMessage / ServerResponse).
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleApi } from '../server/app.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const handled = await handleApi(req, res)
  if (!handled) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Ressource introuvable.', code: 'not_found' }))
  }
}
