import type { ProjectDTO, PublicSiteData, ServiceDTO, SiteSettings } from './types'

/**
 * Route dédiée pour les 6 pôles principaux (évite une redirection client inutile),
 * ou `/services/:slug` pour toute autre activité publiée depuis l'administration.
 */
export function servicePath(slug: string): string {
  switch (slug) {
    case 'amenagement-foncier':
      return '/amenagement-foncier'
    case 'btp-construction':
      return '/btp-construction'
    case 'topographie':
      return '/topographie'
    case 'immobilier-terrains':
      return '/immobilier'
    case 'conseils-formation':
      return '/formation'
    case 'nettoyage-professionnel':
      return '/nettoyage-professionnel'
    default:
      return `/services/${slug}`
  }
}

export const DEFAULT_SETTINGS: SiteSettings = {
  company_name: 'BRILLE GROUP SARL',
  company_short_name: 'BRILLE GROUP',
  tagline: "Let's shine together",
  legal_form: 'SARL',
  phone_primary: '+225 27 24 57 11 86',
  phone_secondary: '+225 07 49 63 47 26',
  phone_third: '+225 05 00 49 24 24',
  whatsapp_number: '+225 07 49 63 47 26',
  whatsapp_enabled: true,
  email_primary: 'contactbrillegroup@gmail.com',
  address_line: 'Tazibouo, région de Daloa',
  city: 'Daloa',
  region: 'Haut-Sassandra',
  country: 'Côte d’Ivoire',
  intervention_area:
    'Implantée à Daloa (quartier Tazibouo, Haut-Sassandra) — intervention à Daloa et partout en Côte d’Ivoire.',
  opening_hours: '',
  facebook_url: 'https://web.facebook.com/Brille-Group-Sarl-151826211353649/',
  linkedin_url: '',
  instagram_url: '',
  tiktok_url: '',
  website_url: 'https://brille-group.vercel.app',
  legal_rcm: 'RCCM n° CI-ABJ-03-2023-B13-07234 du 03/07/2023 — Tribunal du Commerce d’Abidjan',
  legal_cc: '',
  legal_text:
    'Les informations publiées sur ce site sont fournies à titre indicatif et peuvent évoluer. Toute prestation fait l’objet d’un devis et d’un contrat écrits.',
  about_intro:
    'BRILLE GROUP SARL est une entreprise ivoirienne multiservices implantée à Daloa (Tazibouo) qui intervient partout en Côte d’Ivoire : aménagement foncier, construction de bâtiments et BTP, topographie, immobilier et vente de terrains, conseils, formation, ainsi que nettoyage industriel professionnel, dératisation, désinsectisation et désinfection.',
  about_mission:
    'Offrir à ses clients un interlocuteur unique, capable de coordonner plusieurs métiers autour d’un même projet, avec méthode, transparence et redevabilité.',
  about_vision:
    'Devenir une référence nationale du conseil et des services intégrés, en associant qualité d’exécution, réactivité et fiabilité de la relation client.',
  values_json: [
    { title: 'Excellence', text: 'Viser un travail soigné et conforme à ce qui a été convenu.' },
    { title: 'Intégrité', text: 'Communiquer clairement sur les prix, les délais et les limites de chaque prestation.' },
    { title: 'Redevabilité', text: 'Répondre de ses engagements et rendre compte de l’avancement des travaux.' },
  ],
  seo_default_title:
    'BRILLE GROUP SARL — Aménagement foncier, BTP, topographie, immobilier & nettoyage 3D à Daloa',
  seo_default_description:
    'Entreprise multiservices à Daloa (Tazibouo) intervenant partout en Côte d’Ivoire : aménagement foncier, construction de bâtiments et BTP, topographie, vente de terrains, conseils, formation, nettoyage industriel professionnel, dératisation, désinsectisation et désinfection.',
  hero_title: 'Construire, aménager, assainir et valoriser vos projets partout en Côte d’Ivoire.',
  hero_subtitle:
    'Implantée à Daloa (Tazibouo), BRILLE GROUP SARL réunit aménagement foncier, construction de bâtiments et BTP, topographie, immobilier et vente de terrains, conseils, formation, nettoyage industriel professionnel et hygiène 3D (dératisation, désinsectisation, désinfection).',
  foncier_warning:
    'Les informations relatives aux terrains, titres, limites, droits fonciers et documents administratifs affichées sur ce site sont indicatives. Elles doivent être vérifiées auprès des services compétents et faire l’objet d’un contrôle juridique avant toute transaction. La publication d’une annonce ne constitue ni une garantie de propriété, ni un acte de vente.',
  maintenance_mode: false,
}

