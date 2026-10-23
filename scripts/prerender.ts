/**
 * Post-build : génère un HTML statique par route (balises SEO/OG dédiées) et
 * le sitemap XML. Les robots sociaux (Facebook, WhatsApp) ne lisent pas le
 * JavaScript : ce sont donc ces fichiers qui leur fournissent les métadonnées.
 *
 * Exécuté automatiquement après `vite build` (voir package.json).
 * La connexion à la base est facultative : si DATABASE_URL est absent, le
 * sitemap ne contient que les pages statiques.
 */
import fs from 'node:fs'
import path from 'node:path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
// Charge .env en local (sur Vercel, les variables sont déjà dans l'environnement).
import '../server/env'
import { connectionNeedsSsl } from '../server/db'
import App from '../src/App'
import { SiteProvider } from '../src/lib/site-context'

const SITE_URL = (process.env.SITE_URL || 'https://brille-group.vercel.app').replace(/\/$/, '')
const distDir = path.resolve(process.cwd(), 'dist')

type Route = { path: string; title: string; description: string; priority: string; changefreq: string }

const ROUTES: Route[] = [
  {
    path: '/',
    title: 'BRILLE GROUP SARL — Construire, aménager et valoriser vos projets à Daloa',
    description:
      'Entreprise ivoirienne multiservices à Tazibouo (région de Daloa) : aménagement foncier, BTP et construction, topographie, immobilier et vente de terrains, conseils, formation et nettoyage professionnel.',
    priority: '1.0',
    changefreq: 'weekly',
  },
  {
    path: '/a-propos',
    title: 'À propos de BRILLE GROUP SARL',
    description:
      'BRILLE GROUP SARL, entreprise ivoirienne multiservices basée à Tazibouo (région de Daloa) : présentation, mission, engagements et coordonnées.',
    priority: '0.7',
    changefreq: 'monthly',
  },
  {
    path: '/services',
    title: 'Nos services — BRILLE GROUP SARL',
    description:
      'Aménagement foncier, BTP et construction, topographie, immobilier et vente de terrains, conseils et formation, nettoyage professionnel : découvrez les domaines d’activité de BRILLE GROUP SARL.',
    priority: '0.9',
    changefreq: 'monthly',
  },
  {
    path: '/amenagement-foncier',
    title: 'Aménagement foncier et rural à Daloa',
    description:
      'Préparation et valorisation de terrains, organisation de parcelles et aménagement d’espaces ruraux à Daloa, Côte d’Ivoire.',
    priority: '0.8',
    changefreq: 'monthly',
  },
  {
    path: '/btp-construction',
    title: 'BTP et construction de bâtiments à Daloa',
    description:
      'Construction de bâtiments et travaux de BTP à Daloa et en Côte d’Ivoire : devis détaillé, suivi de chantier et coordination des intervenants.',
    priority: '0.9',
    changefreq: 'monthly',
  },
  {
    path: '/topographie',
    title: 'Topographie à Daloa — relevés, plans et implantation',
    description:
      'Prestations de topographie à Daloa : relevés de terrain, plans, implantation et coordination avec les professionnels habilités.',
    priority: '0.8',
    changefreq: 'monthly',
  },
  {
    path: '/immobilier',
    title: 'Immobilier et vente de terrains à Daloa',
    description:
      'Terrains et biens immobiliers proposés par BRILLE GROUP SARL à Daloa et en Côte d’Ivoire, avec information transparente et vérification des documents avant transaction.',
    priority: '0.9',
    changefreq: 'weekly',
  },
  {
    path: '/formation',
    title: 'Conseils et formation en Côte d’Ivoire',
    description:
      'Conseil aux porteurs de projets et formations professionnelles proposées par BRILLE GROUP SARL : catalogue, objectifs et demande d’information.',
    priority: '0.7',
    changefreq: 'monthly',
  },
  {
    path: '/nettoyage-professionnel',
    title: 'Nettoyage professionnel à Daloa',
    description:
      'Nettoyage de bureaux, de maisons et nettoyage après travaux à Daloa et en Côte d’Ivoire : devis gratuit avec BRILLE GROUP SARL.',
    priority: '0.8',
    changefreq: 'monthly',
  },
  {
    path: '/realisations',
    title: 'Nos réalisations et projets',
    description:
      'Galerie des projets et réalisations de BRILLE GROUP SARL : construction, aménagement foncier, topographie, immobilier et nettoyage.',
    priority: '0.7',
    changefreq: 'weekly',
  },
  {
    path: '/contact',
    title: 'Contact — BRILLE GROUP SARL, Daloa',
    description:
      'Contactez BRILLE GROUP SARL à Tazibouo (région de Daloa) : téléphone, e-mail, Facebook et formulaire de contact.',
    priority: '0.8',
    changefreq: 'monthly',
  },
  {
    path: '/devis',
    title: 'Demander un devis gratuit',
    description:
      'Demandez un devis à BRILLE GROUP SARL pour vos travaux de construction, d’aménagement foncier, de topographie, d’immobilier, de formation ou de nettoyage.',
    priority: '0.9',
    changefreq: 'monthly',
  },
  {
    path: '/mentions-legales',
    title: 'Mentions légales',
    description: 'Mentions légales du site de BRILLE GROUP SARL.',
    priority: '0.2',
    changefreq: 'yearly',
  },
  {
    path: '/politique-confidentialite',
    title: 'Politique de confidentialité',
    description: 'Politique de confidentialité et protection des données du site de BRILLE GROUP SARL.',
    priority: '0.2',
    changefreq: 'yearly',
  },
]

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildHtml(template: string, route: Route, renderedBody = ''): string {
  const url = `${SITE_URL}${route.path === '/' ? '/' : route.path}`
  const title = escapeHtml(route.title)
  const description = escapeHtml(route.description)

  // Les balises du template index.html peuvent être réparties sur plusieurs
  // lignes : les expressions tolèrent donc les espaces et retours à la ligne.
  const replaceTag = (source: string, tag: RegExp, replacement: string) => source.replace(tag, replacement)

  let html = template
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
  html = replaceTag(
    html,
    /<meta\s+name="description"[\s\S]*?>/,
    `<meta name="description" content="${description}" />`,
  )
  html = replaceTag(html, /<link\s+rel="canonical"[\s\S]*?>/, `<link rel="canonical" href="${url}" />`)
  html = replaceTag(html, /<meta\s+property="og:url"[\s\S]*?>/, `<meta property="og:url" content="${url}" />`)
  html = replaceTag(
    html,
    /<meta\s+property="og:image"[\s\S]*?>/,
    `<meta property="og:image" content="${SITE_URL}/images/og-image.jpg" />`,
  )
  html = replaceTag(html, /<meta\s+property="og:title"[\s\S]*?>/, `<meta property="og:title" content="${title}" />`)
  html = replaceTag(
    html,
    /<meta\s+property="og:description"[\s\S]*?>/,
    `<meta property="og:description" content="${description}" />`,
  )
  html = replaceTag(
    html,
    /<meta\s+name="twitter:title"[\s\S]*?>/,
    `<meta name="twitter:title" content="${title}" />`,
  )
  html = replaceTag(
    html,
    /<meta\s+name="twitter:description"[\s\S]*?>/,
    `<meta name="twitter:description" content="${description}" />`,
  )
  if (renderedBody) {
    html = html.replace('<div id="root"></div>', () => `<div id="root">${renderedBody}</div>`)
  }
  return html
}

