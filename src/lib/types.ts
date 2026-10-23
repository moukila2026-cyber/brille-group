/**
 * Types partagés entre l'API (server/) et le front (src/).
 * Ce fichier ne contient que des types : il est effacé à la compilation.
 */

export type ServiceCategory = 'metier' | 'complementaire'

export interface ServiceDTO {
  id: string
  slug: string
  title: string
  category: ServiceCategory
  shortDescription: string
  description: string
  bullets: string[]
  imageUrl: string | null
  icon: string
  sortOrder: number
  isCore: boolean
  isPublished: boolean
}

export type PropertyStatus = 'disponible' | 'reserve' | 'vendu'
export type PropertyType = 'terrain' | 'maison' | 'appartement' | 'local_commercial' | 'autre'

export interface PropertyDTO {
  id: string
  reference: string
  title: string
  propertyType: PropertyType
  location: string
  areaSqm: number | null
  priceFcfa: number | null
  description: string
  images: string[]
  status: PropertyStatus
  extraInfo: string
  isPublished: boolean
  createdAt?: string
}

export type ProjectCategory =
  | 'construction'
  | 'amenagement_foncier'
  | 'topographie'
  | 'immobilier'
  | 'nettoyage'
  | 'autre'

export interface ProjectDTO {
  id: string
  title: string
  category: ProjectCategory
  description: string
  location: string
  period: string
  coverImage: string | null
  images: string[]
  sortOrder: number
  isPublished: boolean
}

export interface CourseDTO {
  id: string
  title: string
  objective: string
  audience: string
  duration: string
  modalities: string
  priceText: string
  sortOrder: number
  isPublished: boolean
}

export type QuoteStatus =
  | 'nouvelle'
  | 'a_contacter'
  | 'en_discussion'
  | 'devis_envoye'
  | 'acceptee'
  | 'terminee'
  | 'sans_suite'

export interface QuoteDTO {
  id: string
  reference: string
  fullName: string
  phone: string
  email: string | null
  serviceType: string
  location: string
  budget: string
  timeline: string
  description: string
  sourcePage: string
  status: QuoteStatus
  internalNotes: string
  assignedTo: string | null
  assignedName?: string | null
  createdAt: string
  updatedAt: string
}

export interface ContactMessageDTO {
  id: string
  name: string
  phone: string
  email: string | null
  subject: string
  message: string
  status: 'nouveau' | 'lu' | 'traite'
  createdAt: string
}

export interface RegistrationDTO {
  id: string
  courseId: string | null
  courseTitle: string
  fullName: string
  phone: string
  email: string | null
  message: string
  status: 'nouvelle' | 'a_contacter' | 'inscrit' | 'sans_suite'
  createdAt: string
}

export interface AdminUserDTO {
  id: string
  email: string
  fullName: string
  role: 'admin' | 'superadmin'
  isActive: boolean
  lastLoginAt: string | null
}

export type SiteSettings = Record<string, string | number | boolean | unknown>

export interface PublicSiteData {
  settings: SiteSettings
  services: ServiceDTO[]
  capabilities: {
    hasProperties: boolean
    hasProjects: boolean
    hasCourses: boolean
    whatsappConfigured: boolean
  }
}

export interface StatsDTO {
  quotes: { total: number; nouvelle: number; enCours: number; traitees: number }
  messages: { total: number; nouveau: number }
  registrations: { total: number; nouvelle: number }
  properties: { total: number; publiees: number; disponibles: number }
  projects: { total: number; publies: number }
  courses: { total: number; publiees: number }
  services: { total: number; publies: number }
  recentQuotes: QuoteDTO[]
}

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  amenagement_foncier: 'Aménagement foncier',
  construction_btp: 'Construction / BTP',
  topographie: 'Topographie',
  immobilier_terrain: 'Immobilier / terrain',
  conseils: 'Conseils',
  formation: 'Formation',
  nettoyage: 'Nettoyage professionnel',
  autre: 'Autre',
}

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  nouvelle: 'Nouvelle',
  a_contacter: 'À contacter',
  en_discussion: 'En discussion',
  devis_envoye: 'Devis envoyé',
  acceptee: 'Acceptée',
  terminee: 'Terminée',
  sans_suite: 'Sans suite',
}

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  disponible: 'Disponible',
  reserve: 'Réservé',
  vendu: 'Vendu',
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  terrain: 'Terrain',
  maison: 'Maison',
  appartement: 'Appartement',
  local_commercial: 'Local commercial',
  autre: 'Autre',
}

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  construction: 'Construction',
  amenagement_foncier: 'Aménagement foncier',
  topographie: 'Topographie',
  immobilier: 'Immobilier',
  nettoyage: 'Nettoyage',
  autre: 'Autres projets',
}
