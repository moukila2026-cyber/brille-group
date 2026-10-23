# 04 — Utiliser l'espace d'administration

Accès : `https://votre-domaine.com/admin/login`

---

## 1. Se connecter

- Adresse e-mail + mot de passe créés avec `npm run admin:create` (ou depuis
  **Utilisateurs** si vous êtes super administrateur).
- 8 tentatives échouées → blocage temporaire de 15 minutes (protection contre la force brute).
- La session expire après **8 heures**. Le bouton **Déconnexion** ferme immédiatement la session.
- Un message d'erreur identique s'affiche que l'e-mail existe ou non : c'est volontaire, cela
  évite de révéler quels comptes existent.

> Ne partagez jamais un compte. Créez un compte par personne pour savoir qui a traité quelle
> demande.

---

## 2. Vue d'ensemble

Compteurs calculés en temps réel depuis la base :

| Bloc | Signification |
|---|---|
| Demandes de devis | total, nouvelles, en cours (à contacter / en discussion / devis envoyé), traitées (acceptées / terminées) |
| Messages de contact | total et non lus |
| Inscriptions formation | total et nouvelles |
| Biens publiés | dont ceux marqués « disponible » |
| Réalisations publiées | dont services en ligne |

Aucun chiffre n'est inventé : si la base est vide, les compteurs affichent 0.

---

## 3. Traiter les demandes de devis

1. **Demandes de devis** → la liste affiche référence, contact, service, localisation, date, statut.
2. Utilisez la recherche (référence, nom, téléphone, e-mail, contenu) et le filtre par statut.
3. **Ouvrir** une demande pour voir le détail, puis :
   - changer le **statut** ;
   - affecter un **responsable** ;
   - ajouter des **notes internes** (jamais visibles du client) ;
   - **Enregistrer**.
4. **Exporter en CSV** (bouton en haut à droite) pour un tableur ou une sauvegarde.

### Statuts et signification

