/**
 * Chargement et validation des variables d'environnement.
 * Aucune valeur secrète n'est jamais importée côté navigateur :
 * ce module n'est utilisé que par le serveur (server/) et les scripts.
 */
import fs from 'node:fs'
import path from 'node:path'

/** Chargement minimal d'un fichier .env (sans dépendance externe). */
function loadDotEnv() {
  const file = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(file)) return
  const raw = fs.readFileSync(file, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

loadDotEnv()

function required(name: string): string {
  const value = process.env[name]
  if (!value || value.trim() === '') {
    throw new Error(
      `[config] Variable d'environnement manquante : ${name}. ` +
        `Copiez .env.example vers .env et renseignez-la (ou configurez-la sur Vercel).`,
    )
  }
  return value
}

export const env = {
  get databaseUrl() {
    return required('DATABASE_URL')
  },
  get authSecret() {
    const secret = required('AUTH_SECRET')
    if (secret.length < 32) {
      throw new Error(
        "[config] AUTH_SECRET trop court (32 caractères minimum). Générez-en un avec : node -e \"console.log(require('crypto').randomBytes(48).toString('base64url'))\"",
      )
    }
    return secret
  },
  get siteUrl() {
    return (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
  },
  get isProd() {
    return process.env.NODE_ENV === 'production'
  },
  get formMinDelayMs() {
    const n = Number(process.env.FORM_MIN_DELAY_MS ?? 1500)
    return Number.isFinite(n) && n >= 0 ? n : 1500
  },
  /** En local, on accepte l'absence de DATABASE_URL uniquement pour /api/health. */
  hasDatabase() {
    return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim())
  },
}
