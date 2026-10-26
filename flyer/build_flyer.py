#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BRILLE GROUP SARL — fiche PDF (Daloa, Côte d'Ivoire)
====================================================

Génère une fiche commerciale A4 recto/verso avec le QR code du site web,
les coordonnées et le détail des six pôles d'activité.

Usage
-----
    python3 flyer/build_flyer.py

Prérequis : reportlab, qrcode, pillow
    python3 -m venv .venv && .venv/bin/pip install reportlab qrcode pillow

Les polices (Poppins, Lato — SIL Open Font License) sont téléchargées
automatiquement dans flyer/fonts/ au premier lancement (dossier ignoré par Git).

Aucune donnée commerciale n'est inventée : les textes proviennent du site
public https://brille-group.vercel.app (mise à jour du 26/10/2026).
"""

from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path

try:
    import qrcode
    from PIL import Image
    from reportlab.lib.colors import Color, HexColor
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.pdfgen import canvas
except ImportError as exc:  # pragma: no cover
    sys.exit(
        f"Dépendance manquante ({exc}).\n"
        "Installez-les avec :\n"
        "  python3 -m venv .venv && .venv/bin/pip install reportlab qrcode pillow"
    )

# ---------------------------------------------------------------------------
# Chemins
# ---------------------------------------------------------------------------

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
FONTS = HERE / "fonts"
BUILD = HERE / ".build"
IMAGES = REPO / "public" / "images"
OUTPUT = HERE / "BRILLE-GROUP-Daloa-fiche-services.pdf"

SITE_URL = "https://brille-group.vercel.app/"
SITE_LABEL = "brille-group.vercel.app"
WHATSAPP_URL = "https://wa.me/2250749634726"
FACEBOOK_URL = "https://web.facebook.com/Brille-Group-Sarl-151826211353649/"
DOC_DATE = "26 octobre 2026"

# ---------------------------------------------------------------------------
# Charte graphique (relevée sur le site et le logo)
# ---------------------------------------------------------------------------

NAVY_950 = HexColor("#08111F")
NAVY_900 = HexColor("#0D1A2D")
NAVY_800 = HexColor("#16253D")
NAVY_700 = HexColor("#22375A")
NAVY_600 = HexColor("#2C4670")
NAVY_500 = HexColor("#3C5C8A")
NAVY_400 = HexColor("#5E7DA8")
NAVY_300 = HexColor("#94A9C9")
NAVY_200 = HexColor("#C3CFE3")
NAVY_100 = HexColor("#E3E9F3")
NAVY_50 = HexColor("#F2F5FA")
AZURE = HexColor("#1E90DE")
AZURE_DARK = HexColor("#1173BD")
AZURE_200 = HexColor("#B6E2FB")
AZURE_100 = HexColor("#D9F0FD")
AZURE_50 = HexColor("#EEF8FE")
RED = HexColor("#EE1F3A")
RED_DARK = HexColor("#C0132B")
RED_SOFT = HexColor("#FDE8EB")
GOLD = HexColor("#D6A945")
GOLD_SOFT = HexColor("#FBF7EC")
PAPER = HexColor("#F6F8FC")
WHITE = HexColor("#FFFFFF")

# ---------------------------------------------------------------------------
# Typographie
# ---------------------------------------------------------------------------

FONTS_SPEC = {
    "Poppins-XB": ("Poppins-ExtraBold.ttf", "ofl/poppins/Poppins-ExtraBold.ttf"),
    "Poppins-B": ("Poppins-Bold.ttf", "ofl/poppins/Poppins-Bold.ttf"),
    "Poppins-SB": ("Poppins-SemiBold.ttf", "ofl/poppins/Poppins-SemiBold.ttf"),
    "Poppins-M": ("Poppins-Medium.ttf", "ofl/poppins/Poppins-Medium.ttf"),
    "Poppins-R": ("Poppins-Regular.ttf", "ofl/poppins/Poppins-Regular.ttf"),
    "Lato": ("Lato-Regular.ttf", "ofl/lato/Lato-Regular.ttf"),
    "Lato-B": ("Lato-Bold.ttf", "ofl/lato/Lato-Bold.ttf"),
    "Lato-Black": ("Lato-Black.ttf", "ofl/lato/Lato-Black.ttf"),
    "Lato-I": ("Lato-Italic.ttf", "ofl/lato/Lato-Italic.ttf"),
}


def fetch_font(filename: str, github_path: str) -> None:
    """Télécharge une police depuis le dépôt google/fonts (API GitHub, brut)."""
    FONTS.mkdir(parents=True, exist_ok=True)
    target = FONTS / filename
    if target.exists() and target.stat().st_size > 10_000:
        return
    url = f"https://api.github.com/repos/google/fonts/contents/{github_path}"
    request = urllib.request.Request(url, headers={"Accept": "application/vnd.github.raw"})
    with urllib.request.urlopen(request, timeout=60) as response:
        data = response.read()
    if not data.startswith(b"\x00\x01\x00\x00"):
        raise RuntimeError(f"Réponse inattendue pour {filename}")
    target.write_bytes(data)


def register_fonts() -> None:
    for name, (filename, github_path) in FONTS_SPEC.items():
        fetch_font(filename, github_path)
        pdfmetrics.registerFont(TTFont(name, str(FONTS / filename)))


# ---------------------------------------------------------------------------
# Contenus (source : site public, page d'accueil, /contact, /services)
# ---------------------------------------------------------------------------

SERVICES = [
    {
        "num": "01",
        "title": "Aménagement foncier & rural",
        "image": "amenagement-foncier.jpg",
        "short": "Préparation, structuration, ouverture d’accès et valorisation de terrains urbains et ruraux.",
        "long": "Préparation, structuration, ouverture d’accès et mise en valeur de terrains urbains et ruraux.",
        "bullets": [
            "Étude du besoin et visite du site",
            "Organisation et structuration des parcelles",
            "Ouverture des voies d’accès et viabilisation",
            "Mise en valeur d’espaces urbains et ruraux",
        ],
    },
    {
        "num": "02",
        "title": "Construction de bâtiments — BTP",
        "image": "btp-construction.jpg",
        "short": "Cités résidentielles, villas, studios, locaux professionnels et suivi de chantier.",
        "long": "Construction de cités résidentielles, villas, studios et locaux professionnels, gros œuvre et second œuvre.",
        "bullets": [
            "Bâtiments et cités résidentielles (2 et 3 pièces, studios)",
            "Gros œuvre, second œuvre et travaux de bâtiment",
            "Rénovation, extension et réhabilitation",
            "Devis détaillé, coordination et suivi de chantier",
        ],
    },
    {
        "num": "03",
        "title": "Topographie",
        "image": "topographie.jpg",
        "short": "Relevés, plans de terrain et implantation d’ouvrages, avec des professionnels habilités.",
        "long": "Relevés topographiques, plans de terrain, implantation d’ouvrages et coordination des intervenants.",
        "bullets": [
            "Relevés topographiques et plans de terrain",
            "Implantation de bâtiments et de lotissements",
            "Documents graphiques pour dossiers techniques",
            "Prestations réglementées par des professionnels habilités",
        ],
    },
    {
        "num": "04",
        "title": "Immobilier & vente de terrains",
        "image": "immobilier.jpg",
        "short": "Terrains et biens immobiliers, visites sur rendez-vous et accompagnement transparent.",
        "long": "Vente de terrains et de biens immobiliers, visites sur rendez-vous et accompagnement à l’acquisition.",
        "bullets": [
            "Vente de terrains urbains et ruraux",
            "Biens immobiliers et logements",
            "Visites sur rendez-vous et accompagnement",
            "Vérification préalable des documents fonciers",
        ],
    },
    {
        "num": "05",
        "title": "Conseils & formation",
        "image": "conseils-formation.jpg",
        "short": "Conseil aux porteurs de projets et formations professionnelles adaptées.",
        "long": "Conseil opérationnel aux porteurs de projets, formations professionnelles et appui aux équipes.",
        "bullets": [
            "Conseil et accompagnement des porteurs de projets",
            "Formations professionnelles sur demande",
            "Appui organisationnel aux équipes et entreprises",
            "Interventions à Daloa et partout en Côte d’Ivoire",
        ],
    },
    {
        "num": "06",
        "title": "Nettoyage industriel & Hygiène 3D",
        "image": "nettoyage.jpg",
        "short": "Fauteuils, matelas, moquettes, marbre, vitres, fin de chantier et lutte anti-nuisibles.",
        "long": "Nettoyage industriel (fauteuils, matelas, moquettes, marbre, baies vitrées, intérieur auto) et hygiène 3D.",
        "bullets": [
            "Nettoyage et désinfection de fauteuils, matelas, tapis",
            "Fin de chantier, façades, marbre, intérieur auto",
            "Dératisation, désinsectisation, désinfection",
            "Désodorisation et traitement des nuisibles",
        ],
    },
]

COMPLEMENTARY = ["Agriculture", "NTIC", "Monétique", "Transport", "Mode & beauté"]

HIGHLIGHTS = [
    "Un référent unique par dossier",
    "Devis écrit avant intervention",
    "Partout en Côte d’Ivoire",
    "Professionnels habilités",
]

METHOD = [
    (
        "01",
        "Vous décrivez le besoin",
        "Par WhatsApp, téléphone ou formulaire : localisation, surface, délais et budget envisagé.",
    ),
    (
        "02",
        "Nous vérifions la faisabilité",
        "Visite ou repérage sur place, contrôle des pièces et mobilisation des intervenants qualifiés.",
    ),
    (
        "03",
        "Vous recevez un devis écrit",
        "Prestations, quantités, délais et conditions : rien n’est engagé avant votre accord.",
    ),
    (
        "04",
        "Nous exécutons et rendons compte",
        "Suivi de l’avancement, puis réception soignée avec remise des éléments convenus.",
    ),
]

# ---------------------------------------------------------------------------
# Outils de dessin (coordonnées en millimètres, origine en haut à gauche)
# ---------------------------------------------------------------------------

PAGE_W, PAGE_H = A4  # en points
W_MM, H_MM = 210.0, 297.0


def top(t_mm: float, h_mm: float = 0.0) -> float:
    """Ordonnée PDF (bas → haut) du bord inférieur d'un bloc positionné par son haut."""
    return PAGE_H - (t_mm + h_mm) * mm


