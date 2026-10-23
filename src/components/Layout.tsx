import { useEffect, useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { useSite } from '../lib/site-context'
import { telHref, whatsappHref } from '../lib/format'

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
      className="fixed bottom-20 right-4 z-30 sm:bottom-5 sm:right-5 inline-flex h-13 items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lift transition hover:brightness-105"
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

/**
 * Barre d'actions fixe sur mobile : appeler, WhatsApp (si numéro confirmé) et devis.
 * Masquée sur grand écran où les boutons du bandeau suffisent.
 */
function MobileActionBar() {
  const { settings, capabilities } = useSite()
  const phone = typeof settings.phone_primary === 'string' ? settings.phone_primary : ''
  const wa = whatsappHref(
    typeof settings.whatsapp_number === 'string' ? settings.whatsapp_number : '',
    'Bonjour BRILLE GROUP, je souhaite des informations.',
  )
  const hasWa = Boolean(wa) && capabilities.whatsappConfigured

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-navy-100 bg-white/95 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-6px_24px_-12px_rgba(13,26,45,.35)] backdrop-blur sm:hidden">
      <div className="grid grid-cols-3 gap-1.5">
        <a
          href={phone ? telHref(phone) : '/contact'}
          className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-semibold text-navy-800 transition active:bg-navy-50"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-azure-600" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 006.5 6.5L17 13l4 1.5v3a2 2 0 01-2.2 2A17 17 0 014.5 5.2 2 2 0 016.5 3z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Appeler
        </a>
        {hasWa ? (
          <a
            href={wa ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-semibold text-emerald-700 transition active:bg-emerald-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20z" />
            </svg>
            WhatsApp
          </a>
        ) : (
          <Link
            to="/contact"
            className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-semibold text-emerald-700 transition active:bg-emerald-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3.5 6.5L12 13l8.5-6.5" strokeLinecap="round" />
            </svg>
            Écrire
          </Link>
        )}
        <Link
          to="/devis"
          className="flex flex-col items-center gap-0.5 rounded-xl bg-gradient-to-r from-brandred to-azure-600 px-2 py-1.5 text-[11px] font-bold text-white shadow-sm"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
            <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5zM14 3v5h5M9 13h6M9 17h4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Devis
        </Link>
      </div>
    </div>
  )
}

export function Layout() {
  const { error, reload } = useSite()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <MaintenanceBanner />
      <Header />
      <main id="contenu" className="flex-1 pb-16 sm:pb-0">
        {error ? (
          <div
            role="status"
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-azure-100 bg-azure-50 px-4 py-2.5 text-center text-[13px] text-navy-700"
          >
            <span>Le contenu du site se met à jour. Vous pouvez continuer à naviguer.</span>
            <button
              type="button"
              onClick={() => reload()}
              className="font-semibold text-azure-700 underline decoration-azure-300 underline-offset-2 hover:text-azure-800"
            >
              Réessayer
            </button>
          </div>
        ) : null}
        <Outlet />
      </main>
      <Footer />
      {mounted ? <WhatsAppFab /> : null}
      {mounted ? <MobileActionBar /> : null}
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
