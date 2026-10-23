import { useEffect, useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { useSite } from '../lib/site-context'
import { whatsappHref } from '../lib/format'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

/** Bouton WhatsApp flottant : affiché UNIQUEMENT si un numéro a été confirmé. */
function WhatsAppFab() {
  const { settings, capabilities } = useSite()
  const href = whatsappHref(
    typeof settings.whatsapp_number === 'string' ? settings.whatsapp_number : '',
    'Bonjour BRILLE GROUP, je souhaite des informations.',
  )
  if (!href || !capabilities.whatsappConfigured) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous écrire sur WhatsApp"
      className="fixed bottom-5 right-5 z-30 inline-flex h-13 items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lift transition hover:brightness-105"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20zm4.6-5.7c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 01-3.2-2.8c-.1-.2 0-.4.1-.5l.6-.7c.1-.2.1-.3 0-.5l-.7-1.6c-.1-.3-.3-.3-.5-.3h-.5c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.7 4.2 3.7 1.5.6 2.1.6 2.8.5.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .2-1.1-.1-.2-.2-.2-.4-.3z" />
      </svg>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  )
}

/** Bandeau d'information si des données de contact essentielles manquent. */
function MaintenanceBanner() {
  const { settings } = useSite()
  if (settings.maintenance_mode !== true) return null
  return (
    <div className="bg-gold-100 px-4 py-2 text-center text-xs font-medium text-navy-800">
      Site en cours de mise à jour : certaines informations peuvent évoluer. Pour toute demande urgente,
      contactez-nous par téléphone.
    </div>
  )
}

export function Layout() {
  const { error } = useSite()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <MaintenanceBanner />
      <Header />
      <main id="contenu" className="flex-1">
        {error ? (
          <div className="border-b border-gold-200 bg-gold-50 px-4 py-3 text-center text-sm text-navy-800">
            Certaines informations du site n’ont pas pu être chargées ({error}).{' '}
            <button type="button" onClick={() => window.location.reload()} className="font-semibold underline">
              Recharger la page
            </button>
          </div>
        ) : null}
        <Outlet />
      </main>
      <Footer />
      {mounted ? <WhatsAppFab /> : null}
      {/* Lien discret vers l'administration pour les visiteurs autorisés */}
      <noscript>
        <div className="bg-navy-900 px-4 py-3 text-center text-sm text-white">
          Ce site nécessite JavaScript pour afficher l’ensemble de ses contenus. Vous pouvez nous joindre au{' '}
          <a href="tel:+22527245711" className="underline">
            +225 27 24 57 11 86
          </a>
          .
        </div>
      </noscript>
      <Link to="/contact" className="sr-only">
        Contact
      </Link>
    </div>
  )
}