def rrect(c, x, t, w, h, r, fill=None, stroke=None, line=0.4, alpha=1.0):
    c.saveState()
    if fill is not None:
        c.setFillColor(fill)
        c.setFillAlpha(alpha)
    if stroke is not None:
        c.setStrokeColor(stroke)
        c.setLineWidth(line)
    c.roundRect(x * mm, top(t, h), w * mm, h * mm, r * mm, stroke=1 if stroke else 0, fill=1 if fill else 0)
    c.restoreState()


def rect(c, x, t, w, h, fill=None, stroke=None, line=0.4, alpha=1.0):
    rrect(c, x, t, w, h, 0, fill=fill, stroke=stroke, line=line, alpha=alpha)


def shadow(c, x, t, w, h, r=3.0, spread=1.0, alpha=0.05):
    c.saveState()
    c.setFillColor(Color(0.03, 0.07, 0.13, alpha=alpha))
    for offset, a in ((spread, alpha * 0.55), (spread * 0.5, alpha)):
        c.setFillAlpha(a)
        c.roundRect(
            x * mm - 0.6 * mm,
            top(t, h) - offset * mm,
            w * mm + 1.2 * mm,
            h * mm + offset * 0.8 * mm,
            r * mm,
            stroke=0,
            fill=1,
        )
    c.restoreState()


