# 06 — Informations à demander à BRILLE GROUP SARL

Document à transmettre à l'entreprise **avant la mise en ligne officielle**.
Tant que ces éléments ne sont pas fournis, le site reste une démonstration : il fonctionne, mais
certaines informations sont volontairement absentes ou signalées comme « à confirmer ».

Chaque ligne indique **où** la réponse sera utilisée.

---

## A. Identité et informations légales

| À demander | Où cela apparaît |
|---|---|
| Logo officiel (PNG ou SVG, fond transparent si possible) | en-tête, pied de page, favicon, administration |
| Couleurs officielles (codes hexadécimaux si une charte existe) | thème du site |
| Nom exact à afficher (BRILLE GROUP SARL / BRILLE GROUP) | titres, mentions légales |
| RCCM complet *(fourni sur le flyer : `CI-ABJ-03-2023-B13-07234` du 03/07/2023 — à reconfirmer)* | pied de page, mentions légales |
| Compte contribuable (CC) | mentions légales |
| Capital social, siège social exact | mentions légales |
| Nom du représentant légal (directeur de la publication) | mentions légales — **obligatoire** |
| Numéro d'agrément / autorisations particulières (BTP, topographie, formation) | pages métier — **ne rien afficher sans justificatif** |

---

## B. Coordonnées

| À demander | Où cela apparaît |
|---|---|
| **Numéro WhatsApp professionnel** (format international, ex. `2250102030405`) | bouton WhatsApp flottant, pages contact |
| Confirmation de l'usage des 3 numéros du flyer (`+225 27 24 57 11 86`, `+225 07 49 63 47 26`, `+225 05 00 49 24 24`) | en-tête, pied de page, contact |
| Adresse e-mail de contact *(flyer : `contactbrillegroup@gmail.com`)* | contact, formulaires, mentions légales |
| Adresse e-mail dédiée à la réception des demandes (si différente) | notifications futures |
| Adresse postale complète (quartier, repère) à Tazibouo / Daloa | contact, mentions légales, Google Business Profile |
| Horaires d'ouverture réels | page contact, fiche Google |
| Zone d'intervention exacte (Daloa seule ? Haut-Sassandra ? tout le pays ?) | accueil, à propos, SEO |
| Liens réseaux sociaux (Facebook confirmé, LinkedIn / Instagram / TikTok le cas échéant) | pied de page |
| Personne(s) habilitée(s) à recevoir et traiter les demandes | comptes administrateurs |

> ⚠️ **Le numéro fixe ne doit pas servir à créer un lien WhatsApp.** Le champ reste vide tant
> qu'un vrai numéro WhatsApp Business n'est pas confirmé.

---

## C. Prestations réellement proposées

Pour **chaque** service, confirmer ce qui est réellement réalisé :

| Service | Questions à poser |
|---|---|
| Aménagement foncier / rural | Quelles opérations exactement ? (organisation de parcelles, accès, viabilisation, aménagement rural…) Quelles zones ? |
| BTP / construction | Construction neuve ? rénovation ? extensions ? gros œuvre seul ? Qui suit les travaux (conducteur, architecte) ? |
| Topographie | Quelles missions : relevés, implantation, plans ? L'entreprise travaille-t-elle avec un géomètre habilité (obligatoire pour le bornage) ? |
| Immobilier / terrains | Vente de terrains uniquement ? biens bâtis ? qui rédige les actes ? Quels documents sont fournis aux acheteurs (ACD, titre, certificat coutumier) ? |
| Conseils | Sur quels sujets ? sous quelle forme (accompagnement, étude) ? |
| Formation | Quels programmes, quelles durées, quels publics, quels tarifs, quelles attestations ? |
| Nettoyage professionnel | Bureaux, maisons, après travaux, vitres, surfaces ? Fréquence possible ? Personnel et produits utilisés ? |
| Agriculture / NTIC / Monétique / Transport / Mode & beauté (flyer) | Le périmètre exact de chaque activité, ou faut-il les masquer en attendant ? |

---

