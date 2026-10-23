# 02 — Créer et configurer la base Neon, pas à pas

Objectif : disposer d'une base PostgreSQL hébergée, sécurisée, avec le schéma du site appliqué
et un premier administrateur.

Durée : 15 minutes.

---

## Étape 1 — Créer le compte et le projet Neon

1. Allez sur <https://console.neon.tech> → **Sign up** (ou connexion avec Google / GitHub).
2. Sur la page **Projects**, cliquez **New Project**.
3. Renseignez :

| Champ | Valeur recommandée |
|---|---|
| Project name | `brille-group` |
| Region | la plus proche de la Côte d'Ivoire : **AWS eu-west-3 (Paris)** si proposée, sinon **eu-central-1 (Francfort)** ou **eu-west-2 (Londres)** |
| Postgres version | la version proposée par défaut |
| Base name | `neondb` (nom proposé par Neon, ne le changez pas) |

4. Laissez les options payantes désactivées (Object Storage, Functions, AI Gateway, Neon Auth :
   inutiles ici).
5. Cliquez **Create project**. Vous arrivez sur le **Project Dashboard**.

> Le plan gratuit suffit largement pour démarrer. Un projet gratuit se met en veille après une
> période d'inactivité : la première requête après réveil peut prendre 1 à 2 secondes, sans
> conséquence pour les visiteurs suivants.

---

## Étape 2 — Copier la chaîne de connexion

1. Dans le projet, cliquez **Connect** (en haut du tableau de bord).
2. Dans la fenêtre **Connect to your branch**, vérifiez :
   - **Branch** : la branche par défaut (`main` ou `production`)
   - **Database** : `neondb`
   - **Role** : le rôle propriétaire (`neondb_owner`)
   - **Connection pooling** : **activé** (interrupteur visible ; le nom d'hôte contient alors
     `-pooler`). C'est la variante adaptée à une fonction serverless comme Vercel.
3. Onglet **Connection string** (et non « psql » ni « .env »).
4. Cliquez sur l'icône **copier**. Vous obtenez une chaîne de cette forme :

```
postgresql://neondb_owner:MotDePasseAleatoire@ep-cool-name-123456-pooler.eu-west-3.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Trois vérifications avant de continuer :**

| À vérifier | Pourquoi |
|---|---|
| l'hôte contient `-pooler` | sinon vous serez limité en connexions sur Vercel |
| la chaîne se termine par `/neondb` (avant le `?`) | c'est le nom de la base |
| elle contient `?sslmode=require` | chiffrement obligatoire ; le code l'accepte aussi sans, mais gardez-le |

> Cette chaîne contient le mot de passe de votre base. Ne la partagez avec personne, ne la
> mettez jamais dans un message public ni dans une capture d'écran.

---

## Étape 3 — Renseigner le fichier `.env` en local

Le fichier `.env` est le seul fichier que **vous** devez créer. Il contient deux valeurs :
la chaîne Neon (que vous venez de copier) et un secret de session généré automatiquement.
Il est déjà exclu de Git (`.gitignore`) : il ne partira jamais sur GitHub.

Trois méthodes, de la plus simple à la plus manuelle.

---

### Méthode A — automatique (recommandée)

Dans le dossier du projet :

```bat
npm run setup
```

L'assistant vérifie Node.js, demande la chaîne Neon, la teste, génère `AUTH_SECRET`, écrit `.env`,
applique les migrations et propose de créer le compte administrateur. **Vous n'avez rien d'autre
à faire.** C'est aussi ce que fait `DEMARRER-WINDOWS.bat`.

Pour créer *uniquement* le fichier `.env` (sans migrations) :

```bat
npm run env:create
```

ou, sans ligne de commande : double-clic sur **`CREER-ENV-WINDOWS.bat`**.

Dans les deux cas, collez la chaîne Neon quand elle est demandée : `Ctrl + V`, ou **clic droit**
dans la fenêtre noire (le collage est parfois plus fiable ainsi). Le script vérifie la connexion
avant d'écrire le fichier : si le mot de passe est refusé ou si la base n'existe pas, il vous le
dit **et n'écrit rien**.

---

### Méthode B — à la main avec le Bloc-notes (Windows)

À utiliser seulement si les scripts ne fonctionnent pas.

1. Ouvrez le dossier du projet dans l'explorateur.
2. Menu **Affichage** → cochez **Extensions de noms de fichiers** (indispensable pour voir le
   vrai nom du fichier).
3. Ouvrez **`.env.example`** avec le Bloc-notes (clic droit → Ouvrir avec → Bloc-notes).
4. **Fichier → Enregistrer sous…**
   - **Type** : `Tous les fichiers (*.*)` — surtout pas « Documents texte »
   - **Nom du fichier** : `.env` puis, si Windows refuse, tapez `.env.` (avec un point final :
     Windows le retire automatiquement)
   - **Encodage** : `UTF-8`
   - **Dossier** : celui du projet (à côté de `package.json`)
5. Remplacez la ligne `DATABASE_URL=` par votre chaîne Neon, **entre guillemets** :

```dotenv
DATABASE_URL="postgresql://neondb_owner:MotDePasse@ep-xxx-pooler.eu-west-3.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="generez-la-valeur-ci-dessous"
SITE_URL="http://localhost:3000"
FORM_MIN_DELAY_MS=1500
```

6. Générez le secret : ouvrez une invite de commandes dans le dossier et lancez

```bat
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Copiez la valeur affichée dans `AUTH_SECRET`.
7. Enregistrez, puis vérifiez que le fichier s'appelle bien `.env` et **non** `.env.txt`.