def text_width(s: str, font: str, size: float, tracking: float = 0.0) -> float:
    return pdfmetrics.stringWidth(s, font, size) + tracking * max(len(s) - 1, 0)


def draw_text(
    c,
    x,
    t,
    s,
    font,
    size,
    color,
    align="left",
    tracking=0.0,
    alpha=1.0,
    cap=0.70,
):
    """Écrit `s` avec le haut des capitales à `t` mm."""
    c.saveState()
    c.setFillColor(color)
    c.setFillAlpha(alpha)
    width = text_width(s, font, size, tracking)
    x_pt = x * mm
    if align == "center":
        x_pt -= width / 2
    elif align == "right":
        x_pt -= width
    text_object = c.beginText(x_pt, PAGE_H - t * mm - cap * size)
    text_object.setFont(font, size)
    text_object.setCharSpace(tracking)
    text_object.textOut(s)
    c.drawText(text_object)
    c.restoreState()
    return width


def wrap(s: str, font: str, size: float, max_w_mm: float, tracking: float = 0.0) -> list[str]:
    max_w = max_w_mm * mm
    lines: list[str] = []
    for paragraph in s.split("\n"):
        words = paragraph.split(" ")
        current = ""
        for word in words:
            candidate = f"{current} {word}".strip()
            if text_width(candidate, font, size, tracking) <= max_w or not current:
                current = candidate
            else:
                lines.append(current)
                current = word
        lines.append(current)
    return lines


def paragraph(
    c,
    x,
    t,
    w,
    s,
    font,
    size,
    leading,
    color,
    tracking=0.0,
    alpha=1.0,
    cap=0.70,
    align="left",
):
    """Paragraphe justifié à gauche ; renvoie la hauteur consommée (mm)."""
    lines = wrap(s, font, size, w, tracking)
    for index, line in enumerate(lines):
        draw_text(
            c,
            x,
            t + index * leading,
            line,
            font,
            size,
            color,
            align=align,
            tracking=tracking,
            alpha=alpha,
            cap=cap,
        )
    return len(lines) * leading


# ---------------------------------------------------------------------------
# Images (version allégée mise en cache pour garder un PDF léger)
# ---------------------------------------------------------------------------


def optimized_image(path: Path, max_px: int = 900) -> Path:
    """Crée (une seule fois) une copie JPEG redimensionnée dans flyer/.build/."""
    if path.suffix.lower() == ".png":
        return path
    target = BUILD / "img" / path.name
    if target.exists() and target.stat().st_mtime >= path.stat().st_mtime:
        return target
    target.parent.mkdir(parents=True, exist_ok=True)
    image = Image.open(path).convert("RGB")
    if max(image.size) > max_px:
        image.thumbnail((max_px, max_px), Image.LANCZOS)
    image.save(target, "JPEG", quality=84, optimize=True, progressive=False)
    return target


