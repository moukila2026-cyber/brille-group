import { Link } from 'react-router-dom'
import { useSite } from '../lib/site-context'
import { telHref } from '../lib/format'

/** Créateur du site — bouton WhatsApp cliquable. */
const SHOPIN_WHATSAPP = '2250501303343'
const SHOPIN_LABEL = 'Shopin30'

function whatsappCreatorHref(message: string) {
  return `https://wa.me/${SHOPIN_WHATSAPP}?text=${encodeURIComponent(message)}`
}

export function Footer() {
  const { coreServices, settings } = useSite()
  const year = new Date().getFullYear()

  const company = String(settings.company_name ?? 'BRILLE GROUP SARL')
  const address = String(settings.address_line ?? '')
  const city = String(settings.city ?? '')
  const country = String(settings.country ?? '')
  const phones = [settings.phone_primary, settings.phone_secondary, settings.phone_third].filter(
    (value): value is string => typeof value === 'string' && value.trim() !== '',
  )
  const email = String(settings.email_primary ?? '')
  const facebook = String(settings.facebook_url ?? '')
  const rccm = String(settings.legal_rcm ?? '')

  return (
    <footer className="relative overflow-hidden bg-navy-950 text-navy-200">
      {/* Ornements de charte */}
      <div
        className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-brandred/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-azure-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brandred via-white/60 to-azure-500" aria-hidden="true" />

      <div className="container-page relative grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <div className="inline-flex rounded-2xl bg-white px-5 py-4 shadow-lg">
            <img
              src="/images/logo-brille-group.svg"
              alt="BRILLE GROUP SARL — Let’s shine together"
              className="h-20 w-auto sm:h-24"
              width={460}
              height={240}
            />
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-navy-300">
            Entreprise ivoirienne multiservices : aménagement foncier, BTP et construction, topographie,
            immobilier, conseil, formation et nettoyage professionnel.
          </p>
          <p className="mt-4 text-sm italic text-azure-300">Let’s shine together</p>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Domaines</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {coreServices.slice(0, 6).map((service) => (
              <li key={service.id}>
                <Link
                  to={`/services/${service.slug}`}
                  className="text-navy-300 transition hover:text-white"
                >
                  {service.title}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/services" className="font-medium text-azure-300 transition hover:text-azure-200">
                Tous les domaines →
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Entreprise</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { label: 'À propos', to: '/a-propos' },
              { label: 'Nos réalisations', to: '/realisations' },
              { label: 'Immobilier et terrains', to: '/immobilier' },
              { label: 'Formation', to: '/formation' },
              { label: 'Demander un devis', to: '/devis' },
              { label: 'Contact', to: '/contact' },
            ].map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-navy-300 transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(address || city) && (
              <li className="flex items-start gap-2.5 text-navy-300">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-azure-300">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>
                <span>
                  {address}
                  {city ? `${address ? ', ' : ''}${city}` : ''}
                  {country ? ` — ${country}` : ''}
                </span>
              </li>
            )}
            {phones.map((phone) => (
              <li key={phone}>
                <a
                  href={telHref(phone)}
                  className="flex items-center gap-2.5 text-navy-300 transition hover:text-white"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-azure-300">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M5 4h3l2 5-2 1a12 12 0 006 6l1-2 5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {phone}
                </a>
              </li>
            ))}
            {email ? (
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2.5 break-all text-navy-300 transition hover:text-white"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-azure-300">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3.5 6.5L12 13l8.5-6.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  {email}
                </a>
              </li>
            ) : null}
            {facebook ? (
              <li>
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-navy-300 transition hover:text-white"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-azure-300">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                      <path d="M13.5 9H16V6h-2.5C11.6 6 10 7.6 10 9.5V11H8v3h2v7h3v-7h2.2l.3-3H13v-1.2c0-.4.2-.8.5-.8z" />
                    </svg>
                  </span>
                  Facebook
                </a>
              </li>
            ) : null}
          </ul>

          <Link
            to="/devis"
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brandred to-azure-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brandred/20 transition hover:brightness-110"
          >
            Décrire mon projet
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>

      {/* Bandeau créateur */}
      <div className="relative border-t border-white/10 bg-white/[0.03]">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-5 text-sm sm:flex-row">
          <p className="text-center text-navy-300 sm:text-left">
            Site conçu et développé par{' '}
            <a
              href={whatsappCreatorHref(
                'Bonjour Shopin30, je vous contacte au sujet de la création d’un site web.',
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-300 transition hover:border-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
              title="Contacter Shopin30 sur WhatsApp au +225 05 01 30 33 43"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.7 14.1c-.24.67-1.4 1.29-1.93 1.34-.53.05-1.02.24-3.44-.72-2.9-1.15-4.72-4.15-4.86-4.35-.14-.2-1.15-1.54-1.15-2.94 0-1.4.73-2.09.99-2.38.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.48.24.58.81 1.98.88 2.12.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.29-.13.58.16.29.72 1.19 1.55 1.93 1.06.95 1.95 1.25 2.24 1.39.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.65.78 1.94.92.29.14.48.22.55.34.07.12.07.7-.17 1.37z" />
              </svg>
              {SHOPIN_LABEL}
            </a>{' '}
            — création de sites web, cliquez pour me joindre sur WhatsApp.
          </p>
          <a
            href={whatsappCreatorHref('Bonjour Shopin30, je souhaite créer un site web pour mon activité.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-navy-900 transition hover:bg-emerald-50"
          >
            Créer mon site web
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-navy-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company}. Tous droits réservés.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/mentions-legales" className="transition hover:text-white">
              Mentions légales
            </Link>
            <Link to="/politique-confidentialite" className="transition hover:text-white">
              Politique de confidentialité
            </Link>
            <Link to="/admin/login" className="transition hover:text-white">
              Espace administration
            </Link>
          </div>
        </div>
        {rccm ? (
          <div className="container-page pb-6 text-[11px] leading-relaxed text-navy-500">{rccm}</div>
        ) : null}
      </div>
    </footer>
  )
}
