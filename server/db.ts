/**
 * Accès à la base PostgreSQL (Neon).
 *
 * On utilise `pg` (TCP + SSL) : compatible avec Neon via la chaîne de
 * connexion « pooled » (hostname contenant -pooler), en local comme sur
 * Vercel. Le pool est mémorisé sur globalThis pour être réutilisé entre les
 * invocations d'une même instance serverless (évite la multiplication des
 * connexions).
 */
import { Pool, type PoolClient, type QueryResultRow } from 'pg'
import { env } from './env.js'

type GlobalWithPool = typeof globalThis & { __brillePool?: Pool }

const globalWithPool = globalThis as GlobalWithPool

/**
 * Retire de l'URL les paramètres que `pg` gère lui-même (SSL, channel binding).
 * Sans cela, la bibliothèque `pg-connection-string` affiche un avertissement de
 * sécurité à chaque connexion, ce qui inquiète inutilement en console.
 */
export function sanitizeConnectionString(connectionString: string): string {
  try {
    const url = new URL(connectionString)
    url.searchParams.delete('sslmode')
    url.searchParams.delete('channel_binding')
    return url.toString()
  } catch {
    return connectionString
  }
}

/** Un SSL est requis pour Neon ; inutile (et non supporté) en local. */
export function connectionNeedsSsl(connectionString: string): boolean {
  if (/neon\.tech|sslmode=require/.test(connectionString)) return true
  return !/localhost|127\.0\.0\.1|\bhost=\/|::1/.test(connectionString)
}

export function getPool(): Pool {
  if (!globalWithPool.__brillePool) {
    const rawConnectionString = env.databaseUrl
    const needsSsl = connectionNeedsSsl(rawConnectionString)
    const connectionString = sanitizeConnectionString(rawConnectionString)

    globalWithPool.__brillePool = new Pool({
      connectionString,
      max: Number(process.env.PGPOOL_MAX ?? 5),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    })
    globalWithPool.__brillePool.on('error', (err) => {
      console.error('[db] erreur de pool inattendue', err.message)
    })
  }
  return globalWithPool.__brillePool
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(text, params as never[])
  return result.rows
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] ?? null
}

export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}