def cover_image(c, path, x, t, w, h, r=0.0, focus_x=0.5, focus_y=0.5):
    """Image recadrée pour remplir la zone (comme object-fit: cover)."""
    path = optimized_image(Path(path))
    px_w, px_h = Image.open(path).size
    box_w, box_h = w * mm, h * mm
    scale = max(box_w / px_w, box_h / px_h)
    draw_w, draw_h = px_w * scale, px_h * scale
    dx = x * mm + (box_w - draw_w) * focus_x
    dy = top(t, h) + (box_h - draw_h) * (1 - focus_y)
    c.saveState()
    if r:
        p = c.beginPath()
        p.roundRect(x * mm, top(t, h), box_w, box_h, r * mm)
        c.clipPath(p, stroke=0, fill=0)
    else:
        p = c.beginPath()
        p.rect(x * mm, top(t, h), box_w, box_h)
        c.clipPath(p, stroke=0, fill=0)
    c.drawImage(str(path), dx, dy, draw_w, draw_h, mask="auto")
    c.restoreState()


def check(c, x, t, size=3.2, color=RED, tick=WHITE):
    c.saveState()
    c.setFillColor(color)
    c.circle((x + size / 2) * mm, top(t, size / 2), size / 2 * mm, stroke=0, fill=1)
    c.setStrokeColor(tick)
    c.setLineWidth(size * 0.16 * mm)
    c.setLineCap(1)
    p = c.beginPath()
    p.moveTo((x + size * 0.27) * mm, top(t, size * 0.55))
    p.lineTo((x + size * 0.44) * mm, top(t, size * 0.73))
    p.lineTo((x + size * 0.75) * mm, top(t, size * 0.32))
    c.drawPath(p, stroke=1, fill=0)
    c.restoreState()


def pill(c, x, t, label, font, size, fg, bg, pad_x=3.2, h=6.2, tracking=0.2, stroke=None):
    width = text_width(label, font, size, tracking) / mm + pad_x * 2
    rrect(c, x, t, width, h, h / 2, fill=bg, stroke=stroke, line=0.4)
    draw_text(c, x + pad_x, t + (h - size * 0.70 * 0.3528) / 2, label, font, size, fg, tracking=tracking, cap=0.70)
    return width


def gradient_bar(c, x, t, w, h):
    c.saveState()
    p = c.beginPath()
    p.rect(x * mm, top(t, h), w * mm, h * mm)
    c.clipPath(p, stroke=0, fill=0)
    c.linearGradient(x * mm, top(t, h), (x + w) * mm, top(t, h), (RED, WHITE, AZURE), (0, 0.5, 1))
    c.restoreState()


def bg_gradient(c, x, t, w, h, colors=("#0D1A2D", "#08111F")):
    c.saveState()
    p = c.beginPath()
    p.rect(x * mm, top(t, h), w * mm, h * mm)
    c.clipPath(p, stroke=0, fill=0)
    c.linearGradient(
        x * mm,
        top(t, h),
        x * mm,
        top(t, 0),
        (HexColor(colors[0]), HexColor(colors[1])),
    )
    c.restoreState()


# ---------------------------------------------------------------------------
# QR code
# ---------------------------------------------------------------------------

def make_qr(url: str, path: Path, modules_color="#0D1A2D") -> Path:
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=36, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    image = qr.make_image(fill_color=modules_color, back_color="white")
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)
    return path


# ---------------------------------------------------------------------------
# Page 1 — vitrine
# ---------------------------------------------------------------------------

M = 14.0  # marge gauche / droite (mm)


