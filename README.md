# BRILLE GROUP SARL — Site web premium + espace d'administration

Site web professionnel et back-office pour **BRILLE GROUP SARL**, entreprise multiservices
basée à Tazibouo (région de Daloa, Côte d'Ivoire).

> **Statut** : projet de démonstration commerciale, prêt à être déployé.
> Ce n'est **pas encore** le site officiel validé par l'entreprise : plusieurs informations
> (adresse exacte, WhatsApp, horaires, photos authentiques, réalisations, biens disponibles)
> doivent être fournies par BRILLE GROUP SARL avant la mise en ligne officielle.
> La liste complète est dans [`docs/06-INFORMATIONS-A-CONFIRMER.md`](docs/06-INFORMATIONS-A-CONFIRMER.md).

---

## 1. Ce qui est livré

| Élément | Détail |
|---|---|
| Site public | 14 pages : accueil, à propos, services (+ 6 pages métier), réalisations, immobilier + fiches de biens, formation, contact, devis, mentions légales, confidentialité, 404 |
| Formulaires | Demande de devis, contact, inscription formation, demande de nettoyage — tous réellement enregistrés en base |
| Espace d'administration | Vue d'ensemble, demandes de devis (statuts, notes internes, export CSV), messages, inscriptions, CRUD services / biens / réalisations / formations, paramètres du site, utilisateurs |
| Base de données | PostgreSQL (Neon) — migrations SQL, index, contraintes, RLS activée |
| Sécurité | Session HttpOnly signée, scrypt, anti-CSRF, validation Zod serveur, anti-spam, limitation de débit en base |
| SEO | Titres/meta par page, pré-rendu HTML par route, Open Graph, JSON-LD, sitemap.xml, robots.txt |
| Tests | 60 tests automatisés de bout en bout (API + permissions + pages) — voir [`docs/05-TESTS.md`](docs/05-TESTS.md) |
| Documentation | GitHub, Neon, Vercel, administration, dépannage — dossier [`docs/`](docs/) |

**Aucune donnée commerciale n'a été inventée** : pas de faux témoignages, pas de chiffres
d'expérience, pas de références de chantiers, pas d'annonces fictives, pas de numéro WhatsApp
fabriqué à partir du numéro fixe. Les rubriques sans contenu réel affichent un état vide assumé.

---

## 2. Stack technique

- **React 18 + TypeScript + Vite** (SPA, routes réelles, code splitting du back-office)
- **Tailwind CSS** (design system maison, palette bleu nuit / or)
- **React Router 6**
- **API Node** : un seul routeur maison (`server/`) exposé de deux façons :
  - en local via un serveur Node qui sert aussi Vite (`server/dev.ts`) ;
  - en production via une fonction serverless Vercel (`api/[...path].ts`).
- **PostgreSQL / Neon** via `pg` (pool TCP, SSL activé hors local)
- **Zod** pour la validation côté serveur
- **Aucune dépendance à un service payant** : pas de SaaS d'authentification, pas de
  service d'e-mail tiers, pas de CMS externe.

### Pourquoi `pg` et pas `@neondatabase/serverless` ?

L'API tourne sur le runtime **Node.js** de Vercel (pas Edge) : le pool TCP classique est
compatible avec la chaîne de connexion *pooled* de Neon (`-pooler`), est testable sur un
PostgreSQL local, et évite un couplage fort à un fournisseur. Le pool est mémorisé entre les
invocations d'une même instance pour ne pas saturer les connexions.

---

## 3. Structure du projet

```
.
├── api/
│   └── [...path].ts          # Fonction serverless Vercel → server/app.ts
├── db/
│   └── migrations/
│       ├── 001_init.sql      # Schéma, index, contraintes, RLS
│       └── 002_seed.sql      # Contenus de départ (issus du flyer : aucune invention)
├── server/                   # API (jamais exécutée dans le navigateur)
│   ├── app.ts                # Point d'entrée, gestion d'erreurs
│   ├── router.ts             # Routeur minimaliste
│   ├── db.ts                 # Pool PostgreSQL
│   ├── env.ts                # Chargement/validation des variables d'environnement
│   ├── auth.ts               # scrypt, session HMAC, cookies, anti-force brute
│   ├── validators.ts         # Schémas Zod (source de vérité)
│   ├── security.ts           # Limitation de débit, anti-spam
│   ├── settings.ts           # Paramètres du site (liste blanche publique)
│   ├── mappers.ts            # Lignes SQL → DTO
│   ├── http.ts               # Utilitaires HTTP
│   └── routes/
│       ├── public.ts         # Lecture publique + formulaires
│       ├── auth.ts           # Login / logout / me
│       └── admin.ts          # Toute l'administration (gardes + validation)
├── scripts/
│   ├── migrate.ts            # Applique les migrations (idempotent)
│   ├── create-admin.ts       # Création sécurisée d'un administrateur
│   ├── reset-db.ts           # Réinitialisation (dev/test uniquement)
│   ├── prerender.ts          # HTML par route + sitemap après le build
│   └── e2e.ts                # Tests de bout en bout
├── src/
│   ├── components/           # UI publique (Header, Footer, cartes, formulaires…)
│   ├── pages/                # Pages publiques
│   ├── admin/                # Back-office (chargé en lazy)
│   └── lib/                  # api client, types partagés, formatage, contexte site
├── public/
│   ├── images/               # Visuels d'illustration (à remplacer par les photos réelles)
│   ├── robots.txt
│   └── favicon.svg
├── docs/                     # Guides pas à pas
├── vercel.json               # Configuration de déploiement
└── .env.example              # Variables d'environnement (sans secret)
```

---

## 4. Démarrage local

### Windows : le plus simple

Décompressez l'archive dans un dossier simple (ex. `Documents\brille-group-site`), puis
**double-cliquez sur `DEMARRER-WINDOWS.bat`**. Le script vérifie Node.js, installe les
dépendances, lance la configuration et démarre le site.

> `npm` doit être exécuté **dans le dossier du projet** (jamais dans `C:\Windows\system32`), et
> sans recopier les commentaires `#` : voir [`docs/08-PREMIERS-PAS.md`](docs/08-PREMIERS-PAS.md).

### Chemin rapide (recommandé) — 3 commandes

```bash
npm ci            # installe les dépendances (une seule fois)
npm run setup     # assistant : .env + AUTH_SECRET + test de la base + migrations + 1er admin
npm run dev       # → http://localhost:3000  (admin : /admin/login)
```

`npm run setup` pose quelques questions (collez la chaîne Neon, choisissez un mot de passe
d'administration) et vérifie chaque étape. **Aucune édition de fichier n'est nécessaire**, et le
secret `AUTH_SECRET` est généré automatiquement.

> Guide détaillé pas à pas, avec captures des messages attendus et solutions aux erreurs
> courantes (Windows et macOS) : **[`docs/08-PREMIERS-PAS.md`](docs/08-PREMIERS-PAS.md)**.

### Chemin manuel

```bash
npm ci
cp .env.example .env      # Windows (cmd) : copy .env.example .env
#   puis renseignez DATABASE_URL (Neon, connexion « pooled ») et AUTH_SECRET (voir ci-dessous)
npm run db:migrate
npm run admin:create      # mode interactif, mot de passe masqué
npm run dev
```

Générer un `AUTH_SECRET` :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### Scripts disponibles

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement (API + Vite) |
| `npm run setup` | Assistant de configuration initiale (`.env`, base, admin) |
| `npm run build` | Typecheck + build Vite + pré-rendu HTML/sitemap |
| `npm run preview` | Sert le build statique localement (sans l'API : utilisez `npm run dev` pour tester les formulaires) |
| `npm run typecheck` | Vérification TypeScript stricte |
| `npm run db:migrate` | Applique les migrations en attente |
| `npm run admin:create` | Crée un compte administrateur |
| `npm run db:reset` | Réinitialise la base (local/test uniquement) |
| `npm run test:e2e` | Lance les 60 tests de bout en bout |

---

## 5. Sécurité — ce qui est réellement appliqué

| Risque | Mesure implémentée |
|---|---|
| Accès anonyme aux données clients | Toutes les routes `/api/admin/*` exigent une session valide ; vérifié par test (401) |
| Vol de session | Cookie `HttpOnly`, `SameSite=Lax`, `Secure` en production, jeton signé HMAC-SHA256, expiration 8 h |
| Vol de mot de passe en base | `scrypt` (N=16384) + sel aléatoire, comparaison en temps constant |
| Force brute | Blocage après 8 échecs (15 min) + limitation de débit en base ; message d'erreur identique quel que soit le cas |
| CSRF | Vérification d'origine + en-tête `X-BG-Request` obligatoire sur chaque mutation |
| Injection SQL | Requêtes paramétrées partout + liste blanche de colonnes pour les mises à jour dynamiques |
| Données invalides | Validation Zod côté serveur sur 100 % des entrées (le client ne fait que du confort) |
| Spam de formulaires | Champ piège, délai minimal de remplissage, doublon 10 min, limitation de débit par IP (empreinte non réversible) |
| Escalade de privilèges | Rôle `superadmin` obligatoire pour créer/modifier des comptes et supprimer une demande (vérifié par test) |
| Révocation de session | `token_version` en base : incrémenter invalide immédiatement toutes les sessions d'un utilisateur |
| Fuite de secrets | Aucune variable n'est préfixée `VITE_` ; `service_role`/secrets absents du navigateur ; `.env` ignoré par Git |
| Exposition directe de la base | RLS activée sur toutes les tables (refus par défaut), aucun accès direct depuis le client |
| Erreurs techniques | Journalisées côté serveur uniquement, message générique côté client |

> Les migrations **créent** la politique de refus par défaut (RLS sans politique publique).
> L'API se connecte avec le rôle propriétaire de la base : toutes les autorisations sont donc
> appliquées dans le code serveur. Si vous branchez un jour un client tiers directement sur la
> base, créez un rôle dédié avec des politiques RLS explicites.

---

## 6. Ce qui n'est volontairement pas inclus

- **Envoi d'e-mails automatique** (accusé de réception, notification interne) : nécessite un
  fournisseur (Resend, Brevo…) et la validation du domaine. Les demandes sont consultables dans
  l'administration ; c'est documenté comme évolution possible.
- **Téléversement de fichiers** dans les formulaires publics : la gestion du stockage et de la
  validation des fichiers doit être configurée (Vercel Blob / S3) avant activation.
- **Paiement en ligne**, facturation, calendrier de rendez-vous.
- **Données de démonstration commerciales** (faux biens, fausses réalisations) : interdites par
  le cahier des charges, donc absentes. La base de démonstration ne contient que les textes
  fournis par l'entreprise.

---

## 7. Documentation

| Guide | Contenu |
|---|---|
| [`docs/00-PARCOURS-COMPLET.md`](docs/00-PARCOURS-COMPLET.md) | **Checklist ordonnée de zéro à la mise en ligne** (à lire en premier) |
| [`docs/08-PREMIERS-PAS.md`](docs/08-PREMIERS-PAS.md) | **Installer, lancer et vérifier le site sur son ordinateur** (débutant, Windows/macOS) |
| [`docs/01-GITHUB.md`](docs/01-GITHUB.md) | Mettre le projet sur GitHub, pas à pas |
| [`docs/02-NEON.md`](docs/02-NEON.md) | Créer la base Neon, récupérer l'URL, migrer, créer l'admin |
| [`docs/03-VERCEL.md`](docs/03-VERCEL.md) | Déployer, variables d'environnement, domaine, préversion vs production |
| [`docs/04-ADMINISTRATION.md`](docs/04-ADMINISTRATION.md) | Utiliser le back-office au quotidien |
| [`docs/05-TESTS.md`](docs/05-TESTS.md) | Tests réellement exécutés et comment les rejouer |
| [`docs/06-INFORMATIONS-A-CONFIRMER.md`](docs/06-INFORMATIONS-A-CONFIRMER.md) | Checklist à envoyer à BRILLE GROUP SARL |
| [`docs/07-DEPANNAGE.md`](docs/07-DEPANNAGE.md) | Erreurs fréquentes et solutions |

---

## 8. Remplacer les visuels d'illustration

Les images de `public/images/` sont des **illustrations génériques** (elles ne représentent pas
des chantiers de l'entreprise). Pour les remplacer :

1. Déposez les photos réelles dans `public/images/` en conservant les noms de fichiers
   (`hero.jpg`, `btp-construction.jpg`, `topographie.jpg`, `amenagement-foncier.jpg`,
   `immobilier.jpg`, `conseils-formation.jpg`, `nettoyage.jpg`, `apropos.jpg`, `og-image.jpg`).
2. Ou modifiez le champ « Image » de chaque service dans **Administration → Services**.
3. Les visuels des annonces et des réalisations se gèrent depuis leurs fiches respectives.

Format recommandé : JPEG progressif, 1376 × 768 px, moins de 300 Ko.

---

## 9. Licence et confidentialité

Code et contenus fournis à BRILLE GROUP SARL pour son usage propre. Les coordonnées, demandes
et messages enregistrés en base sont des données personnelles : voir la page
`/politique-confidentialite` du site.

## Mise en ligne

Le guide pas à pas adapté à Windows (Git à installer, jeton GitHub, variables Vercel, vérifications) :
**`docs/09-MISE-EN-LIGNE-WINDOWS.md`**.