---

### Méthode C — une seule commande PowerShell

Dans le dossier du projet (clic droit dans le dossier → **Ouvrir dans le Terminal**) :

```powershell
Set-Content -Path .env -Encoding utf8 -Value @"
DATABASE_URL="COLLEZ_ICI_LA_CHAINE_NEON"
AUTH_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")"
SITE_URL="http://localhost:3000"
FORM_MIN_DELAY_MS=1500
"@
```

Remplacez `COLLEZ_ICI_LA_CHAINE_NEON` par la chaîne copiée dans Neon, puis validez.

---

### Vérifier que le fichier est correct

```bat
node -e "const fs=require('fs');const l=fs.readFileSync('.env','utf8').split(/\r?\n/).filter(x=>x.trim()&&!x.startsWith('#'));console.log(l.length+' ligne(s) lue(s)');l.forEach(x=>console.log(x.replace(/(:\/\/[^:]+:)[^@]+@/,'$1***@')))"
```

Résultat attendu : 4 lignes, la chaîne Neon affichée avec le mot de passe masqué, et un
`AUTH_SECRET` d'au moins 60 caractères.

> **Pièges classiques**
> - fichier nommé `.env.txt` → erreur `DATABASE_URL manquante` au démarrage ;
> - guillemets oubliés autour d'une chaîne contenant `?` ou `&` ;
> - chaîne collée sur deux lignes → `password authentication failed` ;
> - `.env` placé dans `Documents` au lieu du dossier du projet.

---

## Étape 4 — Appliquer le schéma (migrations)

```bash
npm run db:migrate
```

Résultat attendu :

```
✓ 001_init.sql — appliqué
✓ 002_seed.sql — appliqué

2 migration(s) appliquée(s).
```

Ce que font ces migrations :

- créent les 10 tables (`admin_users`, `services`, `properties`, `projects`, `training_courses`,
  `quote_requests`, `contact_messages`, `training_registrations`, `site_settings`, `rate_limits`) ;
- ajoutent les index, les contraintes `CHECK`, les déclencheurs `updated_at` ;
- activent la **RLS** sur toutes les tables (refus par défaut) ;
- insèrent les **contenus de départ issus du flyer officiel** (aucune donnée inventée).

Les migrations sont **idempotentes** : on peut relancer `npm run db:migrate` sans risque, seuls
les fichiers non encore appliqués sont exécutés (suivi dans `schema_migrations`).

Vérifier dans Neon : **Tables** (menu de gauche) → les 10 tables + `schema_migrations` doivent
apparaître.

---

## Étape 5 — Créer le premier administrateur

### Méthode interactive (recommandée)

```bash
npm run admin:create
```

Le script demande l'e-mail, le nom et le mot de passe (saisie masquée, non enregistrée dans
l'historique du shell). Exigences : 12 caractères minimum, une majuscule, une minuscule, un chiffre.

### Méthode non interactive (CI ou script)

```bash
ADMIN_PASSWORD='UnMotDePasseSolide2026!' npm run admin:create -- \
  --email direction@brillegroup.com \
  --name "Direction Brille Group" \
  --role superadmin
```

Résultat :

```
✓ Compte créé : direction@brillegroup.com (superadmin)
  Connectez-vous sur /admin/login avec cette adresse et ce mot de passe.
```

Connectez-vous immédiatement sur `http://localhost:3000/admin/login` pour vérifier.

> **Rôles** : `superadmin` peut créer/modifier des comptes et supprimer une demande de devis.
> `admin` gère les contenus et le suivi des demandes, sans ces actions sensibles.

---

## Étape 6 — Sauvegardes et bonnes pratiques Neon

- **Sauvegardes** : Neon conserve un historique de la branche (restauration à un instant donné
  selon le plan). Pour une sauvegarde manuelle, utilisez **Export** depuis le tableau de bord.
- **Branches** : pour tester un changement risqué, créez une branche Neon (`Branches → Create
  branch`) et pointez temporairement `DATABASE_URL` dessus.
- **Ne partagez jamais** la chaîne de connexion : elle contient le mot de passe de la base.
- **Rotation du mot de passe** : Neon → Settings → Reset password, puis mettez à jour `.env` et
  la variable Vercel, et redéployez.

---

## Dépannage Neon

| Message | Cause | Solution |
|---|---|---|
| `password authentication failed for user` | mot de passe tronqué / mauvaise URL | recopiez la chaîne complète depuis Neon |
| `The server does not support SSL connections` | `ssl` forcé sur une base locale | uniquement en local : utilisez une URL `localhost` (le code détecte le SSL automatiquement) |
| `ENOTFOUND … neon.tech` | hôte erroné | vérifiez que le nom d'hôte se termine par `.neon.tech` |
| `terminating connection due to administrator command` | projet Neon en veille | relancez la requête ; c'est un réveil à froid |
| `relation "quote_requests" does not exist` | migrations non appliquées | `npm run db:migrate` |
| `too many connections` | plusieurs déploiements qui ouvrent des pools | utilisez la chaîne **pooled** (`-pooler`) |

---

## Étape 7 — (Optionnel) Base de test séparée

Pour ne jamais mélanger tests et données réelles :

1. Créez une seconde branche Neon : `test`.
2. Utilisez sa chaîne de connexion uniquement pour `npm run test:e2e` et `npm run db:reset`.

`npm run db:reset` **refuse** de s'exécuter sur une base qui ne ressemble pas à une base locale
ou de test (protection contre une suppression accidentelle en production).
