import { Link } from 'react-router-dom'
import { LogoMark } from './Logo'
import { useSite } from '../lib/site-context'
import { telHref } from '../lib/format'

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
    <footer className="bg-navy-950 text-navy-200">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="font-display text-base font-bold text-white">BRILLE GROUP</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-400">SARL</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-navy-300">
            Entreprise ivoirienne multiservices : aménagement foncier, BTP, topographie, immobilier, conseil,
            formation et nettoyage professionnel.
          </p>
          <p className="mt-4 text-sm italic text-gold-300">Let’s shine together</p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Nos services</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {coreServices.map((service) => (
              <li key={service.id}>
                <Link to={`/services/${service.slug}`} className="text-navy-300 transition hover:text-white">
                  {service.title}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/services" className="font-medium text-gold-300 transition hover:text-gold-200">
                Tous les domaines →
              </Link>
            </li>
          </ul>
        </div>

        <div>
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

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(address || city) && (
              <li className="text-navy-300">
                {address}
                {city ? `${address ? ', ' : ''}${city}` : ''}
                {country ? ` — ${country}` : ''}
              </li>
            )}
            {phones.map((phone) => (
              <li key={phone}>
                <a href={telHref(phone)} className="text-navy-300 transition hover:text-white">
                  {phone}
                </a>
              </li>
            ))}
            {email ? (
              <li>
                <a href={`mailto:${email}`} className="break-all text-navy-300 transition hover:text-white">
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
                  className="inline-flex items-center gap-2 text-navy-300 transition hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M13.5 9H16V6h-2.5C11.6 6 10 7.6 10 9.5V11H8v3h2v7h3v-7h2.2l.3-3H13v-1.2c0-.4.2-.8.5-.8z" />
                  </svg>
                  Facebook
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
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
