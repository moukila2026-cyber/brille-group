/**
 * Création sécurisée du premier administrateur (ou d'un administrateur
 * supplémentaire). Le mot de passe n'est jamais passé en argument de commande
 * (il resterait dans l'historique du shell) : utilisez la variable
 * d'environnement ADMIN_PASSWORD, ou le mode interactif.
 *
 * Exemples :
 *   ADMIN_PASSWORD='MonMotDePasse2026!' npm run admin:create -- \
 *     --email direction@brillegroup.com --name "Direction Brille Group" --role superadmin
 *
 *   npm run admin:create            # mode interactif (recommandé)
 */
import readline from 'node:readline'
import { PassThrough } from 'node:stream'
import { getPool } from '../server/db'
import { hashPassword } from '../server/auth'
import { env } from '../server/env'

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`)
  if (index === -1) return undefined
  return process.argv[index + 1]
}

function ask(question: string, hidden = false): Promise<string> {
  // Saisie normale : readline standard.
  if (!hidden) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close()
        resolve(answer.trim())
      })
    })
  }
  // Saisie masquée : readline gère les touches (retour arrière, collage) mais
  // écrit sur un flux jetable, donc rien ne s'affiche. Cette méthode est
  // fiable sous cmd.exe, PowerShell et terminaux Unix, contrairement à une
  // lecture brute de process.stdin qui peut renvoyer une chaîne vide.
  const silencieux = new PassThrough()
  const rl = readline.createInterface({ input: process.stdin, output: silencieux, terminal: true })
  process.stdout.write(question)
  return new Promise((resolve) => {
    rl.question('', (answer) => {
      rl.close()
      process.stdout.write('\n')
      resolve(answer)
    })
  })
}

function validatePassword(password: string): string | null {
  if (password.length < 12) return 'Le mot de passe doit contenir au moins 12 caractères.'
  if (!/[A-Z]/.test(password)) return 'Ajoutez au moins une majuscule.'
  if (!/[a-z]/.test(password)) return 'Ajoutez au moins une minuscule.'
  if (!/[0-9]/.test(password)) return 'Ajoutez au moins un chiffre.'
  return null
}

async function main() {
  if (!env.hasDatabase()) {
    console.error('✗ DATABASE_URL manquant. Renseignez le fichier .env.')
    process.exit(1)
  }

  let email = getArg('email')
  let name = getArg('name')
  const role = (getArg('role') ?? 'superadmin') as 'admin' | 'superadmin'
  let password = process.env.ADMIN_PASSWORD

  const interactive = !email || !password
  if (interactive) {
    console.log('\nCréation d’un compte administrateur BRILLE GROUP\n')
    email = email ?? (await ask('Adresse e-mail : '))
    name = name ?? (await ask('Nom complet : '))
    password = password ?? (await ask('Mot de passe (12 caractères min., masqué) : ', true))
    const confirm = await ask('Confirmer le mot de passe : ', true)
    if (confirm !== password) {
      console.error('✗ Les mots de passe ne correspondent pas.')
      process.exit(1)
    }
  }

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error('✗ Adresse e-mail invalide.')
    process.exit(1)
  }
  if (!name) name = 'Administrateur'
  if (!password) {
    console.error('✗ Mot de passe manquant.')
    process.exit(1)
  }
  const problem = validatePassword(password)
  if (problem) {
    console.error(`✗ ${problem}`)
    process.exit(1)
  }
  if (role !== 'admin' && role !== 'superadmin') {
    console.error('✗ Rôle invalide (admin ou superadmin).')
    process.exit(1)
  }

  const pool = getPool()
  const existing = await pool.query('SELECT id FROM admin_users WHERE lower(email) = lower($1)', [email])
  if (existing.rowCount && existing.rowCount > 0) {
    console.error(`✗ Un compte existe déjà pour ${email}.`)
    process.exitCode = 1
    await pool.end()
    return
  }

  const result = await pool.query(
    `INSERT INTO admin_users (email, full_name, password_hash, role)
     VALUES (lower($1), $2, $3, $4) RETURNING id, email, role`,
    [email, name, hashPassword(password), role],
  )
  const user = result.rows[0]
  console.log(`\n✓ Compte créé : ${user.email} (${user.role})`)
  console.log('  Connectez-vous sur /admin/login avec cette adresse et ce mot de passe.')
  console.log('  Ne partagez jamais ce mot de passe et conservez-le dans un gestionnaire de mots de passe.\n')
  await pool.end()
}

main().catch((error) => {
  console.error('✗ Création impossible :', error instanceof Error ? error.message : error)
  process.exit(1)
})