def page_one(c: canvas.Canvas, logo: Path, qr: Path) -> None:
    """Recto : identité, présentation, QR code et aperçu des six métiers."""
    rect(c, 0, 0, W_MM, H_MM, fill=PAPER)

    # ---------------- En-tête bleu nuit -------------------------------------
    HEADER_H = 100.0
    bg_gradient(c, 0, 0, W_MM, HEADER_H, ("#132745", "#08111F"))

    # Arches décoratives (rappel du logo), limitées à l'en-tête
    c.saveState()
    clip = c.beginPath()
    clip.rect(0, top(0, HEADER_H), W_MM * mm, HEADER_H * mm)
    c.clipPath(clip, stroke=0, fill=0)
    for radius, line_width, color, alpha in (
        (78, 9, RED, 0.15),
        (63, 7, AZURE, 0.18),
        (48, 4, WHITE, 0.09),
    ):
        c.setStrokeColor(color)
        c.setStrokeAlpha(alpha)
        c.setLineWidth(line_width)
        c.circle((W_MM + 6) * mm, top(0, -10), radius * mm, stroke=1, fill=0)
    c.restoreState()

    gradient_bar(c, 0, HEADER_H - 1.2, W_MM, 1.2)

    # Carte logo
    card_x, card_t, card_w, card_h = M, 12, 70, 39
    shadow(c, card_x, card_t, card_w, card_h, r=4, alpha=0.25)
    rrect(c, card_x, card_t, card_w, card_h, 4, fill=WHITE)
    logo_w = 50.0
    logo_h = logo_w * 960 / 1840
    c.drawImage(
        str(logo),
        (card_x + (card_w - logo_w) / 2) * mm,
        top(card_t + (card_h - logo_h) / 2, logo_h),
        logo_w * mm,
        logo_h * mm,
        mask="auto",
    )

    # Accroche
    draw_text(c, M, 60.5, "ENTREPRISE IVOIRIENNE MULTISERVICES", "Lato-B", 6.4, AZURE_200, tracking=1.4)
    draw_text(c, W_MM - M, 60.5, "Let’s shine together", "Lato-I", 8.6, GOLD, align="right")

    head_lines = paragraph(
        c,
        M,
        67.5,
        102,
        "Construire, aménager et valoriser vos projets.",
        "Poppins-B",
        15.2,
        7.4,
        WHITE,
    )
    sub_y = 67.5 + head_lines + 2.4
    paragraph(
        c,
        M,
        sub_y,
        101,
        "Aménagement foncier · BTP & construction · Topographie · Immobilier · Formation · Nettoyage & hygiène 3D",
        "Lato",
        6.9,
        3.7,
        NAVY_200,
    )

    # Photo d'en-tête
    photo_x, photo_t, photo_w, photo_h = 126, 12, 70, 79
    shadow(c, photo_x, photo_t, photo_w, photo_h, r=4, alpha=0.32)
    cover_image(c, IMAGES / "hero.jpg", photo_x, photo_t, photo_w, photo_h, r=4)
    rrect(c, photo_x, photo_t, photo_w, photo_h, 4, stroke=Color(1, 1, 1, 0.35), line=0.6)
    pill(
        c,
        photo_x + 4,
        photo_t + photo_h - 10,
        "BTP · CONSTRUCTION",
        "Lato-B",
        5.2,
        WHITE,
        Color(0.05, 0.10, 0.18, 0.72),
        pad_x=2.6,
        h=5.2,
        tracking=1.0,
    )

    # ---------------- Présentation -----------------------------------------
    draw_text(c, M, 108, "QUI SOMMES-NOUS", "Lato-B", 6.4, RED, tracking=1.4)
    title_lines = paragraph(
        c,
        M,
        114.5,
        98,
        "Un interlocuteur unique, du terrain au bâtiment livré.",
        "Poppins-SB",
        12.6,
        6.0,
        NAVY_900,
    )

    intro = (
        "BRILLE GROUP SARL est une entreprise ivoirienne multiservices implantée à Daloa "
        "(Tazibouo), dans le Haut-Sassandra. Elle réunit sous un même toit l’aménagement foncier, "
        "la construction et le BTP, la topographie, l’immobilier, le conseil et la formation, "
        "le nettoyage industriel et l’hygiène 3D."
    )
    para_y = 114.5 + title_lines + 2.6
    p_lines = paragraph(c, M, para_y, 98, intro, "Lato", 7.5, 4.0, NAVY_600)

    highlight_y = para_y + p_lines + 3.2
    for index, item in enumerate(HIGHLIGHTS):
        col = index % 2
        row = index // 2
        hx = M + col * 49
        hy = highlight_y + row * 7.0
        check(c, hx, hy - 0.2, 3.1)
        draw_text(c, hx + 4.6, hy, item, "Lato-B", 6.9, NAVY_800)

    # ---------------- Appel à l'action (WhatsApp) ---------------------------
    cta_x, cta_t, cta_w, cta_h = M, 160.0, 98, 18.5
    shadow(c, cta_x, cta_t, cta_w, cta_h, r=3.4, alpha=0.18, spread=0.9)
    c.saveState()
    clip = c.beginPath()
    clip.roundRect(cta_x * mm, top(cta_t, cta_h), cta_w * mm, cta_h * mm, 3.4 * mm)
    c.clipPath(clip, stroke=0, fill=0)
    c.linearGradient(
        cta_x * mm,
        top(cta_t, 0),
        (cta_x + cta_w) * mm,
        top(cta_t, 0),
        (RED_DARK, RED, AZURE),
        (0, 0.45, 1),
    )
    c.restoreState()
    draw_text(c, cta_x + 5, cta_t + 3.3, "UN PROJET EN TÊTE ?", "Lato-B", 5.6, Color(1, 1, 1, 0.85), tracking=1.3)
    draw_text(c, cta_x + 5, cta_t + 7.4, "Recevez un devis écrit", "Poppins-SB", 9.2, WHITE)
    draw_text(c, cta_x + 5, cta_t + 13.2, "WhatsApp +225 07 49 63 47 26  ·  réponse rapide", "Lato", 6.3, Color(1, 1, 1, 0.92))
    btn_w, btn_h = 27.0, 7.0
    btn_x, btn_t = cta_x + cta_w - btn_w - 4.5, cta_t + (cta_h - btn_h) / 2
    rrect(c, btn_x, btn_t, btn_w, btn_h, btn_h / 2, fill=WHITE)
    label_w = text_width("ÉCRIRE", "Poppins-SB", 6.0, 0.5) / mm
    arrow_w = 3.2
    start_x = btn_x + (btn_w - (label_w + 1.6 + arrow_w)) / 2
    draw_text(c, start_x, btn_t + 1.95, "ÉCRIRE", "Poppins-SB", 6.0, RED_DARK, tracking=0.5)
    ax = start_x + label_w + 1.6
    c.saveState()
    c.setStrokeColor(RED_DARK)
    c.setLineWidth(0.42 * mm)
    c.setLineCap(1)
    path_arrow = c.beginPath()
    path_arrow.moveTo(ax * mm, top(btn_t + 3.5, 0))
    path_arrow.lineTo((ax + arrow_w) * mm, top(btn_t + 3.5, 0))
    path_arrow.moveTo((ax + arrow_w - 1.15) * mm, top(btn_t + 2.35, 0))
    path_arrow.lineTo((ax + arrow_w) * mm, top(btn_t + 3.5, 0))
    path_arrow.lineTo((ax + arrow_w - 1.15) * mm, top(btn_t + 4.65, 0))
    c.drawPath(path_arrow, stroke=1, fill=0)
    c.restoreState()
    c.linkURL(WHATSAPP_URL, (btn_x * mm, top(btn_t, btn_h), (btn_x + btn_w) * mm, top(btn_t, 0)), relative=0)

    # ---------------- Carte QR ---------------------------------------------
    qr_x, qr_t, qr_w, qr_h = 120, 104, 76, 70
    shadow(c, qr_x, qr_t, qr_w, qr_h, r=4, alpha=0.16)
    rrect(c, qr_x, qr_t, qr_w, qr_h, 4, fill=WHITE, stroke=NAVY_100, line=0.5)
    gradient_bar(c, qr_x + 0.9, qr_t, qr_w - 1.8, 1.4)

    qr_size = 44.0
    qr_px = qr_x + (qr_w - qr_size) / 2
    qr_pt = qr_t + 5.6
    c.drawImage(str(qr), qr_px * mm, top(qr_pt, qr_size), qr_size * mm, qr_size * mm, mask="auto")
    c.linkURL(
        SITE_URL,
        (qr_px * mm, top(qr_pt, qr_size), (qr_px + qr_size) * mm, top(qr_pt, 0)),
        relative=0,
    )
    draw_text(c, qr_x + qr_w / 2, 155.2, "SCANNEZ POUR VISITER LE SITE", "Lato-B", 6.0, RED, align="center", tracking=1.1)
    draw_text(c, qr_x + qr_w / 2, 160.6, SITE_LABEL, "Poppins-SB", 8.2, NAVY_900, align="center")
    draw_text(c, qr_x + qr_w / 2, 165.6, "Devis et formulaire en ligne", "Lato", 6.0, NAVY_400, align="center")

    # ---------------- Services (aperçu) ------------------------------------
    draw_text(c, M, 188.0, "NOS MÉTIERS", "Lato-B", 6.4, RED, tracking=1.4)
    draw_text(c, M, 194.0, "Six pôles d’activité intégrés", "Poppins-B", 12.4, NAVY_900)
    draw_text(c, W_MM - M, 195.5, "Détail complet page 2  →", "Lato-B", 6.4, NAVY_400, align="right")

    card_w, card_h, gap = 88.5, 23.4, 4.6
    first_row = 202.5
    for index, service in enumerate(SERVICES):
        col = index % 2
        row = index // 2
        cx = M + col * (card_w + gap)
        ct = first_row + row * (card_h + gap)
        shadow(c, cx, ct, card_w, card_h, r=3, alpha=0.06, spread=0.8)
        rrect(c, cx, ct, card_w, card_h, 3, fill=WHITE, stroke=NAVY_100, line=0.4)
        thumb = 19.0
        cover_image(c, IMAGES / service["image"], cx + 2.75, ct + 2.75, thumb, thumb, r=2.4)
        draw_text(c, cx + 25.5, ct + 4.6, service["num"], "Poppins-SB", 6.4, AZURE)
        draw_text(c, cx + 32.4, ct + 4.2, service["title"], "Poppins-SB", 7.9, NAVY_900)
        paragraph(c, cx + 25.5, ct + 10.2, card_w - 28.5, service["short"], "Lato", 6.5, 3.0, NAVY_500)

    # ---------------- Bandeau bas ------------------------------------------
    rect(c, 0, 285, W_MM, 12, fill=NAVY_950)
    gradient_bar(c, 0, 285, W_MM, 0.9)
    draw_text(
        c,
        M,
        289.0,
        "Bureau +225 27 24 57 11 86   ·   WhatsApp +225 07 49 63 47 26   ·   contactbrillegroup@gmail.com",
        "Lato",
        6.2,
        NAVY_200,
    )
    site_w = draw_text(c, W_MM - M, 289.0, SITE_LABEL, "Poppins-SB", 6.4, WHITE, align="right")
    c.linkURL(
        SITE_URL,
        ((W_MM - M) * mm - site_w, top(289.0, 4.4), (W_MM - M) * mm, top(289.0, 0)),
        relative=0,
    )
    draw_text(c, M, 294.4, "Fiche services · Daloa (Tazibouo) · Photos d’illustration", "Lato", 5.0, NAVY_400)
    draw_text(c, W_MM - M, 294.4, "1 / 2", "Lato-B", 5.0, NAVY_400, align="right")

    c.showPage()


