# 00 — Parcours complet : de zéro à un site en ligne

Ce document est la **checklist ordonnée**. Suivez les étapes dans cet ordre : chacune vérifie la
précédente, ce qui évite les blocages en cascade. Les détails de chaque partie sont dans les
guides 01 à 07.

Durée totale estimée : **45 à 60 minutes** pour un premier déploiement.

---

## Vue d'ensemble du parcours

```
[1] Tester en local      →  [2] Base Neon      →  [3] GitHub
        ↓                        ↓                    ↓
   ça fonctionne ?          tables + admin       code poussé
        ↓                        ↓                    ↓
[4] Vercel (préversion)  →  [5] Vérifications  →  [6] Domaine + production
```

---

## Étape 1 — Vérifier que tout fonctionne en local

```bash
npm ci            # installe les dépendances
npm run setup     # assistant : .env, AUTH_SECRET, test de la base, migrations, 1er admin
npm run dev       # → http://localhost:3000
```

Si vous préférez tout faire à la main (ou si l'assistant échoue), la méthode manuelle équivalente
est décrite dans [`08-PREMIERS-PAS.md`](08-PREMIERS-PAS.md), section F. Ce guide explique aussi
comment ouvrir un terminal, installer Node.js et interpréter chaque message.

**Points de contrôle :**

- [ ] `http://localhost:3000` affiche l'accueil avec les images.
- [ ] `http://localhost:3000/api/health` affiche `{"ok":true,"database":"up",…}`.
- [ ] `http://localhost:3000/admin/login` accepte votre compte.
- [ ] Envoyer une demande depuis `/devis` → elle apparaît dans **Administration → Demandes**.
- [ ] `npm run typecheck` et `npm run build` passent sans erreur.

> Pour cette étape, une base **locale ou Neon** convient. Le plus simple : créez directement la
> base Neon (étape 2) et utilisez-la aussi en local — vous éviterez de refaire les migrations.

---

## Étape 2 — Créer la base Neon

1. <https://neon.tech> → **Sign up** → **Create project** (`brille-group`, région Europe).
2. **Connect** → **Pooled connection** → **URI** → copiez la chaîne.
3. Collez-la dans `.env` (`DATABASE_URL`) et appliquez le schéma :

```bash
npm run db:migrate
```

4. Créez l'administrateur **contre cette base** :

```bash
npm run admin:create
```

**Points de contrôle :**

- [ ] Neon → **Tables** : les 10 tables + `schema_migrations` sont présentes.
- [ ] `npm run db:migrate` relancé affiche « déjà appliqué » (migrations idempotentes).
- [ ] La connexion admin fonctionne en local avec cette base.

Détails : [`02-NEON.md`](02-NEON.md)

---

## Étape 3 — Mettre le code sur GitHub

```bash
git init
git branch -M main
git config user.name "Votre Nom"
git config user.email "vous@exemple.com"
git add .
git commit -m "Site BRILLE GROUP SARL : site public, API, administration"
git remote add origin https://github.com/VOTRE_COMPTE/brille-group-site.git
git push -u origin main
```

Le jeton GitHub sert de mot de passe lors du `git push` (case `repo` cochée).

**Points de contrôle :**

- [ ] Le dépôt est **privé**.
- [ ] `.env` **n'apparaît pas** sur GitHub (`node_modules`, `dist` non plus).
- [ ] `package-lock.json`, `vercel.json` et `api/` sont bien présents.

Détails : [`01-GITHUB.md`](01-GITHUB.md)

---

## Étape 4 — Déployer sur Vercel (préversion)

1. <https://vercel.com> → **Add New… → Project** → importez `brille-group-site`.
2. **Environment Variables** (Production + Preview + Development) :

| Nom | Valeur |
|---|---|
| `DATABASE_URL` | la chaîne **pooled** Neon |
| `AUTH_SECRET` | le **même** secret que celui utilisé en local |
| `SITE_URL` | l'URL Vercel une fois connue (ou le domaine final) |
| `FORM_MIN_DELAY_MS` | `1500` (facultatif) |

3. **Deploy** (1 à 2 minutes).
4. Notez l'URL de préversion `https://brille-group-site-xxxx.vercel.app`, mettez-la dans
   `SITE_URL` si elle diffère, puis **Redeploy**.

**Points de contrôle :**

- [ ] `https://…/api/health` → `{"ok":true,"database":"up"}`.
- [ ] `/admin/login` fonctionne avec le compte créé à l'étape 2 (même base).
- [ ] Une demande envoyée en ligne apparaît dans l'administration.
- [ ] `/sitemap.xml` et `/robots.txt` répondent.

Détails : [`03-VERCEL.md`](03-VERCEL.md)

---

## Étape 5 — Tester la préversion avec les tests automatisés

```bash
E2E_BASE_URL=https://votre-projet.vercel.app \
E2E_ADMIN_EMAIL=direction@brille.test \
E2E_ADMIN_PASSWORD='…' \
E2E_ADMIN2_EMAIL=equipe@brille.test \
E2E_ADMIN2_PASSWORD='…' \
npm run test:e2e
```

Résultat attendu : `60 test(s) réussi(s), 0 échec(s)`.

Les tests créent puis suppriment leurs propres éléments. Pour une préversion de démonstration,
c'est sans risque ; sur la production avec de vraies données, lisez d'abord
[`05-TESTS.md`](05-TESTS.md).

---

## Étape 6 — Préparer la mise en ligne officielle

Dans l'ordre :

1. **Récupérer les informations de l'entreprise** →
   [`06-INFORMATIONS-A-CONFIRMER.md`](06-INFORMATIONS-A-CONFIRMER.md)
2. **Saisir les contenus** dans l'administration (aucune modification de code nécessaire) :
   coordonnées, WhatsApp, horaires, services, photos, biens, réalisations, formations.
3. **Créer un compte nominatif** pour chaque personne habilitée
   (**Utilisateurs**), et désactiver les comptes de test.
4. **Retirer les données de démonstration** : dans la liste des demandes, supprimez celles qui
   portent la mention `DÉMONSTRATION` (visible dans les notes internes).
5. **Domaine** : Vercel → Settings → Domains, puis mise à jour de `SITE_URL` et redéploiement.
6. **SEO local** : Google Search Console (sitemap) + Google Business Profile.
7. **Désactiver le bandeau** « site en cours de mise à jour » dans **Paramètres → Options**.

---

## Récapitulatif des variables d'environnement

| Variable | Où la trouver | Obligatoire |
|---|---|---|
| `DATABASE_URL` | Neon → Connect → Pooled → URI | ✅ |
| `AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` | ✅ |
| `SITE_URL` | domaine final (ou URL de préversion) | ✅ |
| `FORM_MIN_DELAY_MS` | `1500` par défaut | ❌ |

---

## Les 6 erreurs qui font perdre le plus de temps

1. **`DATABASE_URL` en variante non *pooled*** → erreurs `too many connections` aléatoires.
2. **`AUTH_SECRET` différent entre local et Vercel** → les sessions admin « sautent » après
   déploiement.
3. **`SITE_URL` non mis à jour** → sitemap et aperçus de partage pointent vers la mauvaise adresse.
4. **Mot de passe du compte admin oublié** → il faut en recréer un avec `npm run admin:create`
   (contre la bonne base !).
5. **Variables modifiées sans redéploiement** → aucun effet tant qu'on ne relance pas un
   **Redeploy**.
6. **`.env` poussé sur GitHub** → fuite de secret ; régénérez immédiatement `AUTH_SECRET` et le
   mot de passe Neon.

---

## Aide-mémoire des commandes

```bash
npm run dev            # site + API en local
npm run build          # typecheck + build + pré-rendu SEO
npm run typecheck      # vérification TypeScript
npm run db:migrate     # applique les migrations
npm run admin:create   # crée un administrateur
npm run db:reset       # réinitialise (local/test uniquement)
npm run test:e2e       # 60 tests de bout en bout
```
