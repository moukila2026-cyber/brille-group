# 01 — Mettre le projet sur GitHub, pas à pas

Objectif : avoir un dépôt GitHub privé contenant le code, **sans aucun secret**.
Vercel se connectera ensuite à ce dépôt pour déployer automatiquement.

Durée : 10 à 15 minutes.

---

## Étape 0 — Vérifier que `.env` n'est pas versionné

Le fichier `.gitignore` exclut déjà `.env`, `node_modules`, `dist`, `.vercel`.
Vérifiez à tout moment :

```bash
git status --short          # .env ne doit jamais apparaître
cat .gitignore              # doit contenir .env
```

> ⚠️ Si vous avez déjà poussé un secret par erreur : supprimez-le du dépôt, **régénérez-le**
> (AUTH_SECRET) ou **réinitialisez le mot de passe Neon**, puis nettoyez l'historique.

---

## Étape 1 — Créer le dépôt sur GitHub

1. Connectez-vous à <https://github.com>.
2. En haut à droite : **+** → **New repository**.
3. Renseignez :
   - **Repository name** : `brille-group-site`
   - **Description** : `Site web et espace d'administration BRILLE GROUP SARL`
   - **Visibility** : **Private** (recommandé — le code est client)
   - **Ne cochez rien** (pas de README, pas de .gitignore, pas de licence : ils existent déjà)
4. **Create repository**.

GitHub affiche alors les commandes de connexion. Gardez la page ouverte.

---

## Étape 2 — Initialiser Git en local

Le dépôt local est déjà initialisé et un premier commit peut être créé. Sinon :

```bash
cd /chemin/vers/le/projet
git init
git branch -M main

# Identité utilisée pour les commits (une seule fois par machine)
git config user.name "Votre Nom"
git config user.email "vous@exemple.com"

git add .
git commit -m "Site BRILLE GROUP SARL : site public, API, administration et migrations"
```

---

## Étape 3 — Relier le dépôt local à GitHub

Deux méthodes. **La méthode A est la plus simple.**

### Méthode A — HTTPS + jeton personnel (recommandée)

1. GitHub → photo de profil → **Settings** → **Developer settings** →
   **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**.
2. Nom : `brille-vercel`, expiration : 90 jours, cochez la case **`repo`**.
3. **Generate token** puis **copiez le jeton** (il ne sera plus affiché).
4. Dans le terminal :

```bash
git remote add origin https://github.com/VOTRE_COMPTE/brille-group-site.git
git push -u origin main
```

Au moment du mot de passe, collez **le jeton** (pas le mot de passe GitHub).

> Pour ne pas ressaisir le jeton à chaque fois :
> ```bash
> git config --global credential.helper store   # stocke en clair dans ~/.git-credentials (poste personnel uniquement)
> ```

### Méthode B — GitHub CLI

```bash
# Installation : https://cli.github.com
gh auth login          # choisir GitHub.com → HTTPS → se connecter dans le navigateur
gh repo create brille-group-site --private --source=. --remote=origin --push
```

Vérification : `git remote -v` doit afficher `origin` vers votre dépôt, et la page GitHub doit
montrer les fichiers.

---

## Étape 4 — Vérifier le contenu du dépôt

Sur GitHub, vous devez voir notamment :

```
api/  db/  docs/  public/  scripts/  server/  src/  .env.example  .gitignore  package.json  vercel.json
```

Et **surtout pas** : `node_modules/`, `dist/`, `.env`, `.vercel/`.

Si `node_modules` apparaît, arrêtez-vous et corrigez `.gitignore` avant de continuer.

---

## Étape 5 — Travailler à deux sur le projet

Deux façons de collaborer avec la personne qui maintiendra le site :

- **Collaborateur GitHub** : Settings → Collaborators → Add people.
- **Branches** (recommandé) :

```bash
git checkout -b contenu/photos-reelles
# … modifications …
git add -A && git commit -m "Ajout des photos de chantier fournies par l'entreprise"
git push -u origin contenu/photos-reelles
```

Puis ouvrez une **Pull Request** sur GitHub. Chaque Pull Request génère une **URL de
prévisualisation Vercel** : c'est le moyen le plus sûr de valider un changement avant de
l'envoyer en production.

---

## Étape 6 — Bonnes pratiques pour la suite

```bash
npm run typecheck   # avant chaque commit
npm run build       # vérifie que le build passe
```

- Ne commitez jamais de secret (`.env`, jeton, chaîne de connexion).
- Un commit = une intention claire (« corrige le formulaire de contact », pas « maj »).
- Taguez les versions livrées :

```bash
git tag -a v1.0.0 -m "Livraison de démonstration BRILLE GROUP"
git push origin v1.0.0
```

---

## Dépannage GitHub

| Message | Cause | Solution |
|---|---|---|
| `remote origin already exists` | remote déjà configuré | `git remote set-url origin <url>` |
| `Authentication failed` | mot de passe utilisé au lieu du jeton | recréez un jeton avec la case `repo`, puis `git push` |
| `Support for password authentication was removed` | idem | utilisez un jeton ou GitHub CLI |
| `Updates were rejected because the remote contains work…` | dépôt distant non vide | `git pull --rebase origin main` puis `git push` |
| `src refspec main does not match any` | aucun commit | `git add . && git commit -m "initial"` |
