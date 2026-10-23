import { Link, Navigate, useParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Icon } from '../components/Icon'
import { Alert, EmptyState, PageHero, Section, SectionHeading, Spinner } from '../components/ui'
import { ServiceAside } from './services/shared'
import { useSite } from '../lib/site-context'

/** Correspondance entre les identifiants de service et les pages dédiées. */
const DEDICATED: Record<string, string> = {
  'amenagement-foncier': '/amenagement-foncier',
  'btp-construction': '/btp-construction',
  topographie: '/topographie',
  'immobilier-terrains': '/immobilier',
  'conseils-formation': '/formation',
  'nettoyage-professionnel': '/nettoyage-professionnel',
}

export default function ServiceGeneric() {
  const { slug = '' } = useParams()
  const { services, loading } = useSite()

  if (DEDICATED[slug]) return <Navigate to={DEDICATED[slug]} replace />

  const service = services.find((item) => item.slug === slug)

  if (loading) {
    return (
      <div className="container-page flex justify-center py-24 text-navy-400">
        <Spinner />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="container-page py-20">
        <EmptyState
          title="Service introuvable"
          description="Ce service n’est pas publié actuellement. Consultez la liste de nos domaines d’activité."
          action={{ label: 'Voir tous les services', to: '/services' }}
        />
      </div>
    )
  }

  return (
    <>
      <Seo
        title={`${service.title} — BRILLE GROUP SARL`}
        description={service.shortDescription || `${service.title} proposé par BRILLE GROUP SARL à Daloa, Côte d’Ivoire.`}
        path={`/services/${service.slug}`}
      />
      <PageHero
        logo
        eyebrow="Activité"
        title={service.title}
        description={service.shortDescription}
        image={service.imageUrl ?? undefined}
      >
        <Link to={`/devis?service=autre`} className="btn-gold">
          Demander un devis
        </Link>
        <Link to="/services" className="btn-ghost-light">
          Toutes nos activités
        </Link>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeading eyebrow="Présentation" title={`${service.title} avec BRILLE GROUP SARL`} />
            <div className="prose-brille mt-4 space-y-3">
              {(service.description || service.shortDescription).split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {service.bullets.length > 0 ? (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {service.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 rounded-xl border border-navy-100 bg-white p-3.5 text-sm text-navy-700">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}

            <Alert tone="info" className="mt-8" title="Information à confirmer">
              Cette activité est présentée par l’entreprise, mais le détail de ses prestations est en cours de
              validation. Contactez-nous pour connaître précisément ce qui peut être réalisé, dans quels délais et à
              quelles conditions.
            </Alert>
          </div>

          <div className="lg:col-span-4">
            <ServiceAside title={`Un besoin en ${service.title.toLowerCase()} ?`} />
          </div>
        </div>
      </Section>
    </>
  )
}
