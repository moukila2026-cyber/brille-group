# 09 — Mettre le site en ligne (GitHub → Vercel), sous Windows

Guide à suivre dans l'ordre, dans l'invite de commandes **`cmd`** de Windows.
Chaque bloc gris se copie-colle tel quel : **une ligne à la fois**, sans commentaire `#`.

Ce qui existe déjà à ce stade : la base Neon est créée, le schéma et les contenus de départ sont
appliqués, votre compte administrateur fonctionne en local. **Il n'y aura donc aucune migration à
relancer après la mise en ligne : le site en ligne utilisera exactement la même base.**

Durée : 20 à 30 minutes.

---

## Étape 0 — Vérifier Git et se placer dans le dossier du projet

Ouvrez `cmd` dans le dossier du projet (barre d'adresse de l'explorateur → taper `cmd` → Entrée),
puis :

```bat
git --version
```

- **Une version s'affiche** (ex. `git version 2.47.1.windows.1`) : passez à l'étape suivante.
- **« git n'est pas reconnu… »** : installez Git pour Windows depuis
  <https://git-scm.com/download/win> (choisissez « 64-bit Git for Windows Setup », cliquez
  **Suivant** partout, les valeurs par défaut conviennent). **Fermez** la fenêtre `cmd`, rouvrez-en
  une nouvelle dans le dossier du projet, puis retapez `git --version`.

Ensuite, vérifiez que vous êtes au bon endroit :

```bat
dir package.json
```

Si Windows répond « Fichier introuvable », vous n'êtes pas dans le dossier du projet : revenez à
la barre d'adresse de l'explorateur et relancez `cmd`.

---

## Étape 1 — Créer le dépôt privé sur GitHub

1. Connectez-vous sur <https://github.com> (créez le compte gratuitement si besoin,
   l'adresse `contactbrillegroup@gmail.com` convient).
2. En haut à droite : **+** → **New repository**.
3. Renseignez :
   - **Repository name** : `brille-group-site`
   - **Visibility** : **Private**
   - **N'ajoutez ni README, ni .gitignore, ni licence** (laissez les cases décochées)
4. **Create repository**. Gardez la page ouverte : l'adresse du dépôt y est affichée.

> Le code n'est pas publié pour autant : il reste privé sur GitHub. Vercel y aura accès
> uniquement parce que vous l'autorisez à l'étape 3.

---

## Étape 2 — Envoyer le code depuis votre PC

Dans la fenêtre `cmd` ouverte **dans le dossier du projet**, exécutez les lignes suivantes l'une
après l'autre. Elles ne font qu'une chose : préparer un dossier de version et l'envoyer sur GitHub.

```bat
git init
```

```bat
git config user.name "Brille Group"
```

```bat
git config user.email "contactbrillegroup@gmail.com"
```

```bat
git add .
```

**Contrôle indispensable avant d'envoyer quoi que ce soit :**

```bat
git status --short
```

Le fichier `.env` **ne doit pas apparaître** dans la liste (il contient le mot de passe de votre
base). S'il apparaît, tapez `git rm --cached .env` puis relancez `git status --short`.

```bat
git commit -m "Site BRILLE GROUP SARL - version initiale"
```

```bat
git branch -M main
```

Remplacez `VOTRE_COMPTE` par votre nom d'utilisateur GitHub :

```bat
git remote add origin https://github.com/VOTRE_COMPTE/brille-group-site.git
```

> **Si l'adresse a déjà été enregistrée avec des crochets** (lien affiché sous la forme
> `[https://…](https://…)`), corrigez-la sans rien recoller, en tapant l'adresse en trois morceaux
> — c'est la méthode la plus fiable sous `cmd` :
>
> ```bat
> set GH=moukila2026-cyber
> ```
>
> ```bat
> set REPO=brille-group-site
> ```
>
> ```bat
> git remote set-url origin https://github.com/%GH%/%REPO%.git
> ```
>
> Puis vérifiez avec `git remote -v` : la ligne doit commencer par `origin  https://github.com/`
> et ne contenir **aucun crochet**.
>
> **Attention au copier-coller.** Collez l'adresse **nue**, sans crochets ni parenthèses.
> Si votre navigateur ou une messagerie l'affiche sous la forme
> `[https://github.com/…](https://github.com/…)`, le texte collé sera invalide et le `push`
> répondra `Repository not found`. Vérifiez toujours avec `git remote -v` : l'adresse affichée
> doit commencer directement par `https://` et finir par `.git`.

```bat
git push -u origin main
```

**Une fenêtre « Sign in to GitHub » peut s'ouvrir** (Git Credential Manager, installé avec Git) :
cliquez **Sign in with your browser** → connectez-vous → **Authorize**. C'est la méthode la plus
simple ; aucun mot de passe à recopier dans la console.

Si la console demande à la place un **nom d'utilisateur et un mot de passe** :

1. GitHub → photo de profil → **Settings** → **Developer settings** →
   **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**
2. Note : `brille-vercel` — Expiration : 90 jours — cochez la case **`repo`**
3. **Generate token**, puis **copiez** le jeton (`ghp_…`)
4. Dans la console : nom d'utilisateur = votre identifiant GitHub, mot de passe = **le jeton**

Vérification : rafraîchissez la page GitHub, vos fichiers doivent y être, et **surtout pas**
`node_modules`, `dist` ni `.env`.

---

## Étape 3 — Déployer sur Vercel

1. Allez sur <https://vercel.com> → **Sign Up** → **Continue with GitHub** → **Authorize**.
2. Cliquez **Add New…** → **Project**.
3. Dans la liste, trouvez `brille-group-site` → **Import**.
   *Si le dépôt n'apparaît pas : cliquez « Adjust GitHub App Permissions » et autorisez l'accès au
   dépôt `brille-group-site`.*
