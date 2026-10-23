/**
 * Protection des formulaires publics : limitation de débit persistée en base
 * (la mémoire d'une fonction serverless n'est pas fiable) + contrôles anti-robot.
 */
import crypto from 'node:crypto'
import { queryOne, query } from './db.js'
import { HttpError, hashIp } from './http.js'
import { env } from './env.js'

/**
 * Incrémente un compteur pour `key` dans une fenêtre glissante et lève une
 * erreur 429 si le quota est dépassé.
 */
export async function enforceRateLimit(key: string, limit: number, windowSeconds: number) {
  const row = await queryOne<{ hits: number; window_start: Date }>(
    `INSERT INTO rate_limits (key, window_start, hits)
     VALUES ($1, now(), 1)
     ON CONFLICT (key) DO UPDATE SET
       hits = CASE WHEN rate_limits.window_start < now() - ($2 || ' seconds')::interval
                   THEN 1 ELSE rate_limits.hits + 1 END,
       window_start = CASE WHEN rate_limits.window_start < now() - ($2 || ' seconds')::interval
                           THEN now() ELSE rate_limits.window_start END
     RETURNING hits, window_start`,
    [key, String(windowSeconds)],
  )
  // purge opportuniste
  await query(`DELETE FROM rate_limits WHERE window_start < now() - interval '1 day'`).catch(() => undefined)
  if (row && row.hits > limit) {
    throw new HttpError(
      429,
      'Trop de demandes envoyées récemment. Merci de réessayer dans quelques minutes ou de nous appeler.',
      'rate_limited',
    )
  }
}

/** Contrôles anti-robot : honeypot + délai minimal de remplissage. */
export function antiSpamChecks(input: { company_website?: string; form_opened_at?: number }) {
  if (input.company_website && input.company_website.length > 0) {
    throw new HttpError(400, 'Requête refusée.', 'spam_detected')
  }
  if (input.form_opened_at) {
    const elapsed = Date.now() - input.form_opened_at
    if (elapsed < env.formMinDelayMs || elapsed > 6 * 60 * 60 * 1000) {
      throw new HttpError(
        400,
        'Formulaire soumis trop rapidement ou expiré. Merci de recharger la page et de réessayer.',
        'spam_detected',
      )
    }
  }
}

export function publicFormKey(scope: string, ip: string): string {
  return `${scope}:${hashIp(ip)}`
}

/** Identifiant unique court, pour les références internes. */
export function shortId(bytes = 4): string {
  return crypto.randomBytes(bytes).toString('hex').toUpperCase()
}
