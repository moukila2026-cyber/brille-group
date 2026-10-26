# Fiche PDF — BRILLE GROUP SARL (Daloa)

**Fichier à diffuser : [`BRILLE-GROUP-Daloa-fiche-services.pdf`](BRILLE-GROUP-Daloa-fiche-services.pdf)**
(2 pages A4, recto/verso, 1,4 Mo)

## Contenu

| Page | Contenu |
|---|---|
| 1 — Recto | Logo officiel, accroche, présentation de l’entreprise, **QR code du site** (cliquable), appel à l’action WhatsApp, aperçu des six pôles d’activité, bandeau de contact |
| 2 — Verso | Détail des six pôles avec les prestations, activités complémentaires, méthode de travail en 4 étapes, coordonnées complètes (cliquables), second QR code, mentions RCCM |

- **QR code** : `https://brille-group.vercel.app/` — testé, il se décode correctement à l’impression comme à l’écran.
- **Liens actifs** : WhatsApp, appels téléphoniques, e-mail, page Facebook et site web.
- **Charte** : bleu nuit `#0D1A2D`, rouge `#EE1F3A`, bleu `#1E90DE` (couleurs du logo et du site).

## Informations utilisées

Toutes les informations proviennent du site public **https://brille-group.vercel.app**
(accueil, `/contact`, `/services`) : adresse à Tazibouo (Daloa), téléphones Bureau / Sercom /
WhatsApp, e-mail, page Facebook, RCCM `CI-ABJ-03-2023-B13-07234` et description des prestations.
Aucune donnée n’a été inventée.

> Les photos sont des **illustrations** issues du site (elles ne représentent pas des chantiers
> de l’entreprise). La mention « Photos d’illustration » figure au bas du recto. Dès que
> BRILLE GROUP fournit ses propres photos, il suffit de remplacer les fichiers dans
> `public/images/` puis de relancer la génération.

## Régénérer le PDF

```bash
python3 -m venv .venv
.venv/bin/pip install reportlab qrcode pillow      # une seule fois
.venv/bin/python flyer/build_flyer.py
```

Le script télécharge les polices **Poppins** et **Lato** (licence SIL Open Font License) dans
`flyer/fonts/` au premier lancement, puis écrit le PDF dans ce dossier.

Pour changer l’adresse encodée dans le QR code (par exemple le futur domaine
`www.brillegroup.com`), modifiez la constante `SITE_URL` en haut de `flyer/build_flyer.py`
et relancez la commande : les deux QR codes et les liens sont mis à jour automatiquement.

Après substitution du logo ou des photos, aucune autre modification n’est nécessaire :
le script reprend automatiquement `public/images/logo-brille-group.png` et les visuels du site.
