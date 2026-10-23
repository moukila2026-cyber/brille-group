import { Link } from 'react-router-dom'
import { Seo } from '../../components/Seo'
import { Icon } from '../../components/Icon'
import { Alert, Badge, Section, SectionHeading } from '../../components/ui'
import { useSite } from '../../lib/site-context'
import { telHref, whatsappHref } from '../../lib/format'
import { CleaningForm } from '../../components/forms/CleaningForm'
import { ServiceAside, ServiceHero } from './shared'

/** Les 12 solutions de nettoyage industriel & professionnel communiquées par BRILLE GROUP SARL. */
export const SOLUTIONS_NETTOYAGE = [
  {
    title: 'Nettoyage et désinfection de fauteuils',
    text: 'Détachage en profondeur, assainissement et remise en éclat des salons, canapés et sièges professionnels.',
    icon: 'sparkles',
  },
  {
    title: 'Nettoyage et désinfection de moquettes ou tapis',
    text: 'Shampouinage, aspiration haute puissance, élimination des acariens et des odeurs persistantes.',
    icon: 'layers',
  },
  {
    title: 'Nettoyage et désinfection de matelas & punaises de lit',
    text: 'Assainissement complet de la literie et traitement ciblé contre les punaises de lit et acariens.',
    icon: 'shield',
  },
  {
    title: 'Nettoyage de baies vitrées',
    text: 'Lavage sans traces des vitres, vitrines commerciales, cloisons vitrées et ouvertures en hauteur accessible.',
    icon: 'monitor',
  },
  {
    title: 'Nettoyage d’intérieur de voiture',
    text: 'Rénovation complète de l’habitacle : sièges, plafonnier, tapis, tableau de bord et désodorisation.',
    icon: 'truck',
  },
  {
    title: 'Nettoyage de fin de chantier',
    text: 'Évacuation des résidus, poussières de ciment, traces de peinture et remise au propre avant réception.',
    icon: 'building',
  },
  {
    title: 'Nettoyage avant aménagement',
    text: 'Préparation hygiénique intégrale d’un logement, bureau ou local avant l’installation des occupants.',
    icon: 'home',
  },
  {
    title: 'Nettoyage après rénovation',
    text: 'Remise en état approfondie des sols, menuiseries, sanitaires et surfaces après travaux de réfection.',
    icon: 'spark',
  },
  {
    title: 'Nettoyage et ponçage du marbre',
    text: 'Décapage, ponçage, cristallisation et lustrage pour redonner brillance et protection aux sols en marbre.',
    icon: 'layers',
  },
  {
    title: 'Nettoyage de façades et plafonds',
    text: 'Dépoussiérage, démoussage et lavage adapté aux revêtements extérieurs, enseignes et faux plafonds.',
    icon: 'building',
  },
  {
    title: 'Nettoyage et désinfection de maisons, magasins, bureaux & grandes surfaces',
    text: 'Prestations ponctuelles ou contrats d’entretien pour résidences, commerces, administrations et supermarchés.',
    icon: 'home',
  },
  {
    title: 'Désinfection, dératisation, désinsectisation & désodorisation',
    text: 'Traitement complet 4D pour maisons, magasins, entreprises, restaurants, entrepôts et supermarchés.',
    icon: 'shield',
  },
] as const

const NUISIBLES = [
  {
    category: 'Rongeurs & petits nuisibles',
    items: 'Rats, souris, margouillats, lézards, salamandres…',
  },
  {
    category: 'Insectes rampants & volants',
    items: 'Cafards, moustiques, mouches, punaises de lit, fourmis…',
  },
  {
    category: 'Micro-organismes & odeurs',
    items: 'Bactéries, champignons, virus (dont protocoles type COVID-19) et désodorisation durable.',
  },
]

const LIEUX_INTERVENTION = [
  'Maisons, villas & résidences',
  'Bureaux & entreprises',
  'Magasins & supermarchés',
  ' Grandes surfaces commerciales',
  'Restaurants, hôtels & cuisines',
  'Entrepôts & locaux industriels',
]

