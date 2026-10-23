import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Icon } from '../components/Icon'
import { Alert, PageHero, Section, SectionHeading } from '../components/ui'
import { ContactForm } from '../components/forms/ContactForm'
import { useSite } from '../lib/site-context'
import { telHref, whatsappHref } from '../lib/format'

export default function Contact() {
  const { settings, capabilities } = useSite()

  const phoneEntries = [
    { label: 'Bureau', value: settings.phone_primary },
    { label: 'WhatsApp', value: settings.phone_secondary },
    { label: 'Sercom', value: settings.phone_third },
  ].filter((entry): entry is { label: string; value: string } => typeof entry.value === 'string' && entry.value.trim() !== '')
  const phones = phoneEntries.map((entry) => entry.value)
  const email = String(settings.email_primary ?? '')
  const facebook = String(settings.facebook_url ?? '')
  const address = [settings.address_line, settings.city, settings.country]
    .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
    .join(', ')
  const hours = String(settings.opening_hours ?? '')
  const wa = whatsappHref(
    typeof settings.whatsapp_number === 'string' ? settings.whatsapp_number : '',
    'Bonjour BRILLE GROUP, je vous contacte depuis votre site.',
  )

  return (
    <>
      <Seo
        title="Contact — BRILLE GROUP SARL, Daloa"
        description="Contactez BRILLE GROUP SARL à Tazibouo (région de Daloa) : téléphone, e-mail, Facebook et formulaire de contact pour vos projets de construction, d’aménagement foncier, de topographie, d’immobilier, de formation et de nettoyage."
        path="/contact"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: String(settings.company_name ?? 'BRILLE GROUP SARL'),
          telephone: phones[0],
          email: email || undefined,
          sameAs: facebook ? [facebook] : undefined,
          address: {
            '@type': 'PostalAddress',
            streetAddress: String(settings.address_line ?? ''),
            addressLocality: String(settings.city ?? 'Daloa'),
            addressCountry: 'CI',
          },
        }}
      />
      <PageHero
        logo
        eyebrow="Contact"
        title="Parlons de votre projet"
        description="Par téléphone, par e-mail ou via le formulaire : notre équipe vous répond et vous oriente vers le bon service."
        image="/images/apropos.jpg"
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Coordonnées" title="Nous joindre" />

            <div className="mt-8 space-y-3">
              <div className="card p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-gold-300">
                    <Icon name="phone" className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">Téléphones & WhatsApp</p>
                    {phoneEntries.length > 0 ? (
                      <ul className="mt-1.5 space-y-1.5">
                        {phoneEntries.map((entry) => (
                          <li key={entry.value} className="flex flex-wrap items-center gap-x-2 text-[15px]">
                            <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                              {entry.label} :
                            </span>
                            <a href={telHref(entry.value)} className="font-medium text-navy-900 hover:text-gold-700">
                              {entry.value}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-navy-500">Numéro à confirmer</p>
                    )}
                  </div>
                </div>
              </div>

              {email ? (
                <div className="card p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="M4 7l8 6 8-6" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">E-mail</p>
                      <a href={`mailto:${email}`} className="mt-1 block break-all text-[15px] font-medium text-navy-900 hover:text-gold-700">
                        {email}
                      </a>
                    </div>
                  </div>
                </div>
              ) : null}

              {address ? (
                <div className="card p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                      <Icon name="pin" className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">Localisation</p>
                      <p className="mt-1 text-[15px] font-medium text-navy-900">{address}</p>
                      {settings.intervention_area ? (
                        <p className="mt-1 text-xs leading-relaxed text-navy-500">{String(settings.intervention_area)}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {hours ? (
                <div className="card p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                      <Icon name="clock" className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">Horaires</p>
                      <p className="mt-1 whitespace-pre-line text-[15px] font-medium text-navy-900">{hours}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {wa && capabilities.whatsappConfigured ? (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-outline">
                    WhatsApp
                  </a>
                ) : null}
                {facebook ? (
                  <a href={facebook} target="_blank" rel="noopener noreferrer" className="btn-outline">
                    Facebook
                  </a>
                ) : null}
                <Link to="/devis" className="btn-primary">
                  Demander un devis
                </Link>
              </div>
            </div>

            <Alert tone="info" className="mt-8" title="Adresse exacte et horaires">
              L’adresse postale complète et les horaires d’ouverture sont en cours de confirmation par l’entreprise.
              En attendant, merci de nous contacter par téléphone ou via le formulaire pour convenir d’un rendez-vous.
            </Alert>
          </div>

          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  )
}
