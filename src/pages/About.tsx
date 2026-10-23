import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Icon } from '../components/Icon'
import { PageHero, Section, SectionHeading, Badge, Alert } from '../components/ui'
import { useSite } from '../lib/site-context'
import { telHref } from '../lib/format'

export default function About() {
  const { coreServices, settings } = useSite()
  const values = Array.isArray(settings.values_json)
    ? (settings.values_json as Array<{ title?: string; text?: string }>)
    : []

  const phone = String(settings.phone_primary ?? '')
  const rccm = String(settings.legal_rcm ?? '')

  return (
    <>
      <Seo
        title="À propos de BRILLE GROUP SARL"
        description="BRILLE GROUP SARL, entreprise ivoirienne multiservices basée à Tazibouo (région de Daloa) : aménagement foncier, BTP, topographie, immobilier, conseil, formation et nettoyage professionnel."
        path="/a-propos"
      />
      <PageHero
        logo
        eyebrow="L’entreprise"
        title="BRILLE GROUP SARL, un interlocuteur pour vos projets"
        description="Une entreprise ivoirienne qui réunit plusieurs métiers complémentaires au service des particuliers, des entreprises et des porteurs de projets."
        image="/images/apropos.jpg"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="Présentation"
              title="Une entreprise multiservices implantée à Daloa"
              description={String(
                settings.about_intro ??
                  'BRILLE GROUP SARL est une entreprise ivoirienne multiservices. Elle intervient dans l’aménagement foncier, le BTP et la construction, la topographie, l’immobilier et la vente de terrains, le conseil, la formation et le nettoyage professionnel.',
              )}
            />
            <div className="prose-brille mt-6 space-y-4">
              <p>
                Notre organisation repose sur un principe simple : un client qui nous confie un projet doit pouvoir
                identifier un interlocuteur, comprendre ce qui est proposé et savoir dans quelles conditions la
                prestation sera réalisée. Les devis sont établis par écrit et le périmètre de chaque intervention est
                précisé avant le démarrage.
              </p>
              <p>
                Certaines prestations — notamment les opérations foncières et topographiques réglementées — relèvent
                de professionnels habilités. Lorsque la situation l’exige, nous travaillons en coordination avec ces
                professionnels plutôt que de promettre une prestation que nous ne pouvons pas réaliser dans les
                règles.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-600">Mission</p>
                <p className="mt-2 text-sm leading-relaxed text-navy-700">
                  {String(
                    settings.about_mission ??
                      'Offrir à ses clients un interlocuteur unique, capable de coordonner plusieurs métiers autour d’un même projet, avec méthode, transparence et redevabilité.',
                  )}
                </p>
              </div>
              <div className="card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-600">Vision</p>
                <p className="mt-2 text-sm leading-relaxed text-navy-700">
                  {String(
                    settings.about_vision ??
                      'Devenir une référence régionale du conseil et des services intégrés, en associant qualité d’exécution et fiabilité de la relation client.',
                  )}
                </p>
              </div>
            </div>

            <Alert tone="info" className="mt-8" title="Transparence sur nos informations">
              Les informations publiées sur ce site proviennent de l’entreprise. Les éléments non encore confirmés
              (historique détaillé, effectifs, certifications, références de chantiers) ne sont volontairement pas
              affichés : nous préférons un site incomplet à un site inexact.
            </Alert>
          </div>

          <aside className="lg:col-span-5">
            <div className="card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-navy-500">Informations confirmées</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-navy-400">Dénomination</dt>
                  <dd className="font-medium text-navy-900">{String(settings.company_name ?? 'BRILLE GROUP SARL')}</dd>
                </div>
                <div>
                  <dt className="text-navy-400">Localisation</dt>
                  <dd className="font-medium text-navy-900">
                    {String(settings.address_line ?? 'Tazibouo')}
                    {settings.city ? `, ${String(settings.city)}` : ''}
                    {settings.country ? ` — ${String(settings.country)}` : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-navy-400">Téléphone</dt>
                  <dd className="font-medium text-navy-900">
                    {phone ? (
                      <a href={telHref(phone)} className="link-underline">
                        {phone}
                      </a>
                    ) : (
                      'À confirmer'
                    )}
                  </dd>
                </div>
                {settings.email_primary ? (
                  <div>
                    <dt className="text-navy-400">E-mail</dt>
                    <dd className="break-all font-medium text-navy-900">
                      <a href={`mailto:${String(settings.email_primary)}`} className="link-underline">
                        {String(settings.email_primary)}
                      </a>
                    </dd>
                  </div>
                ) : null}
                {settings.intervention_area ? (
                  <div>
                    <dt className="text-navy-400">Zone d’intervention</dt>
                    <dd className="font-medium text-navy-900">{String(settings.intervention_area)}</dd>
                  </div>
                ) : null}
                {settings.opening_hours ? (
                  <div>
                    <dt className="text-navy-400">Horaires</dt>
                    <dd className="font-medium text-navy-900">{String(settings.opening_hours)}</dd>
                  </div>
                ) : null}
              </dl>
              {rccm ? <p className="mt-5 border-t border-navy-100 pt-4 text-[11px] leading-relaxed text-navy-500">{rccm}</p> : null}
              <Link to="/contact" className="btn-primary mt-5 w-full">
                Nous contacter
              </Link>
            </div>
          </aside>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading eyebrow="Nos engagements" title="Ce que nous nous imposons" align="center" />
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-navy-600">
          Ces engagements sont des objectifs de travail. Ils ne constituent pas une certification : ils décrivent la
          manière dont nous souhaitons conduire chaque dossier.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {(values.length > 0
            ? values
            : [
                { title: 'Excellence', text: 'Viser un travail soigné et conforme à ce qui a été convenu.' },
                { title: 'Intégrité', text: 'Communiquer clairement sur les prix, les délais et les limites de chaque prestation.' },
                { title: 'Redevabilité', text: 'Répondre de ses engagements et rendre compte de l’avancement des travaux.' },
              ]
          ).map((value, index) => (
            <div key={value.title ?? index} className="card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-gold-300">
                <Icon name={['spark', 'shield', 'check'][index % 3]} className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{value.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Nos activités"
          title="Six pôles de services"
          description="Chaque domaine dispose de sa page détaillée, avec ses prestations, ses conditions et un formulaire adapté."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {coreServices.map((service) => (
            <Link
              key={service.id}
              to={`/services/${service.slug}`}
              className="group flex items-center justify-between gap-4 rounded-xl border border-navy-100 bg-white p-4 transition hover:border-navy-200 hover:shadow-card"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                  <Icon name={service.icon} className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-navy-900">{service.title}</span>
                  <span className="mt-0.5 block text-xs text-navy-500">{service.shortDescription}</span>
                </span>
              </span>
              <Icon name="arrow" className="h-4 w-4 shrink-0 text-navy-300 transition group-hover:text-gold-600" />
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="navy" className="!py-14">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Badge tone="white">Prochaine étape</Badge>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Discutons de votre projet</h2>
            <p className="mt-2 max-w-xl text-sm text-navy-200">
              Un échange préalable permet de vérifier la faisabilité, le budget et le calendrier avant tout engagement.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/devis" className="btn-gold">
              Demander un devis
            </Link>
            <Link to="/realisations" className="btn-ghost-light">
              Voir nos réalisations
            </Link>
          </div>
        </div>
      </Section>
    </>
  )
}