## D. Preuves et contenus authentiques

| À demander | Pourquoi |
|---|---|
| Photos réelles de chantiers, terrains, équipes, locaux (JPEG, min. 1200 px de large) | remplacer les illustrations génériques |
| Autorisation écrite de publier chaque réalisation (nom du client éventuellement masqué) | page Réalisations |
| Liste des terrains / biens réellement disponibles : référence interne, localisation, superficie, prix, statut, photos, documents disponibles | page Immobilier |
| Références clients ou témoignages **avec accord écrit** | aucun témoignage n'est affiché pour l'instant (choix assumé) |
| Éventuelles certifications, agréments, affiliations professionnelles (avec justificatif) | pages métier |
| Année de création, historique, effectif (si l'entreprise souhaite les publier) | page À propos |

---

## E. Décisions à prendre

1. **Nom de domaine** souhaité (`.com`, `.ci`) et qui le réserve.
2. **Hébergement** : conserver Vercel + Neon (recommandé) ou autre.
3. **Contact WhatsApp** : activé ou non.
4. **Publication des prix** immobiliers : prix affiché ou « sur demande ».
5. **Langue** : français uniquement (état actuel) ou ajout de l'anglais.
6. **Mentions légales** : validation juridique du contenu.
7. **Qui reçoit les demandes** et sous quel délai de réponse l'entreprise s'engage (le site affiche
   aujourd'hui « sous 48 h ouvrées » — à confirmer ou retirer).

---

## F. Après réception des informations — où les saisir

| Information | Emplacement |
|---|---|
| Logo, couleurs, nom | `public/images/` + `src/components/Logo.tsx` (logo) / `Administration → Paramètres` |
| Téléphones, WhatsApp, e-mail, adresse, horaires, zone, réseaux | `Administration → Paramètres → Coordonnées` |
| RCCM, CC, mentions légales | `Administration → Paramètres → Textes du site` |
| Textes de présentation, mission, vision, engagements | `Administration → Paramètres` |
| Services et photos | `Administration → Services` |
| Terrains et biens | `Administration → Biens immobiliers` |
| Réalisations | `Administration → Réalisations` |
| Formations | `Administration → Formations` |
| Comptes des personnes habilitées | `Administration → Utilisateurs` |

Aucune modification de code n'est nécessaire pour ces contenus.

---

## Logo et identité visuelle

Le logo fourni (`Logo-BRILLE-GROUP.jpg`) était **rogné à droite** : le mot « GROUP » y est
incomplet. Il a donc été **reconstruit en vectoriel** (SVG) à partir des éléments visibles :
arche rouge et bleue, bandeau blanc « BRILLE GROUP », bandeau bleu « Let’s shine together ».

| Élément | Où | Couleurs |
|---|---|---|
| Logo complet | en-tête (à partir de 640 px), pied de page, héros de l’accueil | rouge `#EE1F3A`, bleu `#1E90DE` |
| Monogramme « BG » | en-tête mobile, favicon | idem |

**À demander à l’entreprise** : le fichier logo d’origine **complet**, de préférence en `.svg`,
`.ai`, `.eps` ou `.pdf` vectoriel (sinon un PNG sur fond transparent, largeur ≥ 1200 px).
Dès réception, il suffit de remplacer les tracés de `src/components/Logo.tsx` — aucune autre
modification n’est nécessaire.

> Le logo actuel est une **reconstitution fidèle mais non officielle**. Il ne doit pas être utilisé
> sur des supports imprimés avant validation par l’entreprise.

---

## Crédit du site et contact du développeur

Le pied de page comporte la mention « Site conçu et développé par **Shopin30** », cliquable vers
`https://wa.me/2250501303343` (WhatsApp, message prérempli). Le numéro est centralisé en haut de
`src/components/Footer.tsx` (`SHOPIN_WHATSAPP`) : une seule ligne à modifier pour le changer.

Ce numéro est distinct de ceux de BRILLE GROUP et n’apparaît **que** dans ce crédit : il ne
remplace pas les moyens de contact de l’entreprise.
