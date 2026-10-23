# 08 — Premiers pas : faire tourner le site sur votre ordinateur

Ce guide explique **exactement** quoi taper, où, et ce que vous devez voir à l'écran.
Il ne suppose aucune connaissance en programmation.

---

---

## « npm error ENOENT … C:\Users\DELL\package.json »

Cette erreur signifie une seule chose : **la commande est lancée dans un dossier qui ne contient
pas le projet.** `C:\Users\DELL` est votre dossier personnel, ce n'est pas le dossier du site.
Il n'y a donc rien à réparer : il suffit de se placer au bon endroit.

Trois façons de trouver le bon dossier :

**1. Le plus sûr — la barre d'adresse de l'explorateur**

Ouvrez le dossier du projet dans l'explorateur (vous devez y voir `package.json`,
`DEMARRER-WINDOWS.bat`, `src`, `server`). Cliquez dans la **barre d'adresse** (en haut), tapez
`cmd`, Entrée. La fenêtre s'ouvre **déjà dans le bon dossier** : plus besoin de `cd`.

**2. La recherche Windows**

Dans l'explorateur, ouvrez `C:\Users\DELL`, tapez `DEMARRER-WINDOWS.bat` dans la zone de
recherche. Clic droit sur le résultat → **Ouvrir l'emplacement du fichier**. Puis la méthode 1.

**3. Le script `TROUVER-PROJET.bat`**

