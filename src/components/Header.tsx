import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { useSite } from '../lib/site-context'
import { telHref, cn } from '../lib/format'

const NAV = [
  { label: 'Accueil', to: '/' },
  { label: 'À propos', to: '/a-propos' },
  { label: 'Nos services', to: '/services', hasMenu: true },
  { label: 'Réalisations', to: '/realisations' },
  { label: 'Immobilier', to: '/immobilier' },
  { label: 'Formation', to: '/formation' },
  { label: 'Contact', to: '/contact' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const { coreServices, settings } = useSite()
  const location = useLocation()
  const servicesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileOpen(false)
    setServicesOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false)
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setServicesOpen(false)
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const phone = typeof settings.phone_primary === 'string' ? settings.phone_primary : ''
  const email = typeof settings.email_primary === 'string' ? settings.email_primary : ''

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'relative rounded-lg px-3 py-2 text-sm font-medium transition',
      isActive ? 'text-navy-900' : 'text-navy-600 hover:text-navy-900',
    )

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Aller au contenu principal
      </a>

      {/* Bandeau de contact (masqué sur petit mobile pour rester sobre) */}
      <div className="hidden bg-navy-950 text-navy-200 sm:block">
        <div className="container-page flex h-10 items-center justify-between text-xs">
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
            Tazibouo · Région de Daloa · Côte d’Ivoire
          </p>
          <div className="flex items-center gap-5">
            {phone ? (
              <a href={telHref(phone)} className="transition hover:text-white">
                {phone}
              </a>
            ) : null}
            {email ? (
              <a href={`mailto:${email}`} className="hidden transition hover:text-white md:inline">
                {email}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="container-page flex h-[68px] items-center justify-between gap-4">
          <Logo />

          <nav aria-label="Navigation principale" className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((item) =>
              item.hasMenu ? (
                <div key={item.to} className="relative" ref={servicesRef}>
                  <button
                    type="button"
                    aria-expanded={servicesOpen}
                    aria-haspopup="true"
                    onClick={() => setServicesOpen((value) => !value)}
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition',
                      location.pathname.startsWith('/services') ||
                        coreServices.some((service) => location.pathname === `/${service.slug}`)
                        ? 'text-navy-900'
                        : 'text-navy-600 hover:text-navy-900',
                    )}
                  >
                    {item.label}
                    <svg viewBox="0 0 20 20" className={cn('h-4 w-4 transition', servicesOpen && 'rotate-180')} aria-hidden="true">
                      <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                  {servicesOpen ? (
                    <div className="absolute left-0 top-full z-50 w-[420px] rounded-2xl border border-navy-100 bg-white p-3 shadow-lift">
                      <div className="grid grid-cols-2 gap-1">
                        {coreServices.map((service) => (
                          <Link
                            key={service.id}
                            to={`/services/${service.slug}`}
                            className="rounded-xl px-3 py-2.5 text-sm text-navy-700 transition hover:bg-navy-50 hover:text-navy-900"
                          >
                            {service.title}
                          </Link>
                        ))}
                      </div>
                      <Link
                        to="/services"
                        className="mt-2 flex items-center justify-between rounded-xl bg-navy-50 px-3 py-2.5 text-sm font-semibold text-navy-800 transition hover:bg-navy-100"
                      >
                        Tous nos domaines d’activité
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  ) : null}
                </div>
              ) : (
                <NavLink key={item.to} to={item.to} className={navLinkClass} end={item.to === '/'}>
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/devis" className="btn-primary hidden !px-5 !py-2.5 text-[13px] sm:inline-flex">
              Demander un devis
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              aria-expanded={mobileOpen}
              aria-controls="menu-mobile"
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-navy-200 text-navy-800 lg:hidden"
            >
              {mobileOpen ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileOpen ? (
          <div id="menu-mobile" className="border-t border-navy-100 bg-white lg:hidden">
            <nav aria-label="Navigation mobile" className="container-page max-h-[calc(100vh-68px)] overflow-y-auto py-4">
              <ul className="space-y-1">
                {NAV.filter((item) => !item.hasMenu).map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-xl px-4 py-3 text-[15px] font-medium transition',
                          isActive ? 'bg-navy-900 text-white' : 'text-navy-700 hover:bg-navy-50',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <p className="mt-5 px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-400">Nos services</p>
              <ul className="mt-2 space-y-1">
                {coreServices.map((service) => (
                  <li key={service.id}>
                    <Link to={`/services/${service.slug}`} className="block rounded-xl px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50">
                      {service.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/services" className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-navy-50">
                    Tous nos domaines d’activité →
                  </Link>
                </li>
              </ul>

              <div className="mt-5 space-y-2 border-t border-navy-100 pt-4">
                <Link to="/devis" className="btn-primary w-full">
                  Demander un devis
                </Link>
                {phone ? (
                  <a href={telHref(phone)} className="btn-outline w-full">
                    Appeler le {phone}
                  </a>
                ) : null}
              </div>
            </nav>
          </div>
        ) : null}
      </header>
    </>
  )
}
