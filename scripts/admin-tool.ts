/**
 * Outil de gestion des comptes administrateur.
 *
 *   npm run admin:list                    liste les comptes existants (sans secret)
 *   npm run admin:check                   teste un couple e-mail / mot de passe
 *   npm run admin:reset                   réinitialise le mot de passe d'un compte
 *
 * Ce script tourne sur VOTRE ordinateur, avec la clé de la base : il ne fait
 * aucune promesse de sécurité côté navigateur, il sert uniquement à réparer
 * l'accès quand on ne sait plus quel e-mail ou quel mot de passe a été utilisé.
 */
import readline from 'node:readline'
import { PassThrough } from 'node:stream'
import { getPool } from '../server/db'
import { hashPassword, verifyPassword } from '../server/auth'
import { env } from '../server/env'

const command = (process.argv[2] ?? 'list').toLowerCase()

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`)
  return index === -1 ? undefined : process.argv[index + 1]
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

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

async function listAdmins(): Promise<void> {
  const pool = getPool()
  const { rows } = await pool.query(
    `SELECT email, full_name, role, is_active, created_at, last_login_at
       FROM admin_users ORDER BY created_at ASC`,
  )
  console.log('\nComptes administrateur enregistrés :\n')
  if (rows.length === 0) {
    console.log('  (aucun compte)')
    console.log('\n  → Créez-en un avec : npm run admin:create\n')
    await pool.end()
    return
  }
  for (const r of rows) {
    const etat = r.is_active ? 'actif' : 'DÉSACTIVÉ'
    const derniere = r.last_login_at ? new Date(r.last_login_at).toLocaleString('fr-FR') : 'jamais'
    console.log(`  • ${r.email}`)
    console.log(`    nom : ${r.full_name} | rôle : ${r.role} | état : ${etat}`)
    console.log(`    dernière connexion : ${derniere}`)
    console.log('')
  }
  console.log('  Utilisez exactement cet e-mail (sans espace) pour vous connecter.\n')
  await pool.end()
}

async function checkLogin(): Promise<void> {
  const pool = getPool()
  let email = getArg('email') ?? (await ask('E-mail utilisé pour la connexion : '))
  email = email.trim()
  const password = await ask('Mot de passe : ', true)

  const { rows } = await pool.query(
    `SELECT email, password_hash, is_active, token_version FROM admin_users WHERE lower(email) = lower($1)`,
    [email],
  )
  console.log('')
  if (rows.length === 0) {
    console.log(`✗ Aucun compte ne correspond à « ${email} ».`)
    const { rows: tous } = await pool.query(`SELECT email FROM admin_users ORDER BY created_at ASC`)
    if (tous.length) {
      console.log('  Comptes existants :')
      for (const t of tous) console.log(`    - ${t.email}`)
      console.log('\n  → L’e-mail saisi contient probablement une faute de frappe.')
    } else {
      console.log('  → Aucun compte n’existe : lancez « npm run admin:create ».')
    }
    await pool.end()
    return
  }
  const user = rows[0]
  if (!user.is_active) {
    console.log('✗ Le compte existe mais il est DÉSACTIVÉ.')
    console.log('  → Réactivez-le depuis l’administration, ou recréez un compte.')
    await pool.end()
    return
  }
  if (verifyPassword(password, user.password_hash)) {
    console.log(`✓ Le couple e-mail / mot de passe est CORRECT pour ${user.email}.`)
    console.log('  Si le site refuse quand même la connexion, videz le cache du navigateur')
    console.log('  ou essayez une fenêtre de navigation privée (ancien cookie de session).')
  } else {
    console.log(`✗ L’e-mail existe (${user.email}) mais le mot de passe ne correspond pas.`)
    console.log('  → Réinitialisez-le : npm run admin:reset')
  }
  await pool.end()
}

async function resetPassword(): Promise<void> {
  const pool = getPool()
  let email = getArg('email') ?? (await ask('E-mail du compte à réinitialiser : '))
  email = email.trim()
  if (!EMAIL_RE.test(email)) {
    console.error('✗ Adresse e-mail invalide.')
    process.exit(1)
  }
  const { rows } = await pool.query(`SELECT email FROM admin_users WHERE lower(email) = lower($1)`, [email])
  if (rows.length === 0) {
    console.error(`✗ Aucun compte pour « ${email} ». Voir la liste : npm run admin:list`)
    await pool.end()
    process.exit(1)
  }
  const password = await ask('Nouveau mot de passe (12 caractères min., masqué) : ', true)
  const confirm = await ask('Confirmer le mot de passe : ', true)
  if (password !== confirm) {
    console.error('✗ Les deux saisies diffèrent. Rien n’a été modifié.')
    await pool.end()
    process.exit(1)
  }
  const problem = validatePassword(password)
  if (problem) {
    console.error(`✗ ${problem}`)
    await pool.end()
    process.exit(1)
  }
  await pool.query(
    `UPDATE admin_users
        SET password_hash = $2,
            token_version = token_version + 1,
            updated_at = now()
      WHERE lower(email) = lower($1)`,
    [email, hashPassword(password)],
  )
  console.log(`\n✓ Mot de passe modifié pour ${rows[0].email}.`)
  console.log('  Les sessions déjà ouvertes ont été déconnectées (sécurité).')
  console.log('  Connectez-vous avec ce nouveau mot de passe.\n')
  await pool.end()
}

async function main(): Promise<void> {
  if (!env.hasDatabase()) {
    console.error('✗ DATABASE_URL manquant. Renseignez le fichier .env (npm run setup).')
    process.exit(1)
  }
  if (command === 'list' || command === 'liste') return listAdmins()
  if (command === 'check' || command === 'verifier' || command === 'vérifier') return checkLogin()
  if (command === 'reset' || command === 'reinitialiser' || command === 'réinitialiser') return resetPassword()
  console.log('Commandes disponibles :')
  console.log('  npm run admin:list     lister les comptes')
  console.log('  npm run admin:check    tester un e-mail et un mot de passe')
  console.log('  npm run admin:reset    définir un nouveau mot de passe')
  process.exit(1)
}

main().catch((error) => {
  console.error('✗ Erreur :', error instanceof Error ? error.message : error)
  process.exit(1)
})
