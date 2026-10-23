import { Link } from 'react-router-dom'
import { Seo } from '../../components/Seo'
import { Icon } from '../../components/Icon'
import { Section, SectionHeading, Alert } from '../../components/ui'
import { useSite } from '../../lib/site-context'
import { FoncierWarning, ProcessSteps, QuoteSection, ServiceAside, ServiceHero } from './shared'

const STEPS = [
  { title: 'Prise de contact', text: 'Vous décrivez le projet, la localisation et l’usage envisagé du terrain.' },
  { title: 'Examen du dossier', text: 'Nous identifions les pièces disponibles, les contraintes et les vérifications nécessaires.' },
  { title: 'Visite et repérage', text: 'Lorsque cela est possible, le site est visité pour préciser les travaux et les accès.' },
  { title: 'Proposition écrite', text: 'Un devis détaille les prestations, les responsabilités de chacun et les délais.' },
]

export default function Foncier() {
  const { services, settings } = useSite()
  const service = services.find((item) => item.slug === 'amenagement-foncier')

  return (
    <>
      <Seo
        title="Aménagement foncier et rural à Daloa"
        description="Aménagement foncier et rural en Côte d’Ivoire : préparation et organisation de parcelles, aménagement d’accès et d’espaces ruraux, accompagnement des propriétaires à Daloa avec BRILLE GROUP SARL."
        path="/amenagement-foncier"
      />
      <ServiceHero
        eyebrow="Aménagement foncier & rural"
        title="Préparer, structurer et valoriser votre terrain"
        description="BRILLE GROUP SARL accompagne les propriétaires fonciers, les collectivités et les porteurs de projets dans la préparation et la mise en valeur de leurs terrains."
        image="/images/amenagement-foncier.jpg"
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeading
              eyebrow="Nos prestations"
              title="Un accompagnement concret, du diagnostic à la mise en valeur"
              description={
                service?.shortDescription ??
                'Préparation, structuration et valorisation de terrains et d’espaces ruraux.'
              }
            />
            <div className="prose-brille mt-6 space-y-4">
              <p>
                {service?.description ??
                  'BRILLE GROUP SARL accompagne les propriétaires fonciers, les collectivités et les porteurs de projets dans la préparation et la valorisation de leurs terrains : organisation des parcelles, aménagement des accès, viabilisation et aménagement d’espaces ruraux.'}
              </p>
              <p>
                Un projet foncier réussi suppose de partir de l’état réel du terrain : limites, accès, relief,
                occupation éventuelle, documents disponibles. C’est pourquoi chaque dossier commence par un échange
                précis sur la situation et les objectifs poursuivis.
              </p>
            </div>

            {service && service.bullets.length > 0 ? (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {service.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 rounded-xl border border-navy-100 bg-white p-3.5 text-sm text-navy-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                      <Icon name="check" className="h-3.5 w-3.5" />
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-10">
              <h3 className="text-lg font-semibold">Comment nous travaillons</h3>
              <p className="mt-1.5 text-sm text-navy-500">
                Ces étapes décrivent notre méthode de travail. Leur contenu exact est confirmé avec vous et précisé
                dans le devis.
              </p>
              <ProcessSteps steps={STEPS} />
            </div>

            <FoncierWarning />

            <Alert tone="info" className="mt-4" title="Ce que nous ne promettons pas">
              La publication d’une information sur un terrain ne vaut ni garantie de propriété, ni titre foncier, ni
              acte de vente. Les démarches administratives et juridiques doivent être réalisées auprès des autorités
              et professionnels compétents.
            </Alert>
          </div>

          <div className="lg:col-span-4">
            <ServiceAside />
          </div>
        </div>
      </Section>

      <QuoteSection
        service="amenagement_foncier"
        sourcePage="/amenagement-foncier"
        title="Étudions votre projet d’aménagement"
        description="Précisez la localisation, la superficie approximative et l’usage prévu du terrain. Ces informations nous permettent de répondre utilement à votre demande."
      >
        <div className="mt-6 space-y-4">
          <p className="text-sm font-medium text-navy-900">Domaines complémentaires</p>
          <div className="flex flex-wrap gap-2">
            <Link to="/topographie" className="rounded-full border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-700 hover:bg-white">
              Topographie
            </Link>
            <Link to="/btp-construction" className="rounded-full border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-700 hover:bg-white">
              BTP & construction
            </Link>
            <Link to="/immobilier" className="rounded-full border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-700 hover:bg-white">
              Terrains disponibles
            </Link>
          </div>
          {settings.intervention_area ? (
            <p className="text-xs leading-relaxed text-navy-500">{String(settings.intervention_area)}</p>
          ) : null}
        </div>
      </QuoteSection>
    </>
  )
}
