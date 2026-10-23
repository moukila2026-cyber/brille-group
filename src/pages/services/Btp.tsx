import { Seo } from '../../components/Seo'
import { Icon } from '../../components/Icon'
import { Alert, Section, SectionHeading } from '../../components/ui'
import { useSite } from '../../lib/site-context'
import { ProcessSteps, QuoteSection, ServiceAside, ServiceHero } from './shared'

const CATEGORIES = [
  {
    title: 'Construction de bâtiments',
    text: 'Réalisation de bâtiments pour particuliers, entreprises ou porteurs de projets, selon les plans et le programme validés.',
    icon: 'building',
  },
  {
    title: 'Travaux de bâtiment',
    text: 'Interventions sur des ouvrages existants : reprises, extensions et travaux structurels, dans la limite des prestations confirmées.',
    icon: 'shield',
  },
  {
    title: 'Rénovation',
    text: 'Prestation proposée sur étude, après visite du site et vérification de la faisabilité technique.',
    icon: 'sparkles',
    badge: 'À confirmer selon dossier',
  },
  {
    title: 'Travaux complémentaires',
    text: 'Aménagements connexes (accès, clôtures, dallages…) lorsque l’entreprise confirme pouvoir les réaliser.',
    icon: 'check',
    badge: 'À confirmer selon dossier',
  },
]

const STEPS = [
  { title: 'Expression du besoin', text: 'Programme, plans ou intentions, terrain, budget envisagé et calendrier.' },
  { title: 'Visite et étude', text: 'Vérification des contraintes techniques et des accès au site.' },
  { title: 'Devis détaillé', text: 'Description des travaux, matériaux, délais et modalités de paiement.' },
  { title: 'Exécution et suivi', text: 'Réalisation des travaux avec points d’avancement convenus.' },
]

export default function Btp() {
  const { services } = useSite()
  const service = services.find((item) => item.slug === 'btp-construction')

  return (
    <>
      <Seo
        title="BTP et construction de bâtiments à Daloa"
        description="Construction de bâtiments et travaux de BTP à Daloa et en Côte d’Ivoire : devis détaillé, suivi de chantier et coordination des intervenants avec BRILLE GROUP SARL."
        path="/btp-construction"
      />
      <ServiceHero
        eyebrow="BTP & construction"
        title="Construire avec une méthode claire et un devis détaillé"
        description="De la construction neuve aux travaux de bâtiment, BRILLE GROUP SARL cadre chaque intervention par un devis écrit : nature des travaux, matériaux, délais et modalités de paiement."
        image="/images/btp-construction.jpg"
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeading
              eyebrow="Nos prestations"
              title="Des interventions cadrées, sans surprise"
              description={service?.description ?? 'Construction de bâtiments, travaux de bâtiment et suivi de chantier.'}
            />

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {CATEGORIES.map((category) => (
                <div key={category.title} className="card p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-gold-300">
                      <Icon name={category.icon} className="h-5 w-5" />
                    </div>
                    {category.badge ? (
                      <span className="rounded-full bg-navy-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-navy-500">
                        {category.badge}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{category.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{category.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-semibold">Le déroulement d’un chantier</h3>
              <ProcessSteps steps={STEPS} />
            </div>

            <Alert tone="warning" className="mt-8" title="Précision importante">
              Aucune garantie technique, certification ou label de qualité n’est affiché sur cette page tant que
              l’entreprise ne l’a pas communiqué et justifié. Les conditions d’exécution, de garantie et de réception
              sont définies dans le devis et le contrat signés.
            </Alert>

            <div className="mt-6 rounded-2xl border border-navy-100 bg-navy-50 p-5">
              <h3 className="text-sm font-semibold text-navy-900">Documents utiles pour étudier votre projet</h3>
              <ul className="mt-3 grid gap-2 text-sm text-navy-700 sm:grid-cols-2">
                {[
                  'Plans ou croquis, même sommaire',
                  'Titre ou justificatif du terrain',
                  'Localisation précise du site',
                  'Budget et délai envisagés',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-navy-500">
                Vous pouvez joindre ces éléments plus tard : le formulaire ne permet pas encore l’envoi de fichiers.
              </p>
            </div>
          </div>

          <div className="lg:col-span-4">
            <ServiceAside title="Un chantier à chiffrer ?" />
          </div>
        </div>
      </Section>

      <QuoteSection
        service="construction_btp"
        sourcePage="/btp-construction"
        title="Demander un devis de construction"
        description="Indiquez la nature du projet, sa localisation, le délai souhaité et, si possible, une estimation de budget. Nous revenons vers vous pour préciser les éléments techniques."
      />
    </>
  )
}
