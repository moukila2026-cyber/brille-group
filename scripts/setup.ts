/**
 * Assistant de configuration initiale (démarrage rapide).
 *
 * Il fait, dans l'ordre :
 *   1. vérifie la version de Node ;
 *   2. crée le fichier .env (en générant automatiquement AUTH_SECRET) ;
 *   3. teste réellement la connexion à la base Neon ;
 *   4. applique les migrations ;
 *   5. propose de créer le premier administrateur.
 *
 * Usage :
 *   npm run setup                       (mode interactif, recommandé)
 *   npm run setup -- --database-url="postgresql://..." --site-url="http://localhost:3000"
 *   npm run setup -- --yes --skip-admin  (CI / scripté)
 */
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { Pool } from 'pg'

const envPath = path.resolve(process.cwd(), '.env')

const args = process.argv.slice(2)
const flag = (name: string): string | undefined => {
  const withEquals = args.find((arg) => arg.startsWith(`--${name}=`))
  if (withEquals) return withEquals.slice(name.length + 3)
  const index = args.indexOf(`--${name}`)
  if (index !== -1 && args[index + 1] && !args[index + 1].startsWith('--')) return args[index + 1]
  return undefined
}
const has = (name: string) => args.includes(`--${name}`) || args.some((arg) => arg.startsWith(`--${name}=`))

const nonInteractive = has('yes') || Boolean(flag('database-url'))
const skipAdmin = has('skip-admin')
const force = has('force')

let rl: readline.Interface | null = null

function ask(question: string, fallback = ''): Promise<string> {
  if (!rl) rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl!.question(question, (answer) => resolve(answer.trim() || fallback))
  })
}

async function askYesNo(question: string, defaultYes = true): Promise<boolean> {
  if (nonInteractive) return defaultYes
  const answer = (await ask(`${question} (${defaultYes ? 'O/o' : 'N/n'}) : `)).toLowerCase()
  if (!answer) return defaultYes
  return answer.startsWith('o') || answer.startsWith('y')
}

function closePrompt() {
  if (rl) {
    rl.close()
    rl = null
  }
}

/** Lit un fichier .env existant et retourne ses valeurs. */
function readExistingEnv(): Record<string, string> {
  if (!fs.existsSync(envPath)) return {}
  const out: Record<string, string> = {}
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[trimmed.slice(0, eq).trim()] = value
  }
  return out
}

function normaliseDatabaseUrl(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, '')
}

/** Teste la connexion avec des messages d'erreur compréhensibles. */
async function testConnection(databaseUrl: string): Promise<{ ok: boolean; message: string }> {
  const isNeon = /neon\.tech|sslmode=require/.test(databaseUrl)
  const isLocal = /localhost|127\.0\.0\.1|::1/.test(databaseUrl)
  const needsSsl = isNeon || !isLocal

  // On retire sslmode / channel_binding : le SSL est géré explicitement,
  // ce qui évite les avertissements de pg-connection-string.
  let urlTest = databaseUrl
  try {
    const parsed = new URL(databaseUrl)
    parsed.searchParams.delete('sslmode')
    parsed.searchParams.delete('channel_binding')
    urlTest = parsed.toString()
  } catch {
    /* URL non standard : on garde la chaîne d'origine */
  }

  const pool = new Pool({
    connectionString: urlTest,
    connectionTimeoutMillis: 12_000,
    max: 1,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  })

  try {
    const result = await pool.query<{ version: string }>('SELECT version() AS version')
    const version = String(result.rows[0]?.version ?? '').split(' ').slice(0, 2).join(' ')
    return { ok: true, message: version || 'connexion réussie' }
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error)
    let hint = raw
    if (/password authentication failed/i.test(raw)) {
      hint =
        'Mot de passe refusé. La chaîne a probablement été copiée partiellement ou un caractère a été modifié. Recopiez-la depuis Neon → Connect → Pooled connection → URI.'
    } else if (/does not support SSL/i.test(raw)) {
      hint =
        'Cette base est locale et ne gère pas le SSL. Utilisez une URL du type postgresql://user:password@localhost:5432/nom_de_base (sans ?sslmode=require).'
    } else if (/ENOTFOUND|getaddrinfo/i.test(raw)) {
      hint =
        'Hôte introuvable. Vérifiez que l’URL se termine bien par .neon.tech et qu’il n’y a pas d’espace au début ou à la fin.'
    } else if (/does not exist/i.test(raw)) {
      hint = 'La base indiquée n’existe pas. Utilisez le nom de base fourni par Neon (souvent « neondb »).'
    } else if (/ETIMEDOUT|timeout/i.test(raw)) {
      hint =
        'Délai dépassé. Vérifiez votre connexion internet. Si le projet Neon est en veille, relancez : le premier essai le réveille.'
    }
    return { ok: false, message: hint }
  } finally {
    await pool.end().catch(() => undefined)
  }
}