Double-cliquez sur `TROUVER-PROJET.bat` (il peut être n'importe où, même sur le Bureau) : il
cherche le projet dans votre profil, affiche le chemin exact et vous donne **la ligne `cd /d`
à copier**. S'il ne trouve rien, il localise l'archive `.zip` et rappelle comment l'extraire.

Une fois dans le bon dossier, la commande `dir` doit afficher `package.json` :

```bat
cd /d "C:\Users\DELL\Documents\brille-group-site"
dir package.json
npm run setup
```

> Attention aux dossiers imbriqués : après « Extraire tout », Windows crée parfois
> `Documents\brille-group-site\brille-group-site`. Si `dir` ne montre pas `package.json`,
> descendez d'un niveau (`cd brille-group-site`) et vérifiez à nouveau.

---
## Créer le fichier `.env` (la configuration)

Le fichier `.env` contient la chaîne de connexion Neon et le secret des sessions. Sans lui, le
site ne démarre pas. Trois possibilités, par ordre de simplicité :

| Méthode | Commande / action | Quand l'utiliser |
|---|---|---|
| **A. Automatique** | `npm run setup` ou double-clic sur `DEMARRER-WINDOWS.bat` | cas normal, rien à faire à la main |
| **B. Script dédié** | double-clic sur `CREER-ENV-WINDOWS.bat` ou `npm run env:create` | vous voulez seulement le `.env`, sans migrations |
| **C. Bloc-notes** | ouvrir `.env.example`, **Enregistrer sous** → `.env`, type « Tous les fichiers » | les deux premiers échouent |

Le détail pas à pas de la méthode C (dont l'astuce `.env.` pour le point final) se trouve dans
`docs/02-NEON.md`, étape 3. Point important : **activez « Extensions de noms de fichiers »** dans
l'explorateur, sinon vous ne verrez pas qu'un fichier est en réalité nommé `.env.txt`.

---
## La fenêtre noire se ferme immédiatement (Windows)

**Cause la plus fréquente** : une erreur de syntaxe dans un fichier `.bat` ancien, ou un
lancement depuis un dossier qui ne contient pas `package.json`. La version fournie ici corrige
ces deux points et **affiche toujours** « Fin du script. Appuyez sur une touche pour fermer. ».

Si cela se reproduit :

1. **Vérifiez le dossier** : le `.bat` doit être à côté de `package.json`. Il doit avoir été
   **extrait** de l'archive (clic droit → Extraire tout), et non ouvert depuis la fenêtre de
   prévisualisation du ZIP.
2. **Débloquez le fichier** si Windows l'a marqué comme venant d'Internet :
   clic droit sur `DEMARRER-WINDOWS.bat` → **Propriétés** → cocher **Débloquer** en bas →
   OK. Si un écran bleu « Windows a protégé votre PC » apparaît :
   **Informations complémentaires** → **Exécuter quand même**.
3. **Utilisez la méthode manuelle** (elle affiche les erreurs en clair et ne ferme jamais la
   fenêtre) :

   Dans l'explorateur, ouvrez le dossier du projet, cliquez dans la **barre d'adresse**,
   tapez `cmd` puis Entrée. Dans la fenêtre noire :

   ```bat
   npm ci
   npm run setup
   npm run dev
   ```

   Tapez **une commande à la fois**, sans recopier de commentaire `#`.

4. Si un message d'erreur apparaît, il est explicite : il indique quoi corriger (Node.js manquant,
   chaîne Neon incomplète, base inexistante, port 3000 occupé). Copiez les 3 dernières lignes pour
   obtenir de l'aide.

---

## Avant tout : avoir les fichiers du projet sur SON ordinateur

`npm` doit être lancé **dans le dossier du projet**. Si vous obtenez
`ENOENT … package.json` ou `could not read package.json`, c'est que le terminal est ouvert
ailleurs (par exemple dans `C:\Windows\system32`).

### Méthode 1 — L'archive ZIP (la plus simple)

1. Téléchargez `brille-group-site.zip` depuis votre espace de travail.
2. **Clic droit → Extraire tout…** vers un chemin **simple**, par exemple :
   `C:\Users\VOTRE_NOM\Documents\brille-group-site`
   (évitez `Bureau\nouveau dossier (2)\…` et surtout `C:\Program Files`).
3. Ouvrez le dossier extrait : vous devez voir `package.json`, `src`, `server`, `docs`,
   `DEMARRER-WINDOWS.bat`…
4. **Double-cliquez sur `DEMARRER-WINDOWS.bat`** : il vérifie Node.js, installe les dépendances,
   lance l'assistant de configuration puis démarre le site.

> ⚠️ Ne lancez **jamais** `npm` dans `C:\Windows\system32`.
> N'ouvrez pas non plus le terminal « en tant qu'administrateur » : ce n'est pas nécessaire et
> Windows vous place alors dans `system32`.

### Méthode 2 — Depuis GitHub

```bat
cd %USERPROFILE%\Documents
git clone https://github.com/VOTRE_COMPTE/brille-group-site.git
cd brille-group-site
```

(nécessite Git : <https://git-scm.com/download/win>)

### Vérifier que vous êtes au bon endroit

```bat
dir
```

Vous devez voir `package.json`. Sinon, déplacez-vous avec :

```bat
cd /d "C:\Users\VOTRE_NOM\Documents\brille-group-site"
```

> 💡 Astuce Windows : dans l'explorateur, cliquez dans la **barre d'adresse**, tapez `cmd` puis
> Entrée. Le terminal s'ouvre **déjà dans ce dossier**.

---

## Le chemin le plus simple (2 commandes)

Une fois Node.js installé et le dossier ouvert dans un terminal :

```bat
npm ci
npm run setup
npm run dev
```

> ⚠️ **Sous Windows (cmd), ne recopiez jamais les commentaires `#`** : ils sont interprétés comme
> des arguments et provoquent des erreurs `EUSAGE`. Tapez uniquement la commande.
> `npm ci` exige la présence de `package-lock.json` (fourni dans l'archive) : s'il manque, utilisez
> `npm install`.

### Raccourci Windows : `DEMARRER-WINDOWS.bat`

Double-cliquez sur le fichier : il enchaîne tout (vérification de Node.js, installation,
configuration, démarrage) et ouvre le navigateur.

`npm run setup` vous guide question par question et vérifie chaque étape. Si vous préférez tout
faire à la main, passez à la section « Méthode manuelle » plus bas.

---

## A. Installer Node.js (une seule fois)

1. Allez sur <https://nodejs.org>.
2. Téléchargez la version **LTS** (bouton de gauche).
3. Installez en laissant toutes les options par défaut (Windows : fichier `.msi` / macOS : `.pkg`).
4. **Fermez puis rouvrez votre terminal**, sinon la commande `npm` ne sera pas reconnue.
5. Vérifiez :

```bash
node -v     # doit afficher v20.x.x ou v22.x.x
npm -v      # doit afficher 10.x ou plus
```

> Si Windows affiche « npm n'est pas reconnu » : le terminal a été ouvert avant l'installation.
> Fermez-le, rouvrez-le, réessayez.

---

## B. Ouvrir un terminal dans le dossier du projet

### Windows

- Ouvrez l'explorateur de fichiers, allez dans le dossier du projet.
- Cliquez dans la **barre d'adresse** en haut, tapez `powershell`, puis Entrée.
  (Le terminal s'ouvre déjà dans le bon dossier.)
- Ou : clic droit dans le dossier → **Ouvrir dans le Terminal**.

### macOS

- `Cmd + Espace` → tapez `Terminal` → Entrée.
- Puis placez-vous dans le dossier :

```bash
cd ~/Documents/brille-group-site     # adaptez le chemin
```

Astuce : tapez `cd ` (avec l'espace), puis **glissez le dossier** du Finder dans le terminal :
le chemin se remplit tout seul.

### Vérifier que vous êtes au bon endroit

```bash
ls        # macOS / Linux
dir       # Windows (cmd)
```

Vous devez voir : `package.json`, `src`, `server`, `db`, `docs`, `vercel.json`…
Si vous voyez autre chose, vous n'êtes pas dans le bon dossier.

---

## C. Étape 1 — `npm ci`

```bash
npm ci
```

**Ce que ça fait** : télécharge les bibliothèques du projet dans un dossier `node_modules`
(cela peut prendre 1 à 3 minutes). À ne faire qu'une fois, ou après avoir récupéré une nouvelle
version du projet.

**Ce que vous devez voir** : des lignes de progression, puis quelque chose comme
`added 320 packages in 45s`. C'est terminé.

**Si erreur** :

| Message | Solution |
|---|---|
| `npm : commande introuvable` | Node.js n'est pas installé ou le terminal est ancien → section A |
| `EACCES permission denied` (macOS) | ne pas utiliser `sudo` ; vérifiez les droits du dossier |
| `ECONNRESET` / lenteur | connexion instable, relancez `npm ci` |
| `ERESOLVE` | exécutez `npm ci` (et non `npm install`) |

---

## D. Étape 2 — Récupérer la chaîne de connexion Neon

1. <https://console.neon.tech> → connectez-vous → ouvrez votre projet
   (si vous n'en avez pas : voir `docs/02-NEON.md`, étapes 1 et 2).
2. En haut à droite du tableau de bord : bouton **Connect**.
3. Onglet **Pooled connection** (le nom d'hôte contient `-pooler`).
4. **Format** : `URI`.
5. Cliquez sur l'icône **copier**.

Vous obtenez une ligne du type :

```
postgresql://neondb_owner:AbC123xYz@ep-cool-name-123456-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

> ⚠️ Cette chaîne contient le mot de passe de votre base. Ne l'envoyez à personne, ne la publiez
> pas, ne la mettez pas sur GitHub.

---

## E. Étape 2 bis — Lancer l'assistant (recommandé)

```bash
npm run setup
```

L'assistant va :

| Ce qu'il demande | Ce que vous faites |
|---|---|
| « Collez la chaîne de connexion » | collez la chaîne Neon puis **Entrée** |
| — | il teste la connexion et affiche `✓ Connexion réussie (PostgreSQL 17.x)` |
| — | il **génère automatiquement** le secret `AUTH_SECRET` (vous n'avez rien à inventer) |
| — | il crée le fichier `.env` et applique les migrations |
| « Créer le compte administrateur maintenant ? » | tapez `o` puis Entrée |
| « Adresse e-mail : » | l'e-mail qui servira à vous connecter (ex. `direction@brillegroup.com`) |
| « Nom complet : » | le nom affiché dans l'administration |
| « Mot de passe » | 12 caractères min., une majuscule, une minuscule, un chiffre |

> 🔑 **Important** : à la saisie du mot de passe, **rien ne s'affiche** (pas même des points).
> C'est normal : c'est une protection. Tapez votre mot de passe et appuyez sur Entrée, puis
> confirmez-le de la même façon.

À la fin, l'assistant affiche :

```
Configuration terminée
Prochaine étape, lancez :
    npm run dev
```

Passez directement à la **section G**.

---

## F. Méthode manuelle (si vous préférez, ou si l'assistant échoue)

### F.1 Créer le fichier `.env`

```bash
cp .env.example .env        # macOS / Linux / PowerShell
```

Sur l'invite de commandes Windows (cmd), utilisez plutôt :

```cmd
copy .env.example .env
```

Ou, plus simple : dans l'explorateur de fichiers, dupliquez `.env.example` et renommez la copie
en `.env` (Windows peut demander de confirmer l'extension).

### F.2 Générer le secret de session

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Copiez la longue chaîne affichée (ex. `Xk3f...9Q`). C'est votre `AUTH_SECRET`.

### F.3 Remplir le fichier `.env`

Ouvrez `.env` avec un éditeur de texte (Notepad, TextEdit, ou VS Code) et complétez :

```dotenv
DATABASE_URL="postgresql://neondb_owner:...-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="la-longue-chaine-copied-a-l-etape-F2"
SITE_URL="http://localhost:3000"
FORM_MIN_DELAY_MS=1500
```

Points d'attention :

- gardez les **guillemets** autour des valeurs ;
- pas d'espace avant ou après le `=` ;
- une ligne par variable, pas de virgule ;
- enregistrez **sans extension** (le fichier doit s'appeler `.env`, pas `.env.txt`) ;
  sous Windows, activez « Extensions de noms de fichiers » dans l'explorateur pour vérifier.

### F.4 Appliquer le schéma de base

```bash
npm run db:migrate
```

Attendu :

```
✓ 001_init.sql — appliqué
✓ 002_seed.sql — appliqué

2 migration(s) appliquée(s).
```

### F.5 Créer l'administrateur

```bash
npm run admin:create
```

Répondez aux questions (le mot de passe ne s'affiche pas pendant la saisie : c'est normal).

Attendu :

```
✓ Compte créé : votre@email.com (superadmin)
```

---

## G. Étape 3 — Lancer le site

```bash
npm run dev
```

Attendu :

```
  BRILLE GROUP — serveur de développement
  ➜  http://localhost:3000
  ➜  API : http://localhost:3000/api/health
```

Ouvrez votre navigateur :

| Adresse | Contenu |
|---|---|
| <http://localhost:3000> | le site public |
| <http://localhost:3000/admin/login> | l'administration (avec le compte créé) |
| <http://localhost:3000/api/health> | doit afficher `{"ok":true,"database":"up",…}` |

**Pour arrêter le serveur** : revenez dans le terminal et appuyez sur `Ctrl + C`
(macOS : `Ctrl + C` également, pas `Cmd + C`).

> Le terminal doit **rester ouvert** pendant que vous utilisez le site. Si vous le fermez, le
> site s'arrête. Pour saisir d'autres commandes en même temps, ouvrez un **second terminal**.

---

## H. Récapitulatif : ce que vous devez voir à chaque étape

| Commande | Résultat attendu | Si ce n'est pas le cas |
|---|---|---|
| `node -v` | `v20.x` ou plus | réinstaller Node.js puis rouvrir le terminal |
| `npm ci` | `added N packages` | voir le tableau en section C |
| `npm run setup` | `✓ Connexion réussie` puis `Configuration terminée` | lire le message d'aide affiché |
| `npm run db:migrate` | `✓ 001_init.sql — appliqué` | vérifier `DATABASE_URL` dans `.env` |
| `npm run admin:create` | `✓ Compte créé : …` | vérifier les règles de mot de passe |
| `npm run dev` | `➜ http://localhost:3000` | port occupé → `PORT=3001 npm run dev` |
| `/api/health` | `"database":"up"` | la base n'est pas joignable : revoir `DATABASE_URL` |

---

## I. Erreurs fréquentes au démarrage local

| Message | Cause | Solution |
|---|---|---|
| `[config] Variable d'environnement manquante : DATABASE_URL` | `.env` absent ou mal nommé (`.env.txt`) | refaire la section F, vérifier le nom du fichier |
| `[config] AUTH_SECRET trop court` | secret incomplet | regénérer avec la commande F.2 (48 octets) |
| `password authentication failed` | chaîne Neon tronquée | recopier la chaîne entière, guillemets compris |
| `EADDRINUSE :3000` | un autre programme utilise le port 3000 | `PORT=3001 npm run dev` (Windows : `set PORT=3001 && npm run dev`) |
| `relation "quote_requests" does not exist` | migrations non appliquées | `npm run db:migrate` |
| La page admin revient à la connexion | cookies bloqués / autre onglet | utiliser `http://localhost:3000` (pas `127.0.0.1`), vider les cookies |
| `npm : execution policy` (Windows) | stratégie PowerShell restrictive | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` puis `O` |
| Le mot de passe ne s'affiche pas à la création | comportement normal (sécurité) | tapez normalement et validez |

---

## J. Et ensuite ?

- Configurer l'administration et saisir les contenus : `docs/04-ADMINISTRATION.md`
- Mettre le code sur GitHub : `docs/01-GITHUB.md`
- Déployer en ligne : `docs/03-VERCEL.md`
- Parcours complet de bout en bout : `docs/00-PARCOURS-COMPLET.md`