export default function Nettoyage() {
  const { services, settings } = useSite()
  const service = services.find((item) => item.slug === 'nettoyage-professionnel')

  const phoneBureau = String(settings.phone_primary ?? '+225 27 24 57 11 86')
  const phoneSercom = String(settings.phone_third ?? '+225 05 00 49 24 24')
  const waRaw = typeof settings.whatsapp_number === 'string' ? settings.whatsapp_number : '+225 07 49 63 47 26'
  const wa = whatsappHref(
    waRaw,
    'Bonjour BRILLE GROUP, je souhaite un devis de nettoyage professionnel / dératisation / désinfection.',
  )

  return (
    <>
      <Seo
        title="Nettoyage industriel professionnel, dératisation, désinsectisation & désinfection — BRILLE GROUP SARL"
        description="Service de nettoyage industriel professionnel (fauteuils, matelas, moquettes, marbre, fin de chantier, baies vitrées, intérieur auto) et hygiène 3D/4D (dératisation, désinsectisation, désinfection, désodorisation) à Daloa et partout en Côte d’Ivoire."
        path="/nettoyage-professionnel"
      />
      <ServiceHero
        eyebrow="Nettoyage industriel & Hygiène 3D / 4D"
        title="Redonnez éclat et salubrité à vos maisons, véhicules et locaux professionnels"
        description="Spécialisée dans le nettoyage industriel professionnel ainsi que dans la dératisation, la désinsectisation, la désinfection et la désodorisation à domicile et en entreprise — à Daloa et partout en Côte d’Ivoire."
        image="/images/nettoyage.jpg"
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="green">À Daloa & partout en Côte d’Ivoire</Badge>
              <Badge tone="gold">Coût compétitif · Devis rapide</Badge>
            </div>

            <SectionHeading
              className="mt-4"
              eyebrow="Nos 12 solutions de nettoyage industriel"
              title="Un service complet pour redonner éclat à tous vos espaces"
              description={
                service?.description ??
                'Redonnez un éclat à vos fauteuils, matelas, moquettes, véhicules, maisons et locaux professionnels grâce à nos équipes spécialisées.'
              }
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {SOLUTIONS_NETTOYAGE.map((item, idx) => (
                <div key={item.title} className="card flex gap-3.5 p-5 transition hover:border-azure-200 hover:shadow-card">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-xs font-bold text-gold-300">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold leading-snug text-navy-900">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-navy-600">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pôle Hygiène 3D / Lutte anti-nuisibles */}
            <div className="mt-12 rounded-3xl bg-navy-950 p-6 text-white sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-azure-300">
                Pôle spécialisé · Hygiène 3D & 4D
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Dératisation, désinsectisation, désinfection & désodorisation
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-navy-200">
                Nous proposons des solutions modernes à domicile comme dans les établissements professionnels pour
                lutter efficacement contre tous types de nuisibles et d’agents pathogènes, afin d’assurer une protection
                optimale de votre résidence ou de votre établissement.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {NUISIBLES.map((group) => (
                  <div key={group.category} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <h3 className="text-sm font-semibold text-gold-300">{group.category}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-navy-200">{group.items}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-azure-300">
                  Établissements & lieux pris en charge
                </p>
                <ul className="mt-3 grid gap-2 text-xs text-navy-100 sm:grid-cols-2">
                  {LIEUX_INTERVENTION.map((lieu) => (
                    <li key={lieu.trim()} className="flex items-center gap-2">
                      <Icon name="check" className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{lieu.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {wa ? (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-xs font-bold text-white transition hover:brightness-105"
                  >
                    WhatsApp : 07 49 63 47 26
                  </a>
                ) : null}
                <a
                  href={telHref(phoneSercom)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  <Icon name="phone" className="h-3.5 w-3.5" />
                  Sercom : {phoneSercom}
                </a>
                <a
                  href={telHref(phoneBureau)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  <Icon name="phone" className="h-3.5 w-3.5" />
                  Bureau : {phoneBureau}
                </a>
              </div>
            </div>

            <Alert tone="info" className="mt-8" title="Produits utilisés et consignes d’intervention">
              L’entreprise utilise des produits professionnels adaptés au traitement des surfaces, textiles et nuisibles,
              sélectionnés pour préserver les occupants dans le respect des précautions d’usage communiquées avant et
              après chaque passage. Le protocole exact, le délai de réentrée éventuel et le tarif sont précisés dans le
              devis avant intervention.
            </Alert>

            <div className="mt-8 rounded-2xl border border-navy-100 bg-navy-50 p-5">
              <h3 className="text-sm font-semibold text-navy-900">Ce qui nous aide à chiffrer rapidement</h3>
              <ul className="mt-3 grid gap-2 text-sm text-navy-700 sm:grid-cols-2">
                {[
                  'Nature de la prestation (nettoyage ou traitement 3D)',
                  'Type de lieu (maison, bureau, magasin, restaurant, entrepôt, auto…)',
                  'Ville / quartier (Daloa ou autre localité en Côte d’Ivoire)',
                  'Surface ou nombre d’éléments (fauteuils, matelas, pièces)',
                  'Fréquence souhaitée (intervention unique ou abonnement)',
                  'Date et horaires souhaités',
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
            <ServiceAside title="Devis nettoyage ou hygiène 3D" />
          </div>
        </div>
      </Section>

      <Section tone="muted" id="devis">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Demande de devis"
              title="Décrivez votre besoin de nettoyage ou de traitement anti-nuisibles"
              description="Indiquez la prestation souhaitée et votre localisation (à Daloa ou partout en Côte d’Ivoire) : notre équipe vous recontacte rapidement avec une proposition chiffrée."
            />
            <div className="mt-6 flex flex-wrap gap-2">
              <Link to="/services" className="btn-outline !py-2 text-xs">
                Voir tous nos autres services
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7">
            <CleaningForm />
          </div>
        </div>
      </Section>
    </>
  )
}