| Statut | À utiliser quand… |
|---|---|
| Nouvelle | la demande vient d'arriver, personne ne l'a encore regardée |
| À contacter | vous avez prévu de rappeler mais ne l'avez pas encore fait |
| En discussion | le premier échange a eu lieu |
| Devis envoyé | une proposition chiffrée a été transmise |
| Acceptée | le client a validé |
| Terminée | la prestation est livrée |
| Sans suite | le client ne donne plus de nouvelles (à archiver plutôt qu'à supprimer) |

**Suppression** : réservée au super administrateur, et uniquement après saisie de la **référence
exacte** de la demande. Préférez « Sans suite » : l'historique a de la valeur.

### Références

Format `DEV-2026-0001` : `DEV` + année + numéro séquentiel. Cette référence est communiquée au
client à l'envoi du formulaire ; elle sert de point de repère dans les échanges.

---

## 4. Messages et inscriptions

- **Messages** : filtrez par état (nouveau / lu / traité), cliquez sur le téléphone ou l'e-mail
  pour répondre directement, marquez « traité » une fois la réponse apportée.
- **Inscriptions** : demandes liées au catalogue de formations. Changez le statut
  (nouvelle → à contacter → inscrit).

Aucun e-mail automatique n'est envoyé : c'est à vous de recontacter le client. (Une notification
par e-mail peut être ajoutée plus tard ; voir README §6.)

---

## 5. Gérer les contenus

### Services (`/admin/services`)
Chaque élément alimente la page **Nos services** et le menu. Champs utiles :
- **Titre**, **description courte** (cartes), **description complète** (page dédiée) ;
- **Points clés** : une ligne = une puce ;
- **Image** : URL d'une photo (ex. `/images/topographie.jpg` ou l'URL d'une photo hébergée) ;
- **Service principal** : coché = affiché dans les 6 domaines mis en avant ;
- **Publié sur le site** : décocher pour masquer sans supprimer.

### Biens immobiliers (`/admin/biens`)
**Ne publiez que des biens réels et disponibles.** Champs : référence (générée si vide), titre,
type, localisation, superficie, prix, description, photos (une URL par ligne), statut
(disponible / réservé / vendu), informations complémentaires, publication.

La fiche publique affiche automatiquement les informations et un avertissement de vérification
foncière. Le bouton « Demander des informations » pré-remplit une demande de devis avec la
référence du bien.

### Réalisations (`/admin/realisations`)
Titre, catégorie (construction, aménagement foncier, topographie, immobilier, nettoyage, autres),
localisation, période, photo de couverture, galerie, description.
**Ne publiez que des projets réellement exécutés et autorisés à la diffusion.**

### Formations (`/admin/formations`)
Intitulé, objectifs, public concerné, durée, tarif (texte libre), modalités. Le catalogue public
se met à jour immédiatement.

### Publier / dépublier
Le bouton **Publier** / **Dépublier** de chaque ligne agit instantanément, sans perte de données.

---

## 6. Paramètres du site (`/admin/parametres`)

Tout ce qui apparaît sur le site se règle ici :

| Groupe | Champs clés |
|---|---|
| Identité | nom complet, nom court, slogan, forme juridique, URL du site |
| Coordonnées | téléphones (3 emplacements), **numéro WhatsApp**, e-mail, adresse, ville, région, pays, zone d'intervention, horaires |
| Réseaux sociaux | Facebook, LinkedIn, Instagram, TikTok |
| Textes | titre et sous-titre de l'accueil, présentation, mission, vision, avertissement foncier, mentions légales, RCCM |
| SEO | titre et description par défaut |
| Options | afficher le bouton WhatsApp, afficher le bandeau « site en cours de mise à jour » |

### Règle WhatsApp

Le bouton WhatsApp flottant n'apparaît **que** si :
1. le champ **Numéro WhatsApp** contient un vrai numéro au format international (ex. `2250102030405`), **et**
2. l'option **Afficher le bouton WhatsApp flottant** est cochée.

Le numéro fixe `27 24 57 11 86` ne doit **jamais** être converti en numéro WhatsApp. Tant que
l'entreprise n'a pas confirmé son numéro WhatsApp Business, laissez ces deux champs vides : le
site propose alors l'appel téléphonique et le formulaire.

### Engagements (page À propos)
Bloc JSON :

```json
[
  { "title": "Excellence", "text": "Viser un travail soigné et conforme à ce qui a été convenu." },
  { "title": "Intégrité", "text": "Communiquer clairement sur les prix, les délais et les limites de chaque prestation." },
  { "title": "Redevabilité", "text": "Répondre de ses engagements et rendre compte de l'avancement." }
]
```

---

## 7. Utilisateurs (`/admin/utilisateurs`) — super administrateur uniquement

- **Créer un compte** : nom, e-mail, mot de passe initial (12 caractères min., majuscule,
  minuscule, chiffre), rôle.
- **Désactiver** : la personne ne peut plus se connecter (ses données restent).
- **Révoquer les sessions** : déconnecte immédiatement toutes ses sessions actives (utile en cas
  de doute : ordinateur perdu, départ, mot de passe partagé).

Communicuez le mot de passe initial par un canal sûr (de vive voix ou gestionnaire de mots de
passe partagé), jamais par e-mail en clair.

---

## 8. Routine hebdomadaire recommandée

1. Consulter les **nouvelles demandes** et les passer « à contacter ».
2. Traiter les **messages** non lus.
3. Mettre à jour les **statuts** des demandes en cours.
4. Vérifier la disponibilité des **biens** (vendu / réservé).
5. Exporter les demandes en CSV une fois par mois (sauvegarde).
6. Dépublier les contenus obsolètes plutôt que les supprimer.

---

## Gestion des comptes en ligne de commande

Outils disponibles dans le dossier du projet (serveur arrêté, `Ctrl + C`) :

| Commande | Rôle |
|---|---|
| `npm run admin:list` | liste les comptes (e-mail, rôle, état, dernière connexion) |
| `npm run admin:check` | teste un e-mail et un mot de passe sans passer par le navigateur |
| `npm run admin:reset` | définit un nouveau mot de passe (déconnecte les sessions ouvertes) |
| `npm run admin:create` | crée un compte supplémentaire (`--role admin` ou `superadmin`) |

Le mot de passe n'est jamais enregistré en clair : seule son empreinte scrypt est stockée en base.
Un mot de passe perdu ne peut donc pas être retrouvé, seulement remplacé par `admin:reset`.
