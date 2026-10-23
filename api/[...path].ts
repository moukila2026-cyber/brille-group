/**
 * Compatibilité : délègue au point d'entrée unique `api/index.ts`.
 * Sur Vercel, `vercel.json` redirige toutes les routes `/api/*` vers `/api/index`.
 */
export { default } from './index.js'