# ---------------------------------------------------------------------------
# Page 2 — détail des services et contact
# ---------------------------------------------------------------------------


def page_two(c: canvas.Canvas, logo: Path, qr: Path) -> None:
    """Verso : détail des six pôles, méthode de travail et coordonnées."""
    rect(c, 0, 0, W_MM, H_MM, fill=PAPER)

    # ---------------- En-tête compact --------------------------------------
    bg_gradient(c, 0, 0, W_MM, 26, ("#132745", "#08111F"))
    rrect(c, M, 5.5, 38, 15.5, 2.4, fill=WHITE)
    logo_w = 30.0
    logo_h = logo_w * 960 / 1840
    c.drawImage(
        str(logo),
        (M + (38 - logo_w) / 2) * mm,
        top(5.5 + (15.5 - logo_h) / 2, logo_h),
        logo_w * mm,
        logo_h * mm,
        mask="auto",
    )
    draw_text(c, M + 44, 7.4, "Nos services en détail", "Poppins-SB", 12.2, WHITE)
    draw_text(c, M + 44, 15.2, "Prestations, méthode de travail et coordonnées", "Lato", 6.8, NAVY_300)
    draw_text(c, W_MM - M, 9.6, "02", "Poppins-XB", 15.0, Color(1, 1, 1, 0.28), align="right")
    gradient_bar(c, 0, 25.4, W_MM, 1.0)

    # ---------------- Cartes services détaillées ----------------------------
    card_w, card_h, gap = 88.5, 47.0, 5.0
    rows = [32.0, 84.0, 136.0]
    for index, service in enumerate(SERVICES):
        col = index % 2
        row = index // 2
        cx = M + col * (card_w + gap)
        ct = rows[row]
        shadow(c, cx, ct, card_w, card_h, r=3, alpha=0.06, spread=0.8)
        rrect(c, cx, ct, card_w, card_h, 3, fill=WHITE, stroke=NAVY_100, line=0.4)

        # Bandeau photo supérieur (coins hauts arrondis, bas droits)
        photo_h = 14.0
        cover_image(c, IMAGES / service["image"], cx, ct, card_w, photo_h, r=3)
        rect(c, cx, ct + photo_h - 2.6, card_w, 2.6, fill=WHITE)
        rect(c, cx, ct + photo_h - 0.75, card_w, 0.75, fill=AZURE, alpha=0.9)
        # Pastille numérotée
        rrect(c, cx + 3.2, ct + 3.2, 8.0, 6.0, 1.3, fill=Color(0.03, 0.07, 0.13, 0.82))
        draw_text(c, cx + 7.2, ct + 4.5, service["num"], "Poppins-SB", 6.2, WHITE, align="center")

        draw_text(c, cx + 4, ct + 18.0, service["title"], "Poppins-SB", 8.7, NAVY_900)
        d_lines = paragraph(c, cx + 4, ct + 23.8, card_w - 8, service["long"], "Lato", 6.6, 3.0, NAVY_500)
        bullet_y = ct + 23.8 + d_lines + 1.5
        for bullet in service["bullets"]:
            c.saveState()
            c.setFillColor(AZURE)
            c.circle((cx + 4.9) * mm, top(bullet_y, 1.0) + 1.0 * mm, 0.62 * mm, stroke=0, fill=1)
            c.restoreState()
            draw_text(c, cx + 7.4, bullet_y, bullet, "Lato", 6.35, NAVY_600)
            bullet_y += 3.5

    # ---------------- Activités complémentaires -----------------------------
    draw_text(c, M, 188.5, "ÉGALEMENT SUR DEMANDE", "Lato-B", 6.3, RED, tracking=1.4)
    x = M
    for label in COMPLEMENTARY:
        width = pill(c, x, 194.4, label, "Lato-B", 6.3, NAVY_700, WHITE, pad_x=3.4, h=6.5, stroke=NAVY_200)
        x += width + 2.6

    # ---------------- Méthode ----------------------------------------------
    draw_text(c, M, 208.0, "NOTRE MÉTHODE", "Lato-B", 6.3, RED, tracking=1.4)
    draw_text(c, M, 213.8, "Quatre étapes, aucune zone d’ombre", "Poppins-B", 11.4, NAVY_900)

    step_w = (W_MM - 2 * M - 3 * 4) / 4
    for index, (num, title, body) in enumerate(METHOD):
        sx = M + index * (step_w + 4)
        st = 224.0
        step_h = 25.5
        rrect(c, sx, st, step_w, step_h, 2.6, fill=WHITE, stroke=NAVY_100, line=0.4)
        rect(c, sx, st, 1.4, step_h, fill=AZURE if index % 2 else RED, alpha=0.9)
        draw_text(c, sx + 4.4, st + 3.2, num, "Poppins-XB", 8.0, Color(0.09, 0.16, 0.28, 0.32))

        title_y = st + 9.0
        title_lines = paragraph(c, sx + 4.4, title_y, step_w - 7.4, title, "Poppins-SB", 6.5, 3.05, NAVY_900)
        paragraph(c, sx + 4.4, title_y + title_lines + 1.6, step_w - 7.4, body, "Lato", 5.75, 2.5, NAVY_500)

    # ---------------- Bandeau contact ---------------------------------------
    CONTACT_TOP = 252.0
    rect(c, 0, CONTACT_TOP, W_MM, H_MM - CONTACT_TOP, fill=NAVY_950)
    gradient_bar(c, 0, CONTACT_TOP - 0.2, W_MM, 1.0)
    c.saveState()
    c.setFillColor(Color(1, 1, 1, 0.05))
    c.circle((W_MM - 4) * mm, top(CONTACT_TOP, 6), 27 * mm, stroke=0, fill=1)
    c.restoreState()

    draw_text(c, M, 257.5, "Parlons de votre projet", "Poppins-SB", 11.2, WHITE)
    draw_text(c, M, 265.5, "Devis écrit · Réponse rapide · Partout en Côte d’Ivoire", "Lato", 6.5, NAVY_300)

    contact_columns = [
        (
            M,
            [
                ("BUREAU", "+225 27 24 57 11 86", "tel:+2252724571186"),
                ("WHATSAPP", "+225 07 49 63 47 26", WHATSAPP_URL),
            ],
        ),
        (
            M + 45,
            [
                ("SERCOM", "+225 05 00 49 24 24", "tel:+2250500492424"),
                ("E-MAIL", "contactbrillegroup@gmail.com", "mailto:contactbrillegroup@gmail.com"),
            ],
        ),
        (
            M + 100,
            [
                ("SIÈGE", "Tazibouo, Daloa — Côte d’Ivoire", None),
                ("FACEBOOK", "Brille Group Sarl", FACEBOOK_URL),
            ],
        ),
    ]
    for cx, items in contact_columns:
        y = 272.0
        for label, value, url in items:
            draw_text(c, cx, y, label, "Lato-B", 5.2, AZURE_200, tracking=1.1)
            value_font = "Lato-B" if url else "Lato"
            width = draw_text(c, cx, y + 4.0, value, value_font, 6.95, WHITE)
            if url:
                c.linkURL(
                    url,
                    (cx * mm, top(y + 4.0, 4.6), cx * mm + width, top(y + 4.0, 0)),
                    relative=0,
                )
            y += 10.0

    # Carte QR
    qr_x, qr_t, qr_w, qr_h = 152, 256.5, 44, 34.5
    rrect(c, qr_x, qr_t, qr_w, qr_h, 2.8, fill=WHITE)
    qr_size = 24.0
    qpx = qr_x + (qr_w - qr_size) / 2
    qpt = qr_t + 2.8
    c.drawImage(str(qr), qpx * mm, top(qpt, qr_size), qr_size * mm, qr_size * mm, mask="auto")
    c.linkURL(
        SITE_URL,
        (qpx * mm, top(qpt, qr_size), (qpx + qr_size) * mm, top(qpt, 0)),
        relative=0,
    )
    draw_text(c, qr_x + qr_w / 2, qr_t + qr_h - 5.0, SITE_LABEL, "Poppins-SB", 6.2, NAVY_900, align="center")

    # Mentions
    draw_text(
        c,
        M,
        294.6,
        "RCCM n° CI-ABJ-03-2023-B13-07234 du 03/07/2023 — Tribunal du Commerce d’Abidjan   ·   "
        f"{SITE_LABEL}   ·   Fiche éditée le {DOC_DATE}",
        "Lato",
        4.9,
        NAVY_300,
    )
    draw_text(c, W_MM - M, 294.6, "2 / 2", "Lato-B", 4.9, NAVY_300, align="right")

    c.showPage()


# ---------------------------------------------------------------------------
# Assemblage
# ---------------------------------------------------------------------------

def build() -> Path:
    register_fonts()
    logo = IMAGES / "logo-brille-group.png"
    if not logo.exists():
        sys.exit(f"Logo introuvable : {logo}")

    qr_path = make_qr(SITE_URL, BUILD / "qr-site.png")

    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle("BRILLE GROUP SARL — Fiche services & QR code (Daloa)")
    c.setAuthor("BRILLE GROUP SARL")
    c.setSubject("Présentation de l’entreprise, services, coordonnées et QR code du site web")
    c.setKeywords("BRILLE GROUP, Daloa, Côte d'Ivoire, BTP, topographie, immobilier, nettoyage, QR code")
    c.setCreator("BRILLE GROUP SARL — fiche générée depuis le site officiel")

    page_one(c, logo, qr_path)
    page_two(c, logo, qr_path)
    c.save()

    return OUTPUT


if __name__ == "__main__":
    path = build()
    print(json.dumps({"pdf": str(path), "size": path.stat().st_size}, ensure_ascii=False))