export const DEFAULT_SERVICES: ServiceDTO[] = [
  {
    id: 'default-amenagement-foncier',
    slug: 'amenagement-foncier',
    title: 'Aménagement foncier & rural',
    category: 'metier',
    shortDescription: 'Préparation, structuration, ouverture d’accès et valorisation de terrains urbains et ruraux.',
    description:
      'Entreprise d’aménagement foncier implantée à Daloa et intervenant partout en Côte d’Ivoire, BRILLE GROUP SARL accompagne les propriétaires fonciers, collectivités et porteurs de projets dans la préparation, l’organisation parcellaire, l’ouverture d’accès et la mise en valeur de leurs terrains. Chaque intervention débute par une analyse du besoin, un repérage sur site et un devis écrit détaillé.',
    bullets: [
      'Étude du besoin et visite du site',
      'Organisation et structuration des parcelles',
      'Ouverture des voies d’accès et viabilisation',
      'Mise en valeur d’espaces urbains et ruraux',
    ],
    imageUrl: '/images/amenagement-foncier.jpg',
    icon: 'map',
    sortOrder: 1,
    isCore: true,
    isPublished: true,
  },
  {
    id: 'default-btp-construction',
    slug: 'btp-construction',
    title: 'Construction de bâtiments — BTP',
    category: 'metier',
    shortDescription:
      'Construction de cités résidentielles, villas, studios, locaux professionnels et suivi de chantier.',
    description:
      'BRILLE GROUP SARL réalise vos projets de construction de bâtiments et de BTP à Daloa et partout en Côte d’Ivoire : maisons individuelles, cités résidentielles (logements de 2 et 3 pièces, studios), locaux professionnels, gros œuvre, rénovation et réhabilitation. Référence réalisée : construction d’une cité comprenant 2 logements de 3 pièces, 1 logement de 2 pièces et 6 studios.',
    bullets: [
      'Construction de bâtiments et cités résidentielles (2 pièces, 3 pièces, studios)',
      'Travaux de bâtiment, gros œuvre et second œuvre',
      'Rénovation, extension et réhabilitation',
      'Devis détaillé, coordination et suivi complet de chantier',
    ],
    imageUrl: '/images/btp-construction.jpg',
    icon: 'building',
    sortOrder: 2,
    isCore: true,
    isPublished: true,
  },
  {
    id: 'default-topographie',
    slug: 'topographie',
    title: 'Topographie',
    category: 'metier',
    shortDescription:
      'Relevés topographiques, plans de terrain, implantation d’ouvrages et coordination avec les professionnels habilités.',
    description:
      'La topographie fournit les données géométriques indispensables à la conception, à la sécurisation et à l’implantation de vos projets fonciers et immobiliers. BRILLE GROUP SARL organise vos relevés, plans et implantations à Daloa et partout en Côte d’Ivoire, en coordination avec des professionnels habilités pour les opérations foncières réglementées.',
    bullets: [
      'Relevés topographiques et plans de terrain',
      'Implantation de bâtiments et de lotissements',
      'Documents graphiques pour dossiers techniques',
      'Prestations réglementées réalisées par des professionnels habilités',
    ],
    imageUrl: '/images/topographie.jpg',
    icon: 'compass',
    sortOrder: 3,
    isCore: true,
    isPublished: true,
  },
  {
    id: 'default-immobilier-terrains',
    slug: 'immobilier-terrains',
    title: 'Immobilier & vente de terrains',
    category: 'metier',
    shortDescription: 'Vente de terrains, biens immobiliers, visites sur rendez-vous et accompagnement transparent.',
    description:
      'BRILLE GROUP SARL propose la vente de terrains et de biens immobiliers à Daloa et en Côte d’Ivoire, avec une information transparente sur la localisation, la superficie, le prix et la disponibilité. La vérification préalable des documents fonciers auprès des autorités compétentes est systématiquement rappelée avant toute transaction.',
    bullets: [
      'Vente de terrains urbains et ruraux',
      'Biens immobiliers et logements',
      'Visites sur rendez-vous et accompagnement à l’acquisition',
      'Vérification préalable indispensable des documents fonciers',
    ],
    imageUrl: '/images/immobilier.jpg',
    icon: 'home',
    sortOrder: 4,
    isCore: true,
    isPublished: true,
  },
  {
    id: 'default-conseils-formation',
    slug: 'conseils-formation',
    title: 'Conseils & formation',
    category: 'metier',
    shortDescription: 'Conseil opérationnel aux porteurs de projets et formations professionnelles adaptées.',
    description:
      'BRILLE GROUP SARL accompagne les particuliers, entrepreneurs et organisations dans l’étude et la structuration de leurs projets, et propose des sessions de formation professionnelle adaptées aux besoins exprimés.',
    bullets: [
      'Conseil et accompagnement des porteurs de projets',
      'Formations professionnelles sur demande',
      'Appui organisationnel aux équipes et entreprises',
      'Interventions à Daloa et partout en Côte d’Ivoire',
    ],
    imageUrl: '/images/conseils-formation.jpg',
    icon: 'graduation',
    sortOrder: 5,
    isCore: true,
    isPublished: true,
  },
  {
    id: 'default-nettoyage-professionnel',
    slug: 'nettoyage-professionnel',
    title: 'Nettoyage professionnel & Hygiène 3D',
    category: 'metier',
    shortDescription:
      'Nettoyage industriel (fauteuils, matelas, marbre, vitres, fin de chantier, auto) et lutte anti-nuisibles : dératisation, désinsectisation, désinfection.',
    description:
      'Spécialisée dans le nettoyage industriel professionnel ainsi que dans la dératisation, la désinsectisation, la désinfection et la désodorisation à domicile et dans les établissements professionnels (bureaux, magasins, restaurants, supermarchés, grandes surfaces, entrepôts), BRILLE GROUP SARL intervient à Daloa et partout en Côte d’Ivoire à coût compétitif.',
    bullets: [
      'Nettoyage & désinfection de fauteuils, matelas, moquettes et tapis',
      'Fin de chantier, avant aménagement, après rénovation, façades, plafonds & baies vitrées',
      'Nettoyage & ponçage du marbre, intérieur de voiture',
      'Dératisation, désinsectisation, désinfection & désodorisation (rats, souris, cafards, punaises de lit, moustiques…)',
    ],
    imageUrl: '/images/nettoyage.jpg',
    icon: 'sparkles',
    sortOrder: 6,
    isCore: true,
    isPublished: true,
  },
  {
    id: 'default-agriculture',
    slug: 'agriculture',
    title: 'Agriculture',
    category: 'complementaire',
    shortDescription: 'Activités agricoles et valorisation de terres à usage agricole.',
    description:
      'Activité citée par l’entreprise. Le détail des prestations (production, conseil agricole, valorisation de parcelles) est précisé sur demande auprès de BRILLE GROUP SARL.',
    bullets: [],
    imageUrl: '/images/agriculture.jpg',
    icon: 'leaf',
    sortOrder: 7,
    isCore: false,
    isPublished: true,
  },
  {
    id: 'default-ntic',
    slug: 'ntic',
    title: 'NTIC',
    category: 'complementaire',
    shortDescription: 'Services liés aux technologies de l’information et de la communication.',
    description:
      'Activité citée par l’entreprise. Le périmètre exact des prestations numériques est précisé sur demande auprès de BRILLE GROUP SARL.',
    bullets: [],
    imageUrl: '/images/ntic.jpg',
    icon: 'monitor',
    sortOrder: 8,
    isCore: false,
    isPublished: true,
  },
  {
    id: 'default-monetique',
    slug: 'monetique',
    title: 'Monétique',
    category: 'complementaire',
    shortDescription: 'Solutions et services de monétique.',
    description:
      'Activité citée par l’entreprise. Le détail des solutions proposées est précisé sur demande auprès de BRILLE GROUP SARL.',
    bullets: [],
    imageUrl: '/images/monetique.jpg',
    icon: 'card',
    sortOrder: 9,
    isCore: false,
    isPublished: true,
  },
  {
    id: 'default-transport',
    slug: 'transport',
    title: 'Transport',
    category: 'complementaire',
    shortDescription: 'Prestations de transport et de logistique.',
    description:
      'Activité citée par l’entreprise. Les modalités (véhicules, zones desservies, conditions) sont précisées sur demande auprès de BRILLE GROUP SARL.',
    bullets: [],
    imageUrl: '/images/transport.jpg',
    icon: 'truck',
    sortOrder: 10,
    isCore: false,
    isPublished: true,
  },
  {
    id: 'default-mode-beaute',
    slug: 'mode-beaute',
    title: 'Mode & beauté',
    category: 'complementaire',
    shortDescription: 'Activités liées à la mode et aux prestations de beauté.',
    description:
      'Activité citée par l’entreprise. Le détail des prestations est précisé sur demande auprès de BRILLE GROUP SARL.',
    bullets: [],
    imageUrl: '/images/mode-beaute.jpg',
    icon: 'scissors',
    sortOrder: 11,
    isCore: false,
    isPublished: true,
  },
]

export const DEFAULT_PROJECTS: ProjectDTO[] = [
  {
    id: 'default-cite-residentielle',
    title: 'Construction d’une cité résidentielle : 2×3 pièces, 1×2 pièces et 6 studios',
    category: 'construction',
    description:
      'Réalisation d’un ensemble résidentiel complet comprenant 2 logements de 3 pièces, 1 logement de 2 pièces et 6 studios (9 logements au total). Contacts directs pour références et informations : Bureau +225 27 24 57 11 86 · Sercom +225 05 00 49 24 24 · WhatsApp +225 07 49 63 47 26.',
    location: 'Côte d’Ivoire',
    period: '',
    coverImage: null,
    images: [],
    sortOrder: 1,
    isPublished: true,
  },
]

export const DEFAULT_SITE_DATA: PublicSiteData = {
  settings: DEFAULT_SETTINGS,
  services: DEFAULT_SERVICES,
  capabilities: {
    hasProperties: false,
    hasProjects: true,
    hasCourses: false,
    whatsappConfigured: true,
  },
}
