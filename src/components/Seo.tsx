import { useEffect } from 'react'
import { useSite } from '../lib/site-context'

interface SeoProps {
  title: string
  description: string
  path: string
  image?: string
  noindex?: boolean
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

const SITE_URL = 'https://www.brillegroup.com'
const DEFAULT_IMAGE = `${SITE_URL}/images/og-image.jpg`

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

/**
 * Gestion des balises SEO côté client. Le HTML statique par route est généré
 * au build (scripts/prerender.ts) pour les robots sociaux qui n'exécutent pas
 * JavaScript ; React prend le relais à l'hydratation / navigation.
 */
export function Seo({ title, description, path, image, noindex, jsonLd }: SeoProps) {
  const { settings } = useSite()
  const companyName = typeof settings.company_name === 'string' ? settings.company_name : 'BRILLE GROUP SARL'
  const fullTitle = title.includes(companyName) ? title : `${title} | ${companyName}`
  const canonical = `${SITE_URL}${path}`
  const ogImage = image ?? DEFAULT_IMAGE
  // Sérialisé une fois : évite de relancer l'effet à chaque rendu (nouvel objet).
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : null

  useEffect(() => {
    document.title = fullTitle

    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = canonical

    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonical)
    setMeta('meta[property="og:image"]', 'property', 'og:image', ogImage)
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website')
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', companyName)
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', 'fr_CI')
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage)

    let script: HTMLScriptElement | null = null
    if (jsonLdString) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.dataset.page = 'true'
      script.textContent = jsonLdString
      document.head.appendChild(script)
    }

    return () => {
      if (script) script.remove()
      document.head.querySelectorAll('script[data-page="true"]').forEach((node) => node.remove())
    }
  }, [fullTitle, description, canonical, ogImage, noindex, jsonLdString, companyName])

  return null
}