function renderRouteBody(routePath: string): string {
  return renderToString(
    React.createElement(
      SiteProvider,
      null,
      React.createElement(StaticRouter, { location: routePath }, React.createElement(App)),
    ),
  )
}

interface PropertyRow {
  id: string
  title: string
  reference: string
  location: string
  property_type: string
  area_sqm: string | null
  price_fcfa: string | null
  description: string
}

function formatPrice(value: string | null): string {
  if (!value) return 'prix sur demande'
  return `${new Intl.NumberFormat('fr-FR').format(Number(value))} FCFA`
}

function formatArea(value: string | null): string {
  if (!value) return 'superficie non précisée'
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(Number(value))} m²`
}

async function fetchProperties(): Promise<PropertyRow[]> {
  if (!process.env.DATABASE_URL) return []
  try {
    const { Pool } = await import('pg')
    const url = process.env.DATABASE_URL
    const pool = new Pool({ connectionString: url, ...(connectionNeedsSsl(url) ? { ssl: { rejectUnauthorized: false } } : {}) })
    const result = await pool.query<PropertyRow>(
      `SELECT id, title, reference, location, property_type, area_sqm, price_fcfa, description
         FROM properties WHERE is_published = true ORDER BY created_at DESC LIMIT 500`,
    )
    await pool.end()
    return result.rows
  } catch (error) {
    console.warn('[prerender] annonces non pré-rendues :', error instanceof Error ? error.message : error)
    return []
  }
}

async function main() {
  const templatePath = path.join(distDir, 'index.html')
  if (!fs.existsSync(templatePath)) {
    console.warn('[prerender] dist/index.html introuvable — étape ignorée.')
    return
  }
  const template = fs.readFileSync(templatePath, 'utf8')

  for (const route of ROUTES) {
    const html = buildHtml(template, route, renderRouteBody(route.path))
    if (route.path === '/') {
      fs.writeFileSync(templatePath, html)
      continue
    }
    const dir = path.join(distDir, route.path)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'index.html'), html)
  }

  // Pages de détail des annonces publiées : métadonnées propres pour le partage
  const properties = await fetchProperties()
  for (const property of properties) {
    const description =
      `${property.title}${property.location ? ` à ${property.location}` : ''} — ${formatArea(property.area_sqm)}, ` +
      `${formatPrice(property.price_fcfa)}. Référence ${property.reference}. Informations à vérifier avant toute transaction.`
    const route: Route = {
      path: `/immobilier/${property.id}`,
      title: `${property.title} — ${property.reference}`,
      description,
      priority: '0.6',
      changefreq: 'weekly',
    }
    const dir = path.join(distDir, route.path)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'index.html'), buildHtml(template, route))
  }

  const dynamicRoutes: Route[] = properties.map((row) => ({
    path: `/immobilier/${row.id}`,
    title: `${row.title} — ${row.reference} | BRILLE GROUP SARL`,
    description: `${row.title}${row.location ? ` à ${row.location}` : ''} — annonce ${row.reference} proposée par BRILLE GROUP SARL.`,
    priority: '0.6',
    changefreq: 'weekly',
  }))
  const allRoutes = [...ROUTES, ...dynamicRoutes]
  const today = new Date().toISOString().slice(0, 10)
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `  <url>
    <loc>${SITE_URL}${route.path === '/' ? '/' : route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap)
  const robots = `# BRILLE GROUP SARL — robots.txt
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robots)
  console.log(
    `[prerender] ${ROUTES.length + properties.length} pages HTML + sitemap (${allRoutes.length} URLs) générés.`,
  )
}

main().catch((error) => {
  console.error('[prerender] échec :', error)
  process.exitCode = 1
})
