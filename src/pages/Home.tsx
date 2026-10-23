import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Icon } from '../components/Icon'
import { ProjectCard, ServiceCard } from '../components/cards'
import { Badge, EmptyState, Section, SectionHeading, Spinner } from '../components/ui'
import { useSite } from '../lib/site-context'
import { useApiQuery } from '../lib/hooks'
import { telHref, whatsappHref } from '../lib/format'
import type { ProjectDTO } from '../lib/types'

export default function Home() {
  const { coreServices, settings, capabilities, loading } = useSite()
  const projects = useApiQuery<{ projects: ProjectDTO[] }>(
    capabilities.hasProjects ? '/api/public/projects' : null,
  )

  const phone = String(settings.phone_primary ?? '')
  const heroTitle = String(settings.hero_title ?? 'Des solutions intégrées pour construire, aménager et valoriser vos projets.')
  const heroSubtitle = String(
    settings.hero_subtitle ??
      'BRILLE GROUP SARL vous accompagne dans vos projets de construction, d’aménagement foncier, de topographie, d’immobilier, de formation et de nettoyage professionnel.',
  )
  const wa = whatsappHref(
    typeof settings.whatsapp_number === 'string' ? settings.whatsapp_number : '',
    'Bonjour BRILLE GROUP, je souhaite parler de mon projet.',
  )
  const values = Array.isArray(settings.values_json)
    ? (settings.values_json as Array<{ title?: string; text?: string }>)
    : []

  return (
    <>
      <Seo
        title="BRILLE GROUP SARL — Construire, aménager et valoriser vos projets à Daloa"
        description="Entreprise ivoirienne multiservices à Tazibouo (région de Daloa) : aménagement foncier, BTP et construction, topographie, immobilier et vente de terrains, conseils, formation et nettoyage professionnel."
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'BRILLE GROUP SARL',
          description:
            'Entreprise multiservices en Côte d’Ivoire : aménagement foncier, BTP et construction, topographie, immobilier, conseils, formation et nettoyage professionnel.',
          telephone: phone || undefined,
          email: typeof settings.email_primary === 'string' ? settings.email_primary : undefined,
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Tazibouo',
            addressLocality: 'Daloa',
            addressRegion: 'Haut-Sassandra',
            addressCountry: 'CI',
          },
          sameAs: typeof settings.facebook_url === 'string' ? [settings.facebook_url] : undefined,
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Héro                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <img
          src="/images/hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-950/95 to-navy-900/60" aria-hidden="true" />
        <div className="container-page relative py-16 sm:py-24 lg:py-28">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="white">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
                Tazibouo · Daloa · Côte d’Ivoire
              </Badge>
              <Badge tone="white">Entreprise multiservices</Badge>
            </div>

            <h1 className="mt-6 text-[28px] font-semibold leading-[1.15] text-white sm:text-4xl lg:text-[44px]">
              {heroTitle}
            </h1>
            <div className="rule-gold mt-6" aria-hidden="true" />
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-navy-100 sm:text-lg">{heroSubtitle}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/services" className="btn-gold">
                Découvrir nos services
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-ghost-light">
                  Parler à notre équipe
                </a>
              ) : phone ? (
                <a href={telHref(phone)} className="btn-ghost-light">
                  <Icon name="phone" className="h-4 w-4" />
                  Parler à notre équipe : {phone}
                </a>
              ) : (
                <Link to="/contact" className="btn-ghost-light">
                  Parler à notre équipe
                </Link>
              )}
              <Link to="/devis" className="btn-primary !bg-white !text-navy-900 hover:!bg-navy-50">
                Demander un devis
              </Link>
            </div>

            <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-8 sm:grid-cols-4">
              {[
                { label: 'Implantation', value: 'Tazibouo, Daloa' },
                { label: 'Domaines', value: '6 pôles d’activité' },
                { label: 'Contact', value: phone || 'Par formulaire' },
                { label: 'Engagement', value: 'Devis écrit' },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-400">{item.label}</dt>
                  <dd className="mt-1 text-sm font-medium text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Domaines d'expertise                                               */}
      {/* ------------------------------------------------------------------ */}
      <Section tone="muted" id="services">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Nos domaines d’expertise"
            title="Un interlocuteur unique pour plusieurs métiers"
            description="BRILLE GROUP SARL réunit des activités complémentaires qui permettent d’accompagner un projet de son terrain jusqu’à sa valorisation."
          />
          <Link to="/services" className="btn-outline shrink-0 whitespace-nowrap">
            Tous les domaines
          </Link>
        </div>

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

      {/* ------------------------------------------------------------------ */}
      {/* Présentation                                                       */}
      {/* ------------------------------------------------------------------ */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <SectionHeading
              eyebrow="Qui sommes-nous"
              title="BRILLE GROUP SARL, un interlocuteur pour vos projets"
              description={String(
                settings.about_intro ??
                  'BRILLE GROUP SARL est une entreprise ivoirienne multiservices. Elle intervient dans l’aménagement foncier, le BTP et la construction, la topographie, l’immobilier et la vente de terrains, le conseil, la formation et le nettoyage professionnel.',
              )}
            />
            <p className="mt-5 text-[15px] leading-relaxed text-navy-600">
              L’entreprise réunit des compétences complémentaires pour éviter au client de multiplier les
              prestataires : un même référent suit le dossier, coordonne les intervenants et rend compte de
              l’avancement. Chaque prestation fait l’objet d’un devis écrit précisant le périmètre, les délais et
              les conditions.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                'Un référent unique par dossier',
                'Devis écrit avant chaque intervention',
                'Information transparente sur les limites de prestation',
                'Coordination avec les professionnels habilités',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-navy-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/a-propos" className="btn-primary">
                En savoir plus sur l’entreprise
              </Link>
              <Link to="/contact" className="btn-outline">
                Nous contacter
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative">
              <img
                src="/images/apropos.jpg"
                alt="Illustration : environnement de chantier et de construction"
                className="h-[340px] w-full rounded-2xl object-cover shadow-lift sm:h-[420px]"
                loading="lazy"
              />
              <div className="absolute -bottom-6 left-4 right-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-card sm:left-8 sm:right-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-600">Nos engagements</p>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  {(values.length > 0
                    ? values
                    : [{ title: 'Excellence' }, { title: 'Intégrité' }, { title: 'Redevabilité' }]
                  ).map((value, index) => (
                    <div key={value.title ?? index}>
                      <p className="text-sm font-semibold text-navy-900">{value.title}</p>
                      <div className="mx-auto mt-2 h-0.5 w-8 rounded bg-gold-300" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Réalisations                                                       */}
      {/* ------------------------------------------------------------------ */}
      <Section tone="muted">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Nos réalisations"
            title="Des projets que nous pouvons présenter"
            description="Chaque projet publié ici est documenté et autorisé à la publication par l’entreprise. Aucune référence n’est présentée sans validation."
          />
          <Link to="/realisations" className="btn-outline shrink-0 self-start whitespace-nowrap sm:self-auto">
            Voir la galerie
          </Link>
        </div>

        <div className="mt-10">
          {capabilities.hasProjects && projects.data && projects.data.projects.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.data.projects.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Galerie en préparation"
              description="BRILLE GROUP SARL publiera ici ses réalisations au fur et à mesure de leur documentation et de leur autorisation de diffusion. En attendant, contactez-nous pour échanger sur des projets comparables."
              action={{ label: 'Parler de votre projet', to: '/devis' }}
              icon={<Icon name="building" className="h-7 w-7" />}
            />
          )}
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Appel à l'action                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-navy-900 text-white">
        <div className="container-page grid gap-8 py-16 sm:py-20 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="eyebrow text-gold-300">
              <span className="h-px w-6 bg-current" aria-hidden="true" />
              Passons à l’action
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Parlons de votre prochain projet
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-navy-200">
              Décrivez-nous votre besoin : nous revenons vers vous avec les informations utiles et, si nécessaire,
              une proposition chiffrée. Aucun engagement de votre part.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <Link to="/devis" className="btn-gold">
              Demander un devis
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="btn-ghost-light">
              Nous contacter
            </Link>
            {phone ? (
              <a href={telHref(phone)} className="btn-ghost-light">
                <Icon name="phone" className="h-4 w-4" />
                {phone}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </>
  )
}
