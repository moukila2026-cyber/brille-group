import { Seo } from '../../components/Seo'
import { Icon } from '../../components/Icon'
import { Alert, Section, SectionHeading } from '../../components/ui'
import { useSite } from '../../lib/site-context'
import { ProcessSteps, QuoteSection, ServiceAside, ServiceHero } from './shared'

const MISSIONS = [
  {
    title: 'Relevés et plans de terrain',
    text: 'Collecte des données nécessaires à la compréhension d’un terrain en vue d’un projet de construction ou d’aménagement.',
    icon: 'compass',
  },
  {
    title: 'Implantation de projets',
    text: 'Positionnement sur le terrain des éléments d’un projet à partir des plans validés.',
    icon: 'pin',
  },
  {
    title: 'Documents graphiques',
    text: 'Production des pièces graphiques utiles à vos dossiers techniques ou administratifs.',
    icon: 'map',
  },
  {
    title: 'Coordination avec les professionnels habilités',
    text: 'Lorsque la réglementation l’exige, intervention conjointe avec les professionnels compétents.',
    icon: 'shield',
  },
]

const STEPS = [
  { title: 'Objectif de la mission', text: 'Nature du besoin : construction, division, aménagement, dossier administratif.' },
  { title: 'Vérification des prérequis', text: 'Documents, localisation, accessibilité et contraintes réglementaires.' },
  { title: 'Intervention sur le terrain', text: 'Réalisation des mesures et relevés nécessaires selon le périmètre convenu.' },
  { title: 'Livraison des éléments', text: 'Remise des plans et données prévus au devis.' },
]

export default function Topographie() {
  const { services } = useSite()
  const service = services.find((item) => item.slug === 'topographie')

  return (
    <>
      <Seo
        title="Topographie à Daloa — relevés, plans et implantation"
        description="Prestations de topographie à Daloa et en Côte d’Ivoire : relevés de terrain, plans, implantation de projets et coordination avec les professionnels habilités — BRILLE GROUP SARL."
        path="/topographie"
      />
      <ServiceHero
        eyebrow="Topographie"
        title="Les données de terrain dont votre projet a besoin"
        description="La topographie fournit les informations indispensables à la conception et à l’exécution d’un projet. BRILLE GROUP SARL vous accompagne pour définir la mission adaptée à votre besoin."
        image="/images/topographie.jpg"
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeading
              eyebrow="Nos prestations"
              title="Des missions définies avec précision"
              description={service?.description ?? 'Relevés, plans et données de terrain pour préparer et sécuriser vos projets.'}
            />

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {MISSIONS.map((mission) => (
                <div key={mission.title} className="card p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-gold-300">
                    <Icon name={mission.icon} className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{mission.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{mission.text}</p>
                </div>
              ))}
            </div>

            {service && service.bullets.length > 0 ? (
              <ul className="mt-8 space-y-2 text-sm text-navy-700">
                {service.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-10">
              <h3 className="text-lg font-semibold">Comment se déroule une mission</h3>
              <ProcessSteps steps={STEPS} />
            </div>

            <Alert tone="warning" className="mt-8" title="Prestations réglementées">
              Certaines opérations topographiques et foncières sont réservées par la réglementation ivoirienne à des
              professionnels habilités. BRILLE GROUP SARL ne présente pas ces prestations comme disponibles sans
              vérification préalable. Lorsque votre dossier relève de ces opérations, nous vous orientons vers les
              professionnels compétents et pouvons assurer la coordination.
            </Alert>
          </div>

          <div className="lg:col-span-4">
            <ServiceAside title="Une mission à préciser ?" />
          </div>
        </div>
      </Section>

      <QuoteSection
        service="topographie"
        sourcePage="/topographie"
        title="Demander un devis topographique"
        description="Précisez l’objectif (construction, aménagement, dossier administratif), la localisation et la superficie concernée. Nous vérifierons la faisabilité avant toute intervention."
      />
    </>
  )
}
