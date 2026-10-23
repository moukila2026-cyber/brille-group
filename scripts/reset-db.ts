/**
 * Réinitialisation complète de la base (DÉVELOPPEMENT UNIQUEMENT).
 *
 * Supprime toutes les tables applicatives puis rejoue les migrations.
 * Sécurité : refuse de s'exécuter si la base ne ressemble pas à une base
 * locale ou de test (sauf confirmation explicite avec FORCE_RESET=1).
 *
 * Usage : npm run db:reset
 */
import '../server/env'
import { getPool } from '../server/db'
import fs from 'node:fs'
import path from 'node:path'

const TABLES = [
  'training_registrations',
  'quote_requests',
  'contact_messages',
  'training_courses',
  'projects',
  'properties',
  'services',
  'site_settings',
  'admin_users',
  'rate_limits',
  'schema_migrations',
]

async function main() {
  const url = process.env.DATABASE_URL ?? ''
  const looksLocal = /localhost|127\.0\.0\.1|_test|test-|brille_test/.test(url)
  if (!looksLocal && process.env.FORCE_RESET !== '1') {
    console.error(
      '✗ Réinitialisation refusée : cette base ne ressemble pas à une base locale ou de test.\n' +
        '  Si vous êtes certain de vouloir tout supprimer, relancez avec FORCE_RESET=1.',
    )
    process.exit(1)
  }

  const pool = getPool()
  console.log('Suppression des tables…')
  await pool.query(`DROP TABLE IF EXISTS ${TABLES.join(', ')} CASCADE`)
  await pool.query('DROP SEQUENCE IF EXISTS quote_reference_seq')
  await pool.query('DROP FUNCTION IF EXISTS set_updated_at() CASCADE')
  await pool.end()

  console.log('Application des migrations…')
  const { spawnSync } = await import('node:child_process')
  const result = spawnSync('npx', ['tsx', 'scripts/migrate.ts'], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)

  const files = fs.readdirSync(path.resolve(process.cwd(), 'db/migrations')).filter((f) => f.endsWith('.sql'))
  console.log(`\n✓ Base réinitialisée (${files.length} migration(s) rejouée(s)).`)
  console.log('  Créez un administrateur avec : npm run admin:create')
}

main().catch((error) => {
  console.error('✗ Réinitialisation impossible :', error instanceof Error ? error.message : error)
  process.exit(1)
})