async function main() {
  console.log('\n════════════════════════════════════════════════════════')
  console.log('  BRILLE GROUP SARL — configuration du projet')
  console.log('════════════════════════════════════════════════════════\n')

  // 1. Version de Node
  const major = Number(process.versions.node.split('.')[0])
  if (major < 20) {
    console.error(`✗ Node.js ${process.versions.node} détecté. La version 20 ou plus récente est requise.`)
    console.error('  Téléchargez-la sur https://nodejs.org (version LTS).')
    process.exit(1)
  }
  console.log(`✓ Node.js ${process.versions.node}`)

  // 2. Variables existantes
  const existing = readExistingEnv()
  if (Object.keys(existing).length > 0 && !force && !nonInteractive) {
    const keep = await askYesNo(
      `Un fichier .env existe déjà (${Object.keys(existing).length} variable(s)). Conserver ses valeurs ?`,
      true,
    )
    if (!keep) {
      console.log('  → les valeurs existantes seront remplacées.')
      for (const key of Object.keys(existing)) delete existing[key]
    }
  }

  // 3. URL de la base
  let databaseUrl = flag('database-url') ?? existing.DATABASE_URL ?? ''

  // Solution de repli si le collage ne fonctionne pas dans la console :
  // l'utilisateur colle la chaîne dans le Bloc-notes et l'enregistre ici.
  const fichierUrl = path.resolve(process.cwd(), 'neon-url.txt')
  if (!databaseUrl && fs.existsSync(fichierUrl)) {
    const brut = fs.readFileSync(fichierUrl, 'utf8')
    const premiere = brut.split(/\r?\n/).map((l) => l.trim()).find((l) => /^postgres(ql)?:\/\//i.test(l))
    if (premiere) {
      console.log('\n✓ Chaîne de connexion trouvée dans le fichier neon-url.txt')
      console.log('  → utilisation de cette chaîne (le fichier sera supprimé après coup)')
      databaseUrl = premiere
    } else {
      console.log('\n⚠️  Le fichier neon-url.txt existe mais ne contient pas de chaîne postgresql://')
    }
  }

  if (!databaseUrl) {
    console.log('\nOù trouver votre DATABASE_URL ?')
    console.log('  1. https://console.neon.tech  → votre projet')
    console.log('  2. Bouton « Connect » (en haut du tableau de bord)')
    console.log('  3. Interrupteur « Connection pooling » ACTIVÉ')
    console.log('     → le nom d’hôte contient alors « -pooler »')
    console.log('  4. Onglet « Connection string » → icône copier\n')
    console.log('  Collage : Ctrl + V, ou clic droit dans cette fenêtre.\n')
    databaseUrl = await ask('Collez la chaîne de connexion puis Entrée :\n> ')
  }
  databaseUrl = normaliseDatabaseUrl(databaseUrl)

  if (!/^postgres(ql)?:\/\//i.test(databaseUrl)) {
    console.error('\n✗ La chaîne doit commencer par postgresql:// .')
    console.error('  Exemple : postgresql://neondb_owner:motdepasse@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require')
    closePrompt()
    process.exit(1)
  }
  if (/localhost|127\.0\.0\.1/.test(databaseUrl) === false && !/\.neon\.tech|sslmode=require|render\.com|\.aws\.|azure/i.test(databaseUrl)) {
    console.log('\n⚠️  Cette URL ne ressemble pas à une base Neon. On continue, mais vérifiez-la si la connexion échoue.')
  }

  // 4. Test réel de connexion
  console.log('\n→ Test de la connexion à la base…')
  const test = await testConnection(databaseUrl)
  if (!test.ok) {
    console.error(`✗ Connexion impossible.\n  ${test.message}\n`)
    closePrompt()
    process.exit(1)
  }
  console.log(`✓ Connexion réussie (${test.message})`)

  // 5. Écriture du .env
  const authSecret = existing.AUTH_SECRET && existing.AUTH_SECRET.length >= 32
    ? existing.AUTH_SECRET
    : crypto.randomBytes(48).toString('base64url')
  const siteUrl = flag('site-url') ?? existing.SITE_URL ?? 'http://localhost:3000'
  const formDelay = existing.FORM_MIN_DELAY_MS ?? '1500'

  const content = `# ---------------------------------------------------------------------------
# BRILLE GROUP SARL — configuration locale
# Fichier généré par « npm run setup ». Ne jamais le commiter (voir .gitignore).
# ---------------------------------------------------------------------------

# Base de données PostgreSQL (Neon)
DATABASE_URL="${databaseUrl}"

# Secret de signature des sessions administrateur (aléatoire, 48 octets)
AUTH_SECRET="${authSecret}"

# Adresse publique du site (SEO : sitemap, canoniques, partage)
SITE_URL="${siteUrl}"

# Anti-spam : délai minimal de remplissage des formulaires (millisecondes)
FORM_MIN_DELAY_MS=${formDelay}
`
  fs.writeFileSync(envPath, content, { mode: 0o600 })
  try {
    fs.chmodSync(envPath, 0o600)
  } catch {
    /* Windows : la notion de permissions POSIX ne s'applique pas */
  }
  if (fs.existsSync(fichierUrl)) {
    try {
      fs.unlinkSync(fichierUrl)
      console.log('✓ Fichier temporaire neon-url.txt supprimé (il contenait le mot de passe)')
    } catch {
      console.log('⚠️  Pensez à supprimer le fichier neon-url.txt : il contient le mot de passe de la base.')
    }
  }

  console.log('✓ Fichier .env créé (AUTH_SECRET généré automatiquement)')

  if (authSecret === existing.AUTH_SECRET && existing.AUTH_SECRET) {
    console.log('  (AUTH_SECRET existant conservé : les sessions déjà ouvertes restent valides)')
  } else {
    console.log('  Conservez ce fichier .env : sur Vercel, vous collerez les mêmes valeurs.')
  }

  // 6. Migrations
  console.log('\n→ Application du schéma de base de données…')
  closePrompt()
  const isWindows = process.platform === 'win32'
  // shell:false + nom explicite (.cmd sous Windows) : pas d'avertissement DEP0190
  const npx = isWindows ? 'npx.cmd' : 'npx'
  const migrate = spawnSync(npx, ['tsx', 'scripts/migrate.ts'], { stdio: 'inherit' })
  if (migrate.status !== 0) {
    console.error('\n✗ Les migrations ont échoué. Corrigez l’erreur ci-dessus, puis relancez « npm run db:migrate ».')
    process.exit(migrate.status ?? 1)
  }

  // 7. Administrateur
  if (!skipAdmin) {
    console.log('\n────────────────────────────────────────────────────────')
    console.log('  Création du premier compte administrateur')
    console.log('  (e-mail, nom, mot de passe de 12 caractères minimum)')
    console.log('────────────────────────────────────────────────────────')
    const createNow = await askYesNo('Créer le compte administrateur maintenant ?', true)
    if (createNow) {
      closePrompt()
      const admin = spawnSync(npx, ['tsx', 'scripts/create-admin.ts'], {
        stdio: 'inherit',
        shell: process.platform === 'win32',
      })
      if (admin.status !== 0) {
        console.log('\n⚠️  Compte non créé. Vous pourrez relancer : npm run admin:create')
      }
    } else {
      console.log('  Ignoré. Plus tard : npm run admin:create')
    }
  }

  closePrompt()

  console.log('\n════════════════════════════════════════════════════════')
  console.log('  Configuration terminée')
  console.log('════════════════════════════════════════════════════════')
  console.log('\nProchaine étape, lancez :\n\n    npm run dev\n')
  console.log('Puis ouvrez dans votre navigateur :')
  console.log('  • Site public     → http://localhost:3000')
  console.log('  • Administration  → http://localhost:3000/admin/login')
  console.log('\nPour arrêter le serveur : Ctrl + C dans le terminal.\n')
}

main().catch((error) => {
  console.error('\n✗ Configuration interrompue :', error instanceof Error ? error.message : error)
  closePrompt()
  process.exit(1)
})
