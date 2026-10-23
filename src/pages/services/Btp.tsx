import { Link } from 'react-router-dom'
import { Seo } from '../../components/Seo'
import { Icon } from '../../components/Icon'
import { Alert, Badge, Section, SectionHeading } from '../../components/ui'
import { useSite } from '../../lib/site-context'
import { ProcessSteps, QuoteSection, ServiceAside, ServiceHero } from './shared'

const CATEGORIES = [
  {
    title: 'Construction de bâtiments & cités résidentielles',
    text: 'Réalisation de villas, cités résidentielles (logements de 2 et 3 pièces, studios), immeubles et locaux professionnels selon les plans validés.',
    icon: 'building',
  },
  {
    title: 'Travaux de bâtiment (gros œuvre & second œuvre)',
    text: 'Maçonnerie, béton armé, charpente, couverture, enduits, carrelage, menuiseries et finitions.',
    icon: 'shield',
  },
  {
    title: 'Rénovation & réhabilitation',
    text: 'Reprises, extensions et remise à niveau d’ouvrages existants après visite technique du site.',
    icon: 'sparkles',
  },
  {
    title: 'Suivi & coordination de chantier',
    text: 'Encadrement des équipes, contrôle de l’avancement et compte rendu régulier jusqu’à la réception.',
    icon: 'check',
  },
]

const STEPS = [
  { title: 'Expression du besoin', text: 'Programme (nombre de pièces, studios…), terrain, budget et calendrier.' },
  { title: 'Visite et étude', text: 'Vérification des contraintes techniques et des accès au site.' },
  { title: 'Devis détaillé', text: 'Description écrite des travaux, matériaux, délais et modalités de paiement.' },
  { title: 'Exécution et livraison', text: 'Réalisation des travaux, suivi régulier et nettoyage de fin de chantier possible.' },
]

export default function Btp() {
  const { services } = useSite()
  const service = services.find((item) => item.slug === 'btp-construction')

  return (
    <>
      <Seo
        title="Construction de bâtiments et BTP à Daloa et en Côte d’Ivoire — BRILLE GROUP SARL"
        description="Construction de bâtiments, cités résidentielles (logements 2 et 3 pièces, studios) et travaux de BTP à Daloa et partout en Côte d’Ivoire avec BRILLE GROUP SARL."
        path="/btp-construction"
      />
      <ServiceHero
        eyebrow="Construction de bâtiments — BTP"
        title="Construire vos maisons, cités résidentielles et locaux avec méthode"
        description="De la maison individuelle aux cités locatives (logements de 2 et 3 pièces, studios), BRILLE GROUP SARL intervient à Daloa et partout en Côte d’Ivoire avec un devis écrit détaillé."
        image="/images/btp-construction.jpg"
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeading
              eyebrow="Nos prestations BTP"
              title="Des interventions cadrées, sans surprise"
              description={
                service?.description ??
                'Construction de bâtiments, cités résidentielles, travaux de bâtiment et suivi de chantier.'
              }
            />

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {CATEGORIES.map((category) => (
                <div key={category.title} className="card p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-gold-300">
                    <Icon name={category.icon} className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{category.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{category.text}</p>
                </div>
              ))}
            </div>

            {/* Référence chantier confirmée */}
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge tone="green">Réalisation exécutée</Badge>
                <Link to="/realisations" className="text-xs font-semibold text-navy-900 underline">
                  Voir dans nos réalisations →
                </Link>
              </div>
              <h3 className="mt-3 text-base font-bold text-navy-950">
                PROJET RÉALISÉ : Construction d’une cité résidentielle — 2×3 pièces, 1×2 pièces et 6 studios
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-700">
                Ensemble locatif complet de 9 logements réalisé par BRILLE GROUP SARL. Contactez-nous pour discuter
                d’un programme similaire (cité locative, cour commune moderne, villas ou studios).
              </p>
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-semibold">Le déroulement d’un chantier</h3>
              <ProcessSteps steps={STEPS} />
            </div>

            <Alert tone="warning" className="mt-8" title="Précision importante">
              Les conditions d’exécution, les matériaux, les délais et les garanties applicables sont définis par écrit
              dans le devis et le contrat signés entre BRILLE GROUP SARL et le maître d’ouvrage avant le démarrage des
              travaux.
            </Alert>

            <div className="mt-6 rounded-2xl border border-navy-100 bg-navy-50 p-5">
              <h3 className="text-sm font-semibold text-navy-900">Documents utiles pour étudier votre projet</h3>
              <ul className="mt-3 grid gap-2 text-sm text-navy-700 sm:grid-cols-2">
                {[
                  'Plans ou programme souhaité (ex. nombre de pièces / studios)',
                  'Justificatif ou situation du terrain',
                  'Localisation précise du site en Côte d’Ivoire',
                  'Budget et délai envisagés',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                    {item}
                  </li>
                ))}
              </ul>
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
        description="Indiquez la nature du projet (maison, cité, studios, local…), sa localisation, le délai souhaité et une estimation de budget."
      />
    </>
  )
}
