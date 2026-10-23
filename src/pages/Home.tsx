import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Icon } from '../components/Icon'
import { Reveal } from '../components/Reveal'
import { ProjectCard, ServiceCard } from '../components/cards'
import { Section, SectionHeading } from '../components/ui'
import { useSite } from '../lib/site-context'
import { DEFAULT_PROJECTS, servicePath } from '../lib/default-site-data'
import { useApiQuery } from '../lib/hooks'
import { telHref, whatsappHref } from '../lib/format'
import { SOLUTIONS_NETTOYAGE } from './services/Nettoyage'
import type { ProjectDTO } from '../lib/types'

/** Quatre points d'appui factuels : aucune statistique inventée. */
const ATTAQUE = [
  {
    icon: 'layers',
    title: '6 pôles de métiers intégrés',
    text: 'Aménagement foncier, BTP, topographie, immobilier & terrains, conseils & formation, nettoyage & hygiène 3D.',
  },
  {
    icon: 'pin',
    title: 'À Daloa & partout en Côte d’Ivoire',
    text: 'Siège à Tazibouo (Daloa), interventions sur l’ensemble du territoire national.',
  },
  {
    icon: 'file',
    title: 'Devis écrit & coût compétitif',
    text: 'Périmètre, délais et conditions précisés par écrit avant chaque intervention.',
  },
  {
    icon: 'user',
    title: 'Un interlocuteur unique',
    text: 'Un même référent suit votre dossier du premier contact jusqu’à la réception.',
  },
]

const METHODE = [
  {
    title: 'Vous nous décrivez le besoin',
    text: 'Par WhatsApp, téléphone ou formulaire. Nous précisons ensemble localisation, surface, délais et budget envisagé.',
  },
  {
    title: 'Nous vérifions la faisabilité',
    text: 'Visite ou repérage sur place lorsque nécessaire, contrôle des pièces disponibles et mobilisation des intervenants qualifiés.',
  },
  {
    title: 'Vous recevez un devis écrit',
    text: 'Le document détaille les prestations, les quantités, les délais et les conditions. Rien n’est engagé avant votre accord.',
  },
  {
    title: 'Nous exécutons et rendons compte',
    text: 'Un suivi régulier de l’avancement, puis une réception soignée avec remise des éléments convenus.',
  },
]

const FAQ = [
  {
    question: 'Quels sont tous les services proposés par BRILLE GROUP SARL ?',
    answer:
      'BRILLE GROUP SARL intervient dans 6 domaines principaux : (1) Aménagement foncier & rural, (2) Construction de bâtiments — BTP (villas, cités résidentielles, studios, locaux), (3) Topographie, (4) Immobilier & vente de terrains, (5) Conseils & formation, et (6) Nettoyage industriel professionnel (fauteuils, matelas, moquettes, marbre, baies vitrées, intérieur auto, fin de chantier) associé à l’hygiène 3D/4D (dératisation, désinsectisation, désinfection, désodorisation).',
  },
  {
    question: 'Intervenez-vous en dehors de Daloa ?',
    answer:
      'Oui. L’entreprise est basée à Daloa (quartier Tazibouo, région du Haut-Sassandra) et intervient partout en Côte d’Ivoire, aussi bien à domicile que dans les établissements professionnels (bureaux, magasins, supermarchés, restaurants, entrepôts, chantiers).',
  },
  {
    question: 'Comment obtenir un devis rapidement ?',
    answer:
      'Écrivez-nous directement sur WhatsApp au +225 07 49 63 47 26, appelez le Bureau (+225 27 24 57 11 86) ou la ligne Sercom (+225 05 00 49 24 24), ou remplissez le formulaire « Demander un devis » en ligne.',
  },
  {
    question: 'Vérifiez-vous les documents fonciers et les prestations topographiques réglementées ?',
    answer:
      'La vérification des documents fonciers auprès des services compétents est indispensable avant toute transaction immobilière. De même, les opérations topographiques et foncières réglementées sont réalisées par des professionnels habilités conformément à la réglementation en vigueur.',
  },
]

