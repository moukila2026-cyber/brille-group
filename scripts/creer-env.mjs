// Crée le fichier .env de manière fiable, sans passer par le Bloc-notes.
// Usage : node scripts/creer-env.mjs  [--force]
// Aucune dépendance externe, aucune écriture hors du dossier du projet.

import { createInterface } from 'node:readline';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ENV_PATH = resolve(ROOT, '.env');
const FORCE = process.argv.includes('--force');

const c = {
  ok: (s) => `\x1b[32m${s}\x1b[0m`,
  ko: (s) => `\x1b[31m${s}\x1b[0m`,
  warn: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

console.log('');
console.log(c.bold('  Création du fichier .env — BRILLE GROUP SARL'));
console.log(c.dim('  ------------------------------------------------'));
console.log('');

if (existsSync(ENV_PATH) && !FORCE) {
  const actuel = readFileSync(ENV_PATH, 'utf8');
  console.log(c.warn('  Un fichier .env existe déjà dans ce dossier.'));
  console.log(c.dim(`  ${ENV_PATH}`));
  const garde = actuel.split('\n').find((l) => l.startsWith('DATABASE_URL'));
  if (garde) console.log(c.dim(`  ${garde.replace(/:\/\/([^:]+):[^@]+@/, '://$1:***@').slice(0, 110)}`));
  console.log('');
  console.log('  Relancez avec l option --force pour le remplacer.');
  console.log('');
  process.exit(0);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, (a) => res(a)));

function nettoyer(v) {
  let s = (v || '').trim();
  s = s.replace(/^["'`]+/, '').replace(/["'`]+$/, '');
  return s.trim();
}

let url = '';
let erreur = '';

while (true) {
  console.log('  Collez la chaîne de connexion Neon');
  console.log(c.dim('  (clic droit dans cette fenêtre = coller, puis Entrée)'));
  console.log('');
  const saisie = nettoyer(await ask('  DATABASE_URL : '));
  console.log('');

  if (!saisie) {
    console.log(c.ko('  Rien n a été collé. Recommencez.'));
    console.log('');
    continue;
  }
  if (!/^postgres(ql)?:\/\//i.test(saisie)) {
    console.log(c.ko('  La chaîne doit commencer par postgresql://'));
    console.log(c.dim('  Vous avez collé peut-être un mot de passe ou une autre valeur.'));
    console.log('');
    continue;
  }
  if (!saisie.includes('@') || !saisie.split('@')[1].includes('.')) {
    console.log(c.ko('  Il manque le nom d hôte après le @. La chaîne est incomplète.'));
    console.log(c.dim('  Retournez dans Neon, bouton Connect, puis copiez la chaîne entière.'));
    console.log('');
    continue;
  }

  url = saisie;
  if (!url.includes('-pooler')) {
    console.log(c.warn('  Attention : l hôte ne contient pas "-pooler".'));
    console.log(c.dim('  C est acceptable en local, mais sur Vercel activez "Connection pooling".'));
    console.log('');
  }
  const base = url.split('?')[0].split('/').pop();
  console.log(c.ok(`  Base détectée : ${base || '(inconnue)'}`));
  console.log('');

  console.log('  Vérification de la connexion...');
  let Pool;
  try {
    const pg = await import('pg');
    Pool = pg.Pool ?? pg.default?.Pool ?? pg.default;
    if (typeof Pool !== 'function') throw new Error('Pool introuvable');
  } catch {
    console.log(c.warn('  Module pg absent : lancez d abord "npm ci". Vérification ignorée.'));
    console.log('');
    break;
  }

  // On retire sslmode / channel_binding de l URL de test : le SSL est géré
  // explicitement, ce qui évite les avertissements de pg-connection-string.
  const besoinSsl = /neon\.tech|sslmode=require/i.test(url);
  let urlTest = url;
  try {
    const u = new URL(url);
    u.searchParams.delete('sslmode');
    u.searchParams.delete('channel_binding');
    urlTest = u.toString();
  } catch {
    /* URL non standard : on garde la chaîne brute */
  }

  const pool = new Pool({
    connectionString: urlTest,
    ssl: besoinSsl ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 15000,
  });

  try {
    const r = await pool.query('select current_database() as db, version() as v');
    console.log(c.ok(`  Connexion réussie — base "${r.rows[0].db}"`));
    console.log(c.dim(`  ${String(r.rows[0].v).split(',')[0]}`));
    console.log('');
    await pool.end();
    break;
  } catch (e) {
    await pool.end().catch(() => {});
    erreur = e.code || e.message;
    console.log(c.ko(`  Échec : ${e.message}`));
    console.log('');
    if (/password|authentication/i.test(e.message)) {
      console.log('  Le mot de passe est refusé. Dans Neon : Connect > copier à nouveau.');
      console.log('  Vérifiez aussi qu aucun caractère n a été perdu au collage.');
    } else if (/does not exist/i.test(e.message) && /database/i.test(e.message)) {
      console.log('  La base indiquée n existe pas. Dans Neon, la base s appelle souvent neondb.');
    } else if (/ENOTFOUND|getaddrinfo/i.test(e.message)) {
      console.log('  Nom d hôte introuvable. Vérifiez qu il se termine par .neon.tech');
    } else if (/timeout|ETIMEDOUT/i.test(e.message)) {
      console.log('  Délai dépassé : vérifiez la connexion internet, puis réessayez.');
    }
    console.log('');
    const again = (await ask('  Réessayer avec une autre chaîne ? (o pour oui, Entrée pour arrêter) : '))
      .trim()
      .toLowerCase();
    console.log('');
    if (again !== 'o' && again !== 'oui') {
      rl.close();
      console.log(c.ko('  Fichier .env non créé.'));
      console.log('');
      process.exit(1);
    }
  }
}

if (!url || erreur === 'abandon') {
  rl.close();
  process.exit(1);
}

const secret = randomBytes(48).toString('base64url');
const contenu = `# Fichier de configuration local — NE PAS COMMITER, NE PAS PARTAGER
# Généré par scripts/creer-env.mjs

# Chaîne de connexion PostgreSQL (Neon)
DATABASE_URL="${url}"

# Secret de signature des sessions administrateur (généré aléatoirement)
AUTH_SECRET="${secret}"

# Adresse publique du site
SITE_URL="http://localhost:3000"

# Délai minimal anti-spam des formulaires, en millisecondes
FORM_MIN_DELAY_MS=1500
`;

writeFileSync(ENV_PATH, contenu, { encoding: 'utf8', mode: 0o600 });
try {
  chmodSync(ENV_PATH, 0o600);
} catch {
  /* Windows : pas de permission POSIX, sans importance */
}

console.log(c.ok('  Fichier .env créé.'));
console.log(c.dim(`  ${ENV_PATH}`));
console.log('');
console.log('  Contenu (mot de passe masqué) :');
console.log(c.dim(contenu.replace(/(:\/\/[^:]+:)[^@]+@/, '$1***@')));
console.log(c.bold('  Étapes suivantes :'));
console.log('    1. npm run db:migrate     applique les tables dans Neon');
console.log('    2. npm run admin:create   crée votre compte administrateur');
console.log('    3. npm run dev            démarre le site sur http://localhost:3000');
console.log('');
rl.close();
