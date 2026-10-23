import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { ServiceCard } from '../components/cards'
import { Icon } from '../components/Icon'
import { PageHero, Section, SectionHeading } from '../components/ui'
import { servicePath } from '../lib/default-site-data'
import { whatsappHref } from '../lib/format'
import { useSite } from '../lib/site-context'

export default function Services() {
  const { coreServices, complementaryServices, settings, capabilities } = useSite()
  const wa = whatsappHref(
    typeof settings.whatsapp_number === 'string' ? settings.whatsapp_number : '',
    'Bonjour BRILLE GROUP, je souhaite un devis pour une prestation.',
  )

  return (
    <>
      <Seo
        title="Nos services — aménagement foncier, BTP, topographie, immobilier, formation, nettoyage & hygiène 3D"
        description="Découvrez tous les services proposés par BRILLE GROUP SARL à Daloa et partout en Côte d’Ivoire : aménagement foncier, construction de bâtiments et BTP, topographie, immobilier et vente de terrains, conseils, formation, nettoyage industriel professionnel, dératisation, désinsectisation et désinfection."
        path="/services"
      />
      <PageHero
        logo
        eyebrow="Nos activités"
        title="Des services intégrés, du terrain au bâtiment et à l’assainissement"
        description="Implantée à Daloa (Tazibouo) et active partout en Côte d’Ivoire, BRILLE GROUP SARL réunit six pôles d’expertise complémentaires pour les particuliers, entreprises et institutions."
        image="/images/btp-construction.jpg"
      >
        <Link to="/devis" className="btn-gold">
          Demander un devis
        </Link>
        {wa && capabilities.whatsappConfigured ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-ghost-light">
            WhatsApp · 07 49 63 47 26
          </a>
        ) : (
          <Link to="/contact" className="btn-ghost-light">
            Poser une question
          </Link>
        )}
      </PageHero>

      <Section>
        <SectionHeading
          eyebrow="Domaines principaux"
          title="Six pôles d’activité complets"
          description="Cliquez sur un domaine pour consulter le détail complet des prestations et envoyer une demande de devis dédiée."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coreServices.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </Section>

      {complementaryServices.length > 0 ? (
        <Section tone="muted">
          <SectionHeading
            eyebrow="Activités complémentaires"
            title="Également proposés par l’entreprise"
            description="Ces activités figurent également dans l’offre multiservices de BRILLE GROUP SARL. Contactez-nous pour étudier votre besoin précis."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {complementaryServices.map((service) => (
              <Link
                key={service.id}
                to={servicePath(service.slug)}
                className="group flex items-center gap-3 rounded-xl border border-navy-100 bg-white p-4 transition hover:shadow-card"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                  <Icon name={service.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-navy-900">{service.title}</span>
                  <span className="mt-0.5 line-clamp-2 block text-xs text-navy-500">{service.shortDescription}</span>
                </span>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  )
}
