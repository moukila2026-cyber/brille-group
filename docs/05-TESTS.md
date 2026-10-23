# 05 — Tests réellement exécutés

Ce document décrit **ce qui a été vérifié sur ce projet**, pas ce qui devrait l'être.

---

## 1. Environnement des tests

| Élément | Valeur |
|---|---|
| TypeScript | `npm run typecheck` — 0 erreur (mode strict) |
| Base de test | PostgreSQL 18 réel, instance locale, base `brille` |
| Build de production | `npm run build` — réussi (typecheck + Vite + pré-rendu) |
| Tests E2E | `npm run test:e2e` — **60 tests, 60 réussis** |
| Tests navigateur | Parcours complet dans un Chromium réel (connexion, création, modification, suppression, déconnexion) en 1440 px et 390 px |
| Débordement horizontal | Aucun détecté sur mobile (390 px) et desktop (1440 px) |
| Erreurs console navigateur | Aucune sur les pages testées |

---

## 2. Couverture des 60 tests E2E

### Disponibilité
1. `GET /api/health` répond 200
2. La base est joignable (`database: up`)

### API publique — confidentialité
3. `GET /api/public/site` répond 200
4. Le nom de l'entreprise provient de la base
5. Les 6 services principaux sont publiés
6. Aucun service non publié n'est exposé
7. **Aucun numéro WhatsApp n'est inventé** (`whatsappConfigured: false`)
8. Un visiteur anonyme ne peut pas lire les demandes (401)
9. Un visiteur anonyme ne peut pas lire les paramètres (401)
10. Un visiteur anonyme ne peut pas lire les statistiques (401)

### Formulaire de devis
11. Les champs invalides sont refusés (422)
12. Les erreurs détaillées sont renvoyées par champ
13. Le consentement est obligatoire (422)
14. Le champ piège bloque les robots (400)
15. La demande est réellement enregistrée (201)
16. Une référence est attribuée
17. La référence suit le format `DEV-AAAA-NNNN`
18. Une soumission identique immédiate est bloquée (409)
19. Le message de contact est enregistré (201)

### Authentification
20. Un mot de passe erroné est refusé (401)
21. La connexion réussit (200)
22. Le cookie de session est `HttpOnly`
23. Le cookie de session est `SameSite=Lax`
24. La session est reconnue (`/api/auth/me`)

### Administration — demandes
25. Les demandes sont visibles pour l'administrateur
26. Le statut d'une demande peut être modifié
27. Une mutation sans en-tête anti-CSRF est refusée (403)
28. Les statistiques proviennent de la base
29. L'export CSV est accessible à l'administrateur
30. L'export CSV est refusé aux anonymes (401)

### CRUD contenu
31. Un service peut être créé
32. Le slug est généré automatiquement
33. Un service non publié n'apparaît pas publiquement
34. Un service peut être publié
35. Le service publié apparaît publiquement
36. La validation serveur refuse un titre trop court (422)
37. Un bien immobilier peut être créé
38. Les filtres publics (type, prix max, surface min) renvoient le bien créé
39. La fiche détaillée d'un bien est accessible publiquement
40. Un bien peut être supprimé par un administrateur

### Paramètres
41. Les paramètres peuvent être modifiés
42. La modification est visible sur le site public
43. Les paramètres ont été restaurés

### Rôles et actions sensibles
44. Un second compte (rôle `admin`) peut se connecter
45. Un simple administrateur **ne peut pas supprimer** une demande (403)
46. Un simple administrateur **ne peut pas créer** de compte (403)
47. La suppression exige la référence exacte (400)
48. Le super administrateur peut supprimer après confirmation
49. Le service de test est supprimé

### Session
50. La déconnexion répond 200
51. L'accès aux demandes est refusé après déconnexion (401)

### Pages publiques
52–59. `/`, `/a-propos`, `/services`, `/btp-construction`, `/immobilier`, `/formation`,
`/contact`, `/devis` répondent 200

### SEO
60. `robots.txt` est servi et référence le sitemap

---

## 3. Parcours navigateur réellement cliqués

| Parcours | Résultat |
|---|---|
| Connexion `/admin/login` → tableau de bord | ✅ |
| Ouverture d'une demande → changement de statut → note interne → enregistrement | ✅ (données visibles en base) |
| Création d'un bien via le formulaire d'administration → visible dans la liste → suppression | ✅ |
| Modification des paramètres (numéro WhatsApp) → bouton WhatsApp apparaît sur le site public | ✅ |
| Retrait du numéro WhatsApp → bouton disparaît (aucun numéro inventé) | ✅ |
| Déconnexion → accès `/admin/demandes` redirigé vers la connexion | ✅ |
| Administration en 390 px (menu, tableaux, modales) | ✅ sans débordement |
| Pages publiques en 390 px et 1440 px | ✅ sans débordement |

---

## 4. Rejouer les tests

```bash
# 1. base migrée
npm run db:migrate

# 2. deux comptes de test (si ce n'est pas déjà fait)
ADMIN_PASSWORD='TestSuperAdmin2026!' npm run admin:create -- \
  --email direction@brille.test --name "Super Admin Test" --role superadmin
ADMIN_PASSWORD='TestAdmin2026!Compte' npm run admin:create -- \
  --email equipe@brille.test --name "Admin Test" --role admin

# 3. serveur
npm run dev

# 4. tests (dans un autre terminal)
E2E_BASE_URL=http://localhost:3000 \
E2E_ADMIN_EMAIL=direction@brille.test \
E2E_ADMIN_PASSWORD='TestSuperAdmin2026!' \
E2E_ADMIN2_EMAIL=equipe@brille.test \
E2E_ADMIN2_PASSWORD='TestAdmin2026!Compte' \
npm run test:e2e
```

Le script :
- remet à zéro les compteurs anti-spam **uniquement** sur une base locale/de test ;
- supprime ses propres artefacts des exécutions précédentes (services `service-de-test-e2e-*`,
  biens `Terrain de test E2E*`) ;
- utilise des identifiants uniques par exécution ;
- nettoie tout ce qu'il crée (service, bien, demande).

Sur une base distante, définissez `E2E_ALLOW_RESET=1` en connaissance de cause.

### Tester la préversion déployée

```bash
E2E_BASE_URL=https://votre-projet.vercel.app \
E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... \
E2E_ADMIN2_EMAIL=... E2E_ADMIN2_PASSWORD=... \
npm run test:e2e
```

> Les tests créent puis suppriment des éléments. Ne les lancez pas sur la production avec de
> vraies données clients sans avoir lu le script.

---

## 5. Ce qui n'a pas été testé (et pourquoi)

| Non testé | Raison |
|---|---|
| Envoi d'e-mails | non implémenté (pas de fournisseur configuré) |
| Téléversement de fichiers | non activé (aucun stockage configuré) |
| Paiement en ligne | hors périmètre |
| Montée en charge (1000 visiteurs simultanés) | non réalisée ; le pool PostgreSQL est limité à 5 connexions par instance et Neon mutualise les connexions |
| Restauration de sauvegarde Neon | dépend du plan et de la politique de l'entreprise |