export default function Home() {
  const { coreServices, complementaryServices, settings, capabilities } = useSite()
  const projectsQuery = useApiQuery<{ projects: ProjectDTO[] }>('/api/public/projects')

  const displayedProjects =
    projectsQuery.data && projectsQuery.data.projects.length > 0
      ? projectsQuery.data.projects
      : capabilities.hasProjects
        ? DEFAULT_PROJECTS
        : []

  const phoneBureau = String(settings.phone_primary ?? '+225 27 24 57 11 86')
  const phoneSercom = String(settings.phone_third ?? '+225 05 00 49 24 24')
  const heroTitle = String(
    settings.hero_title ?? 'Construire, aménager, assainir et valoriser vos projets partout en Côte d’Ivoire.',
  )
  const heroSubtitle = String(
    settings.hero_subtitle ??
      'Implantée à Daloa (Tazibouo), BRILLE GROUP SARL réunit aménagement foncier, construction de bâtiments et BTP, topographie, immobilier et vente de terrains, conseils, formation, nettoyage industriel professionnel et hygiène 3D.',
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
        title="BRILLE GROUP SARL — Aménagement foncier, BTP, topographie, immobilier & nettoyage 3D à Daloa"
        description="Entreprise multiservices à Daloa (Tazibouo) intervenant partout en Côte d’Ivoire : aménagement foncier, construction de bâtiments et BTP, topographie, vente de terrains, conseils, formation, nettoyage industriel professionnel, dératisation, désinsectisation et désinfection."
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'BRILLE GROUP SARL',
          description:
            'Entreprise multiservices en Côte d’Ivoire : aménagement foncier, construction de bâtiments et BTP, topographie, immobilier et vente de terrains, conseils, formation, nettoyage industriel professionnel, dératisation, désinsectisation et désinfection.',
          telephone: phoneBureau || undefined,
          email: typeof settings.email_primary === 'string' ? settings.email_primary : undefined,
          areaServed: 'Côte d’Ivoire',
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

      {/* ================================================================ */}
      {/* HÉRO                                                             */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 bg-grid opacity-[0.5]" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -left-32 -top-24 h-96 w-96 rounded-full bg-brandred/25 blur-[110px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 right-0 h-[26rem] w-[26rem] rounded-full bg-azure-500/25 blur-[120px]"
          aria-hidden="true"
        />

        <div className="container-page relative grid gap-14 py-16 lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-24">
          <div className="lg:col-span-7">
            <Reveal className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Basée à Daloa · Intervention partout en Côte d’Ivoire
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-7 text-[32px] font-bold leading-[1.08] tracking-tight text-white sm:text-[44px] lg:text-[48px]">
                <span className="text-gradient-brand">{heroTitle}</span>
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <div className="mt-6 flex items-center gap-3" aria-hidden="true">
                <span className="rule-brand" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-azure-300">
                  Let’s shine together
                </span>
              </div>
              <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-navy-200 sm:text-lg">
                {heroSubtitle}
              </p>
            </Reveal>

            <Reveal delay={200} className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/devis"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-navy-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Demander un devis
                <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#services"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10"
              >
                Voir tous nos services
              </a>
              {wa && capabilities.whatsappConfigured ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-[#25D366]/20 px-6 py-3.5 text-sm font-semibold text-emerald-200 transition hover:bg-[#25D366]/30"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.7 14.1c-.24.67-1.4 1.29-1.93 1.34-.53.05-1.02.24-3.44-.72-2.9-1.15-4.72-4.15-4.86-4.35-.14-.2-1.15-1.54-1.15-2.94 0-1.4.73-2.09.99-2.38.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.48.24.58.81 1.98.88 2.12.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.29-.13.58.16.29.72 1.19 1.55 1.93 1.06.95 1.95 1.25 2.24 1.39.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.65.78 1.94.92.29.14.48.22.55.34.07.12.07.7-.17 1.37z" />
                  </svg>
                  WhatsApp · 07 49 63 47 26
                </a>
              ) : phoneBureau ? (
                <a
                  href={telHref(phoneBureau)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <Icon name="phone" className="h-4 w-4" />
                  {phoneBureau}
                </a>
              ) : null}
            </Reveal>

            <Reveal delay={260} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-[13px] text-navy-300">
              <span className="inline-flex items-center gap-2">
                <Icon name="check" className="h-4 w-4 text-emerald-400" /> Bureau : {phoneBureau}
              </span>
              {phoneSercom ? (
                <span className="inline-flex items-center gap-2">
                  <Icon name="check" className="h-4 w-4 text-emerald-400" /> Sercom : {phoneSercom}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2">
                <Icon name="check" className="h-4 w-4 text-emerald-400" /> Devis écrit avant intervention
              </span>
            </Reveal>
          </div>

          {/* Visuel de droite : logo officiel + illustrations */}
          <div className="lg:col-span-5">
            <Reveal delay={120} className="relative mx-auto max-w-md">
              <div className="rounded-[28px] border border-white/12 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="rounded-2xl bg-white px-5 py-6 shadow-inner">
                  <img
                    src="/images/logo-brille-group.svg"
                    alt="BRILLE GROUP SARL — Let’s shine together"
                    className="mx-auto h-32 w-auto sm:h-40"
                    width={460}
                    height={240}
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      src="/images/terrain.jpg"
                      alt="Vue aérienne d’un terrain borné et desservi par une voie d’accès — illustration"
                      className="h-28 w-full object-cover transition duration-700 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      src="/images/materiel.jpg"
                      alt="Station totale de relevé topographique sur pied — illustration"
                      className="h-28 w-full object-cover transition duration-700 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-navy-950/40 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-azure-300">
                      Contacts directs
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                      {phoneBureau || 'Formulaire de contact'}
                    </p>
                  </div>
                  <a
                    href={telHref(phoneBureau)}
                    aria-label={`Appeler le ${phoneBureau}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brandred to-azure-600 text-white"
                  >
                    <Icon name="phone" className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Pastille flottante */}
              <div className="absolute -right-3 -top-6 hidden animate-float rounded-2xl border border-white/15 bg-navy-900/95 px-4 py-3 shadow-xl backdrop-blur sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-azure-300">Services</p>
                <p className="mt-0.5 text-sm font-bold text-white">6 pôles d’activité</p>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Bandeau de confiance */}
        <div className="relative border-t border-white/10 bg-navy-950/70 backdrop-blur">
          <div className="container-page grid gap-px py-0 sm:grid-cols-2 lg:grid-cols-4">
            {ATTAQUE.map((item, index) => (
              <div
                key={item.title}
                className="flex items-start gap-3 border-white/10 py-6 sm:pr-6 lg:border-l lg:pl-6 lg:first:border-l-0 lg:first:pl-0"
                style={{ borderTopWidth: index > 1 ? 1 : 0 }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/15 to-white/5 text-azure-300">
                  <Icon name={item.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-navy-400">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* NOS SERVICES / DOMAINES D'ACTIVITÉ                               */}
      {/* ================================================================ */}
      <Section tone="muted" id="services" className="bg-grid-light">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Nos services"
            title="Tous les services proposés par BRILLE GROUP SARL"
            description="Aménagement foncier, construction de bâtiments & BTP, topographie, immobilier & vente de terrains, conseils & formation, nettoyage industriel professionnel & hygiène 3D : un seul partenaire pour tous vos besoins."
          />
          <Link to="/services" className="btn-outline shrink-0 whitespace-nowrap">
            Tous les services
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coreServices.map((service, index) => (
            <Reveal key={service.id} delay={Math.min(index, 5) * 70}>
              <ServiceCard service={service} index={index} />
            </Reveal>
          ))}
        </div>

        {complementaryServices.length > 0 ? (
          <div className="mt-10 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-azure-600">
                  Activités complémentaires
                </p>
                <h3 className="mt-1 text-base font-semibold text-navy-900">
                  Également proposés sur demande par BRILLE GROUP SARL
                </h3>
              </div>
              <Link to="/services" className="text-xs font-semibold text-azure-700 hover:underline">
                Voir le détail →
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {complementaryServices.map((service) => (
                <Link
                  key={service.id}
                  to={servicePath(service.slug)}
                  className="inline-flex items-center gap-2 rounded-full border border-navy-100 bg-navy-50/70 px-3.5 py-2 text-xs font-semibold text-navy-800 transition hover:border-azure-300 hover:bg-azure-50"
                >
                  <Icon name={service.icon} className="h-3.5 w-3.5 text-azure-600" />
                  {service.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </Section>

      {/* ================================================================ */}
      {/* ZOOM : NETTOYAGE INDUSTRIEL PROFESSIONNEL & HYGIÈNE 3D / 4D      */}
      {/* ================================================================ */}
      <Section className="!py-16">
        <div className="overflow-hidden rounded-3xl bg-navy-950 p-6 text-white shadow-lift sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow text-azure-300">
                <span className="h-px w-6 bg-current" aria-hidden="true" />
                Pôle spécialisé · Partout en Côte d’Ivoire
              </p>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">
                Nettoyage industriel professionnel, dératisation, désinsectisation & désinfection
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-navy-200">
                Redonnez éclat et protection optimale à vos fauteuils, matelas, moquettes, véhicules, maisons et
                établissements professionnels (bureaux, magasins, supermarchés, restaurants, entrepôts). Lutte moderne
                contre rats, souris, margouillats, lézards, salamandres, cafards, moustiques, mouches, punaises de lit,
                bactéries, champignons et virus.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/nettoyage-professionnel" className="btn-gold">
                  Voir l’offre complète
                  <Icon name="arrow" className="h-4 w-4" />
                </Link>
                {wa && capabilities.whatsappConfigured ? (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:brightness-105"
                  >
                    WhatsApp · 07 49 63 47 26
                  </a>
                ) : null}
              </div>
            </Reveal>

            <Reveal delay={100} className="lg:col-span-7">
              <div className="grid gap-2.5 sm:grid-cols-2">
                {SOLUTIONS_NETTOYAGE.map((solution) => (
                  <div
                    key={solution.title}
                    className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-3 text-xs text-navy-100"
                  >
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="font-medium leading-snug">{solution.title}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* ================================================================ */}
      {/* MÉTHODE                                                          */}
      {/* ================================================================ */}
      <Section tone="muted">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center">
            <span className="h-px w-6 bg-current" aria-hidden="true" />
            Notre méthode
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Quatre étapes, aucune zone d’ombre</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-navy-600">
            De la première prise de contact à la réception du chantier ou de la prestation, vous savez à tout moment où
            en est votre dossier.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {METHODE.map((step, index) => (
            <Reveal key={step.title} delay={index * 90}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-navy-100 bg-white p-6 shadow-card transition hover-lift hover:border-azure-200">
                <span
                  className="absolute right-4 top-3 font-display text-5xl font-black text-navy-50 transition group-hover:text-azure-50"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brandred to-azure-600 text-white shadow-lg shadow-azure-500/20">
                  <Icon name="check" className="h-5 w-5" />
                </span>
                <h3 className="relative mt-5 text-base font-semibold leading-snug">{step.title}</h3>
                <p className="relative mt-2 text-[13.5px] leading-relaxed text-navy-600">{step.text}</p>
                <span className="mt-5 block h-1 w-10 rounded-full bg-gradient-to-r from-brandred to-azure-500" aria-hidden="true" />
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ================================================================ */}
      {/* PRÉSENTATION                                                     */}
      {/* ================================================================ */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-6">
            <div className="relative">
              <div className="absolute -left-3 -top-3 h-24 w-24 rounded-2xl border-2 border-azure-300/60" aria-hidden="true" />
              <img
                src="/images/equipe.jpg"
                alt="Échange autour de plans de construction dans un bureau — illustration"
                className="relative h-[340px] w-full rounded-3xl object-cover shadow-lift sm:h-[430px]"
                loading="lazy"
              />
              <div className="absolute -bottom-6 left-4 right-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-card sm:left-8 sm:right-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-azure-600">Nos engagements</p>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  {(values.length > 0
                    ? values
                    : [{ title: 'Excellence' }, { title: 'Intégrité' }, { title: 'Redevabilité' }]
                  ).map((value, index) => (
                    <div key={value.title ?? index}>
                      <p className="text-sm font-semibold text-navy-900">{value.title}</p>
                      <div className="mx-auto mt-2 h-0.5 w-8 rounded bg-gradient-to-r from-brandred to-azure-500" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-6">
            <SectionHeading
              eyebrow="Qui sommes-nous"
              title="BRILLE GROUP SARL, un interlocuteur unique partout en Côte d’Ivoire"
              description={String(
                settings.about_intro ??
                  'BRILLE GROUP SARL est une entreprise ivoirienne multiservices implantée à Daloa (Tazibouo) qui intervient partout en Côte d’Ivoire : aménagement foncier, construction de bâtiments et BTP, topographie, immobilier et vente de terrains, conseils, formation, nettoyage industriel professionnel et hygiène 3D.',
              )}
            />
            <p className="mt-5 text-[15px] leading-relaxed text-navy-600">
              L’entreprise réunit des compétences complémentaires pour éviter au client de multiplier les
              prestataires : un même référent suit le dossier, coordonne les intervenants et rend compte de
              l’avancement. Chaque prestation fait l’objet d’un devis écrit précisant le périmètre, les délais
              et les conditions.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                'Un référent unique par dossier',
                'Devis écrit avant chaque intervention',
                'Interventions à Daloa et dans toute la Côte d’Ivoire',
                'Coordination avec les professionnels habilités',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-navy-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-azure-100 text-azure-700">
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
          </Reveal>
        </div>
      </Section>

      {/* ================================================================ */}
      {/* BANDEAU VISUEL                                                   */}
      {/* ================================================================ */}
      <section className="relative isolate overflow-hidden">
        <img
          src="/images/terrain.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/30" aria-hidden="true" />
        <div className="container-page relative py-16 sm:py-20">
          <Reveal className="max-w-2xl text-white">
            <p className="eyebrow text-azure-300">
              <span className="h-px w-6 bg-current" aria-hidden="true" />
              Du terrain au bâtiment livré
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Un terrain à aménager, une cité à construire, un plan à relever ?
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-navy-200">
              Nous étudions votre demande partout en Côte d’Ivoire et vous indiquons clairement délais et budget.
              La vérification des documents fonciers demeure indispensable avant toute transaction immobilière.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/devis" className="btn-gold">
                Décrire mon projet
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <Link
                to="/immobilier"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                Voir les terrains disponibles
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================================ */}
      {/* RÉALISATIONS                                                     */}
      {/* ================================================================ */}
      <Section tone="muted">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Nos réalisations"
            title="Projets déjà réalisés par BRILLE GROUP SARL"
            description="Chaque projet présenté ici correspond à une réalisation confirmée par l’entreprise, sans photographie fictive."
          />
          <Link to="/realisations" className="btn-outline shrink-0 self-start whitespace-nowrap sm:self-auto">
            Voir les réalisations
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedProjects.slice(0, 3).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </Section>

      {/* ================================================================ */}
      {/* QUESTIONS FRÉQUENTES                                             */}
      {/* ================================================================ */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <SectionHeading
              eyebrow="Questions fréquentes"
              title="Ce que les clients demandent le plus souvent"
              description="Une réponse claire vaut mieux qu’une promesse. Si votre question n’y figure pas, écrivez-nous sur WhatsApp ou appelez-nous directement."
            />
            <Link to="/contact" className="btn-primary mt-6">
              Poser ma question
            </Link>
          </Reveal>

          <div className="lg:col-span-8">
            <div className="divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card">
              {FAQ.map((item, index) => (
                <details key={item.question} className="group" open={index === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15px] font-semibold text-navy-900 transition hover:bg-navy-50/60 sm:px-6">
                    {item.question}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-navy-200 text-navy-500 transition group-open:rotate-45 group-open:border-azure-400 group-open:text-azure-600">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                      </svg>
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-[14px] leading-relaxed text-navy-600 sm:px-6">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ================================================================ */}
      {/* APPEL À L'ACTION                                                 */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-brandred/25 blur-[100px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-azure-500/25 blur-[100px]" aria-hidden="true" />
        <div className="container-page relative grid gap-10 py-16 sm:py-20 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow text-azure-300">
              <span className="h-px w-6 bg-current" aria-hidden="true" />
              Passons à l’action
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Parlons de votre prochain projet
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-navy-200">
              Nous sommes à Daloa et nous intervenons partout en Côte d’Ivoire. Contactez-nous par WhatsApp, téléphone
              ou formulaire pour une étude sans engagement.
            </p>
          </Reveal>
          <Reveal delay={100} className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <Link
              to="/devis"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-navy-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5"
            >
              Demander un devis
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            {wa && capabilities.whatsappConfigured ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white transition hover:brightness-105"
              >
                WhatsApp · 07 49 63 47 26
              </a>
            ) : null}
            {phoneBureau ? (
              <a
                href={telHref(phoneBureau)}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                <Icon name="phone" className="h-4 w-4" />
                {phoneBureau}
              </a>
            ) : null}
          </Reveal>
        </div>
      </section>
    </>
  )
}
