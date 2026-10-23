# 07 — Dépannage

Les erreurs sont classées par moment où elles apparaissent.

---

## 1. Au démarrage local (`npm run dev`)

| Message | Cause | Solution |
|---|---|---|
| `[config] Variable d'environnement manquante : DATABASE_URL` | `.env` absent ou incomplet | `cp .env.example .env` puis renseignez la chaîne Neon |
| `[config] Variable d'environnement manquante : AUTH_SECRET` | idem | générez un secret : `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `[config] AUTH_SECRET trop court` | secret de moins de 32 caractères | régénérez-en un |
| `EADDRINUSE :3000` | un autre serveur occupe le port | `PORT=3001 npm run dev` ou arrêtez l'autre processus |
| `Cannot find module '@/…'` | alias Vite non résolu | vérifiez que vous lancez bien via `npm run dev` (pas `node server/dev.ts`) |

---

## 2. À l'application des migrations

| Message | Cause | Solution |
|---|---|---|
| `password authentication failed` | mot de passe de la chaîne Neon tronqué | recopiez la chaîne complète depuis Neon |
| `database "neondb" does not exist` | nom de base erroné | utilisez la chaîne fournie telle quelle |
| `permission denied for schema public` | rôle sans droit de création | utilisez le rôle propriétaire (`neondb_owner`) |
| `type "uuid" does not exist` | base non PostgreSQL | vérifiez `DATABASE_URL` |

Une migration échoue **toujours en transaction** : la base reste dans son état précédent, vous
pouvez corriger et relancer `npm run db:migrate`.

---

## 3. Sur le site public

| Symptôme | Cause | Solution |
|---|---|---|
| Bandeau « Certaines informations du site n'ont pas pu être chargées » | `/api/public/site` échoue | vérifiez `/api/health`, les logs serveur, la variable `DATABASE_URL` |
| Les images ne s'affichent pas | fichier absent de `public/images/` ou URL erronée | vérifiez le champ « Image » du service ; un visuel de repli s'affiche automatiquement |
| Le bouton WhatsApp est absent alors qu'un numéro est saisi | option non cochée, ou numéro < 8 chiffres | cochez « Afficher le bouton WhatsApp flottant », utilisez le format `225…` |
| `Formulaire soumis trop rapidement` | envoi en moins de 1,5 seconde | comportement anti-spam normal ; attendez et renvoyez |
| `Trop de demandes envoyées récemment` | plus de 6 envois/heure depuis la même IP | patientez, ou appelez l'entreprise |
| `Nous avons déjà reçu cette demande` | double clic sur le bouton | vérifiez la référence affichée précédemment |

---

## 4. Dans l'administration

| Symptôme | Cause | Solution |
|---|---|---|
| La page de connexion revient en boucle | cookie refusé (site non HTTPS, ou `SITE_URL` incohérent) | utilisez HTTPS et un `SITE_URL` correspondant au domaine |
| `E-mail ou mot de passe incorrect` malgré un bon mot de passe | compte créé contre une autre base | vérifiez `DATABASE_URL` utilisé par `admin:create` et celui du serveur |
| `Trop de tentatives` | 8 échecs en 15 minutes | attendez 15 minutes |
| « Authentification requise » après quelques heures | session expirée (8 h) | reconnectez-vous |
| Une mutation échoue avec « Origine non autorisée » | requête depuis un domaine non déclaré | ajoutez le domaine dans `SITE_URL` |
| « En-tête de sécurité manquant » | appel API hors de l'application | utilisez l'interface, ou ajoutez `X-BG-Request: 1` |
| Le formulaire d'un bien renvoie « Données invalides » | champ hors limites (prix négatif, superficie nulle…) | corrigez la valeur ; le message précise le champ |
| Un simple administrateur ne voit pas « Supprimer définitivement » | comportement attendu | action réservée au `superadmin` |

---

## 5. Sur Vercel

| Symptôme | Cause | Solution |
|---|---|---|
| `404` sur `/api/health` | fonction non déployée | vérifiez la présence de `api/[...path].ts`, redéployez |
| `FUNCTION_INVOCATION_TIMEOUT` | base injoignable / requête bloquée | chaîne Neon *pooled*, vérifiez les logs de la fonction |
| `{"ok":false,"database":"down"}` | `DATABASE_URL` absente ou erronée | corrigez la variable puis **Redeploy** |
| Les pages internes renvoient 404 | réécriture SPA absente | vérifiez `vercel.json` (`rewrites`) |
| Le partage Facebook affiche l'accueil | `SITE_URL` erroné au moment du build | corrigez, redéployez, puis rafraîchissez l'aperçu Facebook |
| Build en échec sur TypeScript | erreur de type | `npm run typecheck` en local, corrigez, poussez |

**Rappel** : toute modification de variable d'environnement nécessite un redéploiement
(**Deployments → ⋯ → Redeploy**).

---

## 6. Redémarrage propre en local

```bash
# Arrêter le serveur : Ctrl+C dans le terminal concerné
rm -rf node_modules dist
npm ci
npm run db:migrate
npm run build      # vérifie que tout compile
npm run dev
```

En cas de doute sur la base de test uniquement :

```bash
npm run db:reset   # refuse de s'exécuter hors base locale/test
npm run admin:create
```

---

## 7. Commandes de diagnostic utiles

```bash
curl -s https://votre-domaine.com/api/health            # état de l'API + base
curl -s https://votre-domaine.com/api/public/site | head -c 400
curl -s https://votre-domaine.com/sitemap.xml | head -20
npm run typecheck                                        # erreurs de type
```

Sur Vercel : **Deployments → (déploiement) → Functions → Logs** pour les erreurs serveur.
Les erreurs techniques ne sont jamais affichées au visiteur : elles indiquent seulement
« Une erreur interne est survenue ».

---

## « E-mail ou mot de passe incorrect » à la connexion admin

L'application est saine : ce message signifie que le couple saisi ne correspond à aucun compte.

**1. Vérifier les comptes réellement enregistrés**

```bat
npm run admin:list
```

La liste affiche l'e-mail exact, le rôle, l'état (actif ou désactivé) et la dernière connexion.
Une faute de frappe dans l'e-mail (une lettre, un point) suffit à provoquer ce message.

**2. Tester précisément un couple e-mail / mot de passe**

```bat
npm run admin:check
```

Le script distingue trois cas :

| Réponse | Signification |
|---|---|
| « Aucun compte ne correspond » | l'e-mail n'existe pas → voir la liste affichée |
| « l'e-mail existe mais le mot de passe ne correspond pas » | il faut réinitialiser |
| « Le couple est CORRECT » | le problème vient du navigateur (ancien cookie) : videz le cache ou utilisez une fenêtre privée |

**3. Réinitialiser le mot de passe**

```bat
npm run admin:reset
```

Saisissez l'e-mail, puis le nouveau mot de passe deux fois. La saisie est masquée (rien ne
s'affiche) : c'est normal. Les sessions déjà ouvertes sont déconnectées.

> **Rappel** : le serveur de développement occupe le terminal. Pour lancer ces commandes,
> arrêtez-le d'abord avec `Ctrl + C`, puis relancez `npm run dev` ensuite. Ou ouvrez un second
> terminal dans le même dossier.

**4. Créer un compte de secours sans attendre**

```bat
set ADMIN_PASSWORD=MonMotDePasse2026!
npm run admin:create -- --email autre-adresse@exemple.com --name "Direction Brille Group" --role superadmin
```

---

## Les avertissements « SECURITY WARNING: The SSL modes ... » dans la console

Ce ne sont pas des erreurs : la bibliothèque PostgreSQL signale un changement futur de sa
configuration SSL par défaut. La connexion, elle, est bien chiffrée. Ces messages ont été
neutralisés dans la version actuelle du projet (le paramètre `sslmode` est retiré de la chaîne
avant de créer le pool, et le SSL est activé explicitement).
