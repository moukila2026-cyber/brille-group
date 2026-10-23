import { Seo } from '../../components/Seo'
import { Icon } from '../../components/Icon'
import { Alert, Section, SectionHeading, Badge } from '../../components/ui'
import { useSite } from '../../lib/site-context'
import { CleaningForm } from '../../components/forms/CleaningForm'
import { ServiceAside, ServiceHero } from './shared'

const PRESTATIONS = [
  { title: 'Nettoyage de bureaux et locaux professionnels', text: 'Entretien régulier ou ponctuel d’espaces de travail, selon un cahier des charges défini.', icon: 'building' },
  { title: 'Nettoyage de maisons', text: 'Interventions dans les logements, à la demande ou de façon récurrente.', icon: 'home' },
  { title: 'Nettoyage après travaux', text: 'Remise en état après chantier : poussières, résidus et dépôts de fin de travaux.', icon: 'sparkles' },
  { title: 'Nettoyage de vitres', text: 'Vitrerie intérieure et accessible, selon les conditions d’intervention.', icon: 'monitor' },
  { title: 'Entretien de surfaces', text: 'Entretien courant des sols et surfaces selon leur nature.', icon: 'check' },
  { title: 'Prestations ponctuelles', text: 'Interventions spécifiques après évaluation du besoin et du site.', icon: 'clock' },
]

export default function Nettoyage() {
  const { services } = useSite()
  const service = services.find((item) => item.slug === 'nettoyage-professionnel')

  return (
    <>
      <Seo
        title="Nettoyage professionnel à Daloa — bureaux, maisons, après travaux"
        description="Nettoyage et entretien de locaux professionnels, de maisons et nettoyage après travaux à Daloa et en Côte d’Ivoire. Devis gratuit avec BRILLE GROUP SARL."
        path="/nettoyage-professionnel"
      />
      <ServiceHero
        eyebrow="Nettoyage professionnel"
        title="Des espaces propres, entretenus et prêts à l’usage"
        description="BRILLE GROUP SARL propose des prestations de nettoyage et d’entretien pour les professionnels et les particuliers, avec un périmètre clairement défini dans le devis."
        image="/images/nettoyage.jpg"
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeading
              eyebrow="Prestations"
              title="Ce que nous pouvons prendre en charge"
              description={service?.description ?? 'Entretien et nettoyage de locaux professionnels, de maisons et après travaux.'}
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {PRESTATIONS.map((item) => (
                <div key={item.title} className="card flex gap-3 p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-800">
                    <Icon name={item.icon} className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-navy-900">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-navy-600">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge tone="muted">Périmètre à valider</Badge>
              <p className="text-xs text-navy-500">
                Chaque prestation ci-dessus est activée après confirmation de l’entreprise. Contactez-nous pour
                vérifier la disponibilité et les conditions.
              </p>
            </div>

            <Alert tone="warning" className="mt-8" title="Prestations non proposées actuellement">
              La désinfection, la dératisation et le traitement antiparasitaire ne sont pas présentés comme
              disponibles sur ce site : ces prestations exigent des produits, des méthodes et des qualifications
              spécifiques que l’entreprise doit confirmer. Nous ne les proposons donc pas en ligne.
            </Alert>

            <div className="mt-8 rounded-2xl border border-navy-100 bg-navy-50 p-5">
              <h3 className="text-sm font-semibold text-navy-900">Ce qui nous aide à chiffrer rapidement</h3>
              <ul className="mt-3 grid gap-2 text-sm text-navy-700 sm:grid-cols-2">
                {[
                  'Type et usage du local',
                  'Surface approximative',
                  'Fréquence souhaitée',
                  'Date de démarrage',
                  'Contraintes d’accès ou d’horaires',
                  'État initial des lieux',
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
            <ServiceAside title="Un devis de nettoyage ?" />
          </div>
        </div>
      </Section>

      <Section tone="muted" id="devis">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Demande de devis"
              title="Décrivez votre besoin de nettoyage"
              description="Plus votre demande est précise, plus notre proposition sera juste. Ces informations sont transmises à notre équipe avec une référence de suivi."
            />
          </div>
          <div className="lg:col-span-7">
            <CleaningForm />
          </div>
        </div>
      </Section>
    </>
  )
}