4. Vercel détecte **Vite** et lit `vercel.json` : ne changez ni **Build Command** (`npm run build`),
   ni **Output Directory** (`dist`).
5. Ouvrez **Environment Variables** et ajoutez ces quatre variables (nom → valeur, puis **Add**) :

| Nom | Valeur |
|---|---|
| `DATABASE_URL` | la chaîne Neon **pooled** (celle de votre `.env`, qui contient `-pooler`) |
| `AUTH_SECRET` | la valeur de `AUTH_SECRET` de votre `.env` (exactement la même) |
| `SITE_URL` | l'adresse qui sera affichée après le déploiement, ex. `https://brille-group-site.vercel.app` (vous pourrez la corriger juste après) |
| `FORM_MIN_DELAY_MS` | `1500` |

**Où retrouver ces valeurs ?** Ouvrez `.env` avec le Bloc-notes (clic droit → Ouvrir avec →
Bloc-notes). Copiez les valeurs **sans les guillemets**.

> `AUTH_SECRET` doit être **identique** en local et sur Vercel : c'est lui qui signe les sessions.
> S'il diffère, il suffit de se reconnecter, rien n'est cassé.

6. Cliquez **Deploy**. Le déploiement prend 2 à 4 minutes (installation, compilation, pré-rendu des
   pages). Attendez le message **Congratulations!**

---

## Étape 4 — Vérifier que tout fonctionne en ligne

Remplacez `VOTRE-ADRESSE` par celle affichée par Vercel :

```
https://VOTRE-ADRESSE.vercel.app/api/health
```

Attendu :

```json
{"ok":true,"database":"up","timestamp":"2026-..."}
```

Puis testez, dans le navigateur :

| Adresse | Attendu |
|---|---|
| `https://VOTRE-ADRESSE.vercel.app` | la page d'accueil s'affiche |
| `…/devis` | le formulaire s'ouvre ; envoyez une demande de test |
| `…/admin/login` | connectez-vous avec **le même e-mail et mot de passe qu'en local** (même base) |
| `…/admin` | votre demande de test apparaît dans la liste |

Si `/api/health` renvoie `{"ok":false,"database":"down"}` : la variable `DATABASE_URL` est absente
ou incorrecte (vérifiez qu'elle contient bien `-pooler` et le mot de passe complet), puis
**Deployments → ⋯ → Redeploy**.

---

## Étape 5 — Corriger `SITE_URL` puis redéployer

`SITE_URL` sert aux balises canonical, au sitemap et aux aperçus de partage : elle doit
correspondre à l'adresse réelle.

1. Vercel → votre projet → **Settings** → **Environment Variables**
2. `SITE_URL` → **Edit** → saisissez l'adresse exacte (`https://…vercel.app`) → **Save**
3. **Deployments** → sur le dernier déploiement, **⋯** → **Redeploy**

---

## Étape 6 — (Plus tard) Nom de domaine

Quand l'entreprise aura son domaine (ex. `brillegroup.ci`) : Vercel → **Settings** → **Domains** →
**Add**, puis chez le registrar, créez les enregistrements indiqués par Vercel. Mettez ensuite
`SITE_URL` à jour et redéployez. **Ne le faites pas avant d'avoir le domaine** : rien ne l'exige.

---

## Mises à jour du site, plus tard

Chaque `git push` sur `main` déclenche automatiquement un nouveau déploiement :

```bat
git add .
git commit -m "Description claire du changement"
git push
```

Pour revenir à une version précédente : Vercel → **Deployments** → choisir un déploiement →
**⋯** → **Promote to Production**.

---

## Dépannage

| Message | Cause | Solution |
|---|---|---|
| `fatal: not a git repository` | commande lancée hors du dossier | ouvrir `cmd` dans le dossier du projet |
| `git : commande introuvable` | Git pas installé, ou fenêtre ouverte avant l'installation | installer Git, **fermer puis rouvrir** `cmd` |
| `Authentication failed` au `push` | mot de passe GitHub utilisé au lieu d'un jeton | refaire l'étape 2, utiliser un jeton `repo` |
| `remote origin already exists` | remote déjà défini | `git remote set-url origin https://github.com/VOTRE_COMPTE/brille-group-site.git` |
| `Repository not found` alors que le dépôt existe | adresse enregistrée invalide (crochets, parenthèses, `.git/` final, faute de frappe) | `git remote -v` pour voir l'adresse réelle, puis `git remote set-url origin https://github.com/VOTRE_COMPTE/brille-group-site.git` |
| `src refspec main does not match any` | aucun commit | faire `git add .` puis `git commit -m "…"` |
| Vercel : **Build Failed**, `error TS…` | erreur de compilation | lancer `npm run build` en local pour voir le détail |
| Vercel : **Build Failed**, `npm ci` | `package-lock.json` absent du dépôt | vérifier qu'il a bien été poussé (`git ls-files package-lock.json`) |
| Site en ligne : `404` sur `/devis` | réécritures absentes | vérifier que `vercel.json` est dans le dépôt |
| API `500` | variable d'environnement manquante | Vercel → Settings → Environment Variables, puis Redeploy |
| Connexion admin refusée **en ligne** mais correcte en local | `AUTH_SECRET` différent | recopier la même valeur que celle du `.env`, puis Redeploy |

---

## Point de sécurité

- `.env` ne part **jamais** sur GitHub (il est dans `.gitignore`).
- Sur Vercel, les variables sont chiffrées et invisibles dans l'interface après saisie.
- Le cookie de session est `HttpOnly`, `SameSite=Lax`, et `Secure` en production (HTTPS).
- Ne collez jamais la chaîne `DATABASE_URL` dans un message, une capture d'écran ou un ticket.
