import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { ServiceCard } from '../components/cards'
import { Icon } from '../components/Icon'
import { PageHero, Section, SectionHeading, Spinner } from '../components/ui'
import { useSite } from '../lib/site-context'

export default function Services() {
  const { coreServices, complementaryServices, loading } = useSite()

  return (
    <>
      <Seo
        title="Nos services — aménagement foncier, BTP, topographie, immobilier, formation, nettoyage"
        description="Découvrez les domaines d’activité de BRILLE GROUP SARL : aménagement foncier et rural, BTP et construction, topographie, immobilier et vente de terrains, conseils et formation, nettoyage professionnel."
        path="/services"
      />
      <PageHero
        logo
        eyebrow="Nos activités"
        title="Des services intégrés, du terrain au bâtiment"
        description="BRILLE GROUP SARL réunit six pôles de services complémentaires. Chaque page détaille les prestations proposées et permet de demander un devis adapté."
        image="/images/btp-construction.jpg"
      >
        <Link to="/devis" className="btn-gold">
          Demander un devis
        </Link>
        <Link to="/contact" className="btn-ghost-light">
          Poser une question
        </Link>
      </PageHero>

      <Section>
        <SectionHeading
          eyebrow="Domaines principaux"
          title="Six pôles d’activité"
          description="Les prestations listées sur chaque page sont celles que l’entreprise propose ; leur périmètre exact est précisé lors de l’échange et confirmé dans le devis."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex justify-center py-10 text-navy-400">
              <Spinner />
            </div>
          ) : (
            coreServices.map((service, index) => <ServiceCard key={service.id} service={service} index={index} />)
          )}
        </div>
      </Section>

      {complementaryServices.length > 0 ? (
        <Section tone="muted">
          <SectionHeading
            eyebrow="Activités complémentaires"
            title="Également proposés par l’entreprise"
            description="Ces activités figurent dans la présentation officielle de BRILLE GROUP SARL. Leur périmètre détaillé est précisé sur demande, le temps que l’entreprise valide la description de chaque prestation."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {complementaryServices.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.slug}`}
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
