import { useSearchParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Icon } from '../components/Icon'
import { PageHero, Section } from '../components/ui'
import { QuoteForm } from '../components/forms/QuoteForm'
import { useSite } from '../lib/site-context'
import { telHref } from '../lib/format'

const STEPS = [
  { title: 'Vous décrivez', text: 'Votre besoin, la localisation et le délai souhaité, en quelques lignes.' },
  { title: 'Nous analysons', text: 'Nous vérifions la faisabilité et identifions les informations manquantes.' },
  { title: 'Nous vous rappelons', text: 'Un échange permet de préciser le périmètre et les contraintes.' },
  { title: 'Vous recevez un devis', text: 'Une proposition écrite, avec le détail des prestations et des conditions.' },
]

export default function Devis() {
  const [params] = useSearchParams()
  const { settings } = useSite()
  const service = params.get('service') ?? 'autre'
  const phone = String(settings.phone_primary ?? '')

  return (
    <>
      <Seo
        title="Demander un devis gratuit"
        description="Demandez un devis à BRILLE GROUP SARL pour vos travaux de construction, d’aménagement foncier, de topographie, d’immobilier, de formation ou de nettoyage professionnel à Daloa."
        path="/devis"
      />
      <PageHero
        logo
        eyebrow="Demande de devis"
        title="Décrivez votre projet, nous vous répondons"
        description="Ce formulaire nous permet de qualifier votre demande et de vous apporter une réponse utile. Aucun engagement, aucune inscription automatique."
        image="/images/btp-construction.jpg"
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <QuoteForm
              defaultService={service}
              sourcePage="/devis"
              variant="full"
              title="Votre demande de devis"
              description="Les informations marquées d’un astérisque sont nécessaires pour traiter votre demande. Vous pouvez compléter les autres si vous les connaissez."
            />
          </div>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="card p-6">
                <h2 className="text-lg font-semibold">Comment ça se passe ?</h2>
                <ol className="mt-4 space-y-4">
                  {STEPS.map((step, index) => (
                    <li key={step.title} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-[11px] font-bold text-gold-300">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-navy-900">{step.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-navy-600">{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="card p-6">
                <h2 className="text-base font-semibold">Vous préférez appeler ?</h2>
                <p className="mt-2 text-sm text-navy-600">
                  C’est souvent plus rapide pour un premier échange. Nous sommes joignables aux heures ouvrables.
                </p>
                {phone ? (
                  <a href={telHref(phone)} className="btn-primary mt-4 w-full">
                    <Icon name="phone" className="h-4 w-4" />
                    {phone}
                  </a>
                ) : null}
              </div>

              <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
                <p className="text-sm font-semibold text-navy-900">Confidentialité</p>
                <p className="mt-1.5 text-xs leading-relaxed text-navy-700">
                  Vos coordonnées et le contenu de votre demande ne sont visibles que par les personnes habilitées de
                  BRILLE GROUP SARL. Elles ne sont ni publiées, ni revendues.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  )
}
