/**
 * Applique les migrations SQL du dossier db/migrations dans l'ordre, de façon
 * idempotente, en enregistrant chaque fichier dans la table schema_migrations.
 *
 * Usage : npm run db:migrate
 */
import fs from 'node:fs'
import path from 'node:path'
import { getPool } from '../server/db'
import { env } from '../server/env'

const optionalEnv = process.argv.includes('--if-env')

async function main() {
  if (!env.hasDatabase()) {
    if (optionalEnv) {
      console.log('[migrate] DATABASE_URL absent — migration automatique ignorée.')
      return
    }
    console.error('✗ DATABASE_URL manquant. Renseignez le fichier .env (voir .env.example).')
    process.exit(1)
  }

  const dir = path.resolve(process.cwd(), 'db/migrations')
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  const pool = getPool()
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`)

  const { rows } = await pool.query<{ filename: string }>('SELECT filename FROM schema_migrations')
  const applied = new Set(rows.map((r) => r.filename))

  let count = 0
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`• ${file} — déjà appliqué`)
      continue
    }
    const sql = fs.readFileSync(path.join(dir, file), 'utf8')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file])
      await client.query('COMMIT')
      console.log(`✓ ${file} — appliqué`)
      count += 1
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined)
      console.error(`✗ ${file} — échec :`, error instanceof Error ? error.message : error)
      process.exitCode = 1
      return
    } finally {
      client.release()
    }
  }

  console.log(count === 0 ? '\nBase à jour, aucune migration à appliquer.' : `\n${count} migration(s) appliquée(s).`)
  await pool.end()
}

main().catch((error) => {
  console.error('✗ Migration impossible :', error instanceof Error ? error.message : error)
  process.exit(1)
})
