# 03 — Déployer sur Vercel, pas à pas

Objectif : un site en ligne, avec préversion pour la démonstration commerciale et production
pour la mise en ligne officielle.

Durée : 15 à 20 minutes.

---

## Étape 1 — Comprendre ce qui va être déployé

| Élément | Comportement sur Vercel |
|---|---|
| Front (Vite) | `npm run build` → dossier `dist/` (fichiers statiques) |
| Pages | Le build pré-génère un `index.html` par route (SEO + partage Facebook/WhatsApp) |
| API | Le fichier `api/[...path].ts` devient **une seule fonction Node** qui sert tout `/api/*` |
| Base | Neon via `DATABASE_URL` (variable d'environnement, jamais dans le code) |
| Réécritures | `vercel.json` renvoie toute URL inconnue vers `index.html` (SPA), sauf `/api/*` |

Aucun réglage manuel de build n'est nécessaire : `vercel.json` contient déjà
`buildCommand`, `outputDirectory` et les en-têtes de sécurité.

---

## Étape 2 — Importer le projet

1. <https://vercel.com> → **Sign up / Log in** (avec GitHub, recommandé).
2. **Add New…** → **Project**.
3. **Import Git Repository** → autorisez Vercel à voir vos dépôts si demandé, puis sélectionnez
   `brille-group-site` → **Import**.
4. Vercel détecte le framework **Vite**. Ne changez pas les commandes (elles viennent de
   `vercel.json`).
5. **N'appuyez pas encore sur Deploy** : ajoutez d'abord les variables d'environnement (étape 3).

---

## Étape 3 — Variables d'environnement (obligatoire)

Section **Environment Variables**. Ajoutez, pour **Production**, **Preview** et **Development** :

| Nom | Valeur | Obligatoire |
|---|---|---|
| `DATABASE_URL` | chaîne **pooled** Neon (`...-pooler...?sslmode=require`) | ✅ |
| `AUTH_SECRET` | même secret que celui utilisé en local (48 octets aléatoires) | ✅ |
| `SITE_URL` | `https://votre-domaine.com` (ou l'URL Vercel de préversion) | ✅ |
| `FORM_MIN_DELAY_MS` | `1500` | ❌ (facultatif) |

Détails importants :

- **`SITE_URL` sert au SEO** : sitemap, canoniques, image de partage. Pour une préversion,
  mettez l'URL fournie par Vercel (ex. `https://brille-group-site.vercel.app`) ; pour la
  production, le domaine final. Un `SITE_URL` erroné ne casse pas le site mais fausse les
  canoniques : corrigez-le avant la mise en ligne officielle.
- Aucune variable ne doit être préfixée `VITE_` : elles seraient téléchargées par le navigateur.
- Ne collez jamais ces valeurs dans un fichier commité.

Puis **Deploy**.

---

## Étape 4 — Vérifier le déploiement

Une fois le build terminé (1 à 2 minutes) :

1. Ouvrez l'URL fournie (`https://brille-group-site-xxxx.vercel.app`).
2. Vérifiez dans cet ordre :
   - la page d'accueil s'affiche avec les images ;
   - `https://…/api/health` renvoie `{"ok":true,"database":"up",…}` → base joignable ;
   - `/devis` : envoyez une demande de test ;
   - `/admin/login` : connectez-vous, la demande de test doit apparaître dans **Demandes de devis**.

Si `database` vaut `down` : la variable `DATABASE_URL` est absente ou erronée (consultez
**Deployments → Functions → Logs**).

> Les comptes administrateurs sont créés **une seule fois** dans la base : le déploiement ne les
> recrée pas. Si vous avez déjà exécuté `npm run admin:create` contre cette base Neon, la
> connexion fonctionne aussi en production.

---

## Étape 5 — Distinguer préversion et production

### Option A — Une seule URL de préversion (démonstration)

Vous pouvez partager l'URL `*.vercel.app` telle quelle. Ajoutez un bandeau discret pour éviter
toute ambiguïté : **Administration → Paramètres → Options → « site en cours de mise à jour »**.
En haut du site public, un message indiquera que les informations peuvent évoluer.

### Option B — Préversion + production (recommandé avant la mise en ligne officielle)

1. Dans Vercel : **Settings → Git → Production Branch** = `main`.
2. Toute branche poussée sur GitHub crée automatiquement une **Preview Deployment** avec sa
   propre URL. C'est ce que vous montrez à l'entreprise.
3. Le domaine personnalisé reste attaché à la production : vous ne basculez qu'après validation.

---

## Étape 6 — Domaine personnalisé

1. Vercel → votre projet → **Settings → Domains** → **Add**.
2. Saisissez le domaine (ex. `brillegroup.com` et `www.brillegroup.com`).
3. Chez le registrar (Namecheap, GoDaddy, OVH, Ivoire Domaine…) créez les enregistrements indiqués
   par Vercel :
   - `A` pour `@` → l'adresse IP fournie, ou
   - `CNAME` pour `www` → `cname.vercel-dns.com`.
4. Attendez la propagation (quelques minutes à quelques heures). Vercel délivre automatiquement
   le certificat HTTPS.
5. **Mettez à jour `SITE_URL`** avec le domaine final, puis **Redeploy**.

> `.ci` : si vous prenez un domaine `.ci`, prévoyez les justificatifs demandés par le registrar
> local. Le site fonctionne très bien en `.com` en attendant.

---

## Étape 7 — Après la mise en ligne

- [ ] `SITE_URL` = domaine final, puis redéploiement.
- [ ] Vérifier `/sitemap.xml` et `/robots.txt` en ligne.
- [ ] Soumettre le sitemap à **Google Search Console** (ajout du domaine + validation).
- [ ] Créer la fiche **Google Business Profile** « BRILLE GROUP SARL » (adresse exacte requise).
- [ ] Tester le partage d'une page sur Facebook et WhatsApp (aperçu avec titre + image).
- [ ] Créer un compte administrateur nominatif par personne (pas de compte partagé).
- [ ] Programmer une sauvegarde / export mensuel des demandes (export CSV).

---

## Dépannage Vercel

| Symptôme | Cause probable | Solution |
|---|---|---|
| `404` sur `/api/...` | fonction non déployée | vérifiez que `api/[...path].ts` est bien dans le dépôt ; redéployez |
| `FUNCTION_INVOCATION_TIMEOUT` | base injoignable ou requête lente | vérifiez `DATABASE_URL` (variante *pooled*), regardez les logs |
| `{"ok":false,"database":"down"}` | variable absente / mot de passe erroné | corrigez la variable, redéployez |
| Connexion admin impossible, aucun message | cookie refusé | le site doit être en **HTTPS** (Vercel l'est) et `SITE_URL` doit correspondre au domaine utilisé |
| `too many connections` | plusieurs pools ouverts | utilisez la chaîne `-pooler` de Neon |
| Les métadonnées de partage sont celles de l'accueil | `SITE_URL` erroné ou page non pré-générée | corrigez `SITE_URL`, redéployez, puis forcez le rafraîchissement de l'aperçu Facebook |
| Le build échoue sur `tsc` | erreur TypeScript | `npm run typecheck` en local, corrigez avant de pousser |
| Variables modifiées mais site inchangé | redéploiement non déclenché | **Deployments → Redeploy** (les variables ne sont lues qu'au démarrage) |

---

## Coûts à prévoir (transparence)

| Poste | Plan gratuit | Quand passer au payant |
|---|---|---|
| Vercel | Hobby : suffisant pour ce site (100 Go/mois) | usage commercial officiel : plan Pro recommandé |
| Neon | Free : suffisant pour démarrer | si le trafic ou la taille de la base augmente |
| Domaine | — | ~10 000 à 20 000 FCFA/an selon l'extension |
| E-mail transactionnel | non inclus | si vous ajoutez les notifications par e-mail (Brevo, Resend…) |

Aucun de ces services n'est indispensable au fonctionnement du site en l'état : les demandes
sont consultables dans l'administration.
