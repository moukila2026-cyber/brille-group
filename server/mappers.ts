/**
 * Conversion des lignes PostgreSQL (snake_case) vers les DTO (camelCase)
 * consommés par le front.
 */
import type {
  CourseDTO,
  PropertyDTO,
  ProjectDTO,
  QuoteDTO,
  ServiceDTO,
  ContactMessageDTO,
  RegistrationDTO,
  AdminUserDTO,
} from '../src/lib/types.js'

type Row = Record<string, unknown>

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)
const num = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v))
const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : [])
const iso = (v: unknown): string => (v instanceof Date ? v.toISOString() : String(v ?? ''))

export function toService(row: Row): ServiceDTO {
  return {
    id: String(row.id),
    slug: str(row.slug),
    title: str(row.title),
    category: str(row.category, 'metier') as ServiceDTO['category'],
    shortDescription: str(row.short_description),
    description: str(row.description),
    bullets: arr(row.bullets),
    imageUrl: (row.image_url as string | null) ?? null,
    icon: str(row.icon, 'building'),
    sortOrder: Number(row.sort_order ?? 0),
    isCore: Boolean(row.is_core),
    isPublished: Boolean(row.is_published),
  }
}

export function toProperty(row: Row): PropertyDTO {
  return {
    id: String(row.id),
    reference: str(row.reference),
    title: str(row.title),
    propertyType: str(row.property_type, 'terrain') as PropertyDTO['propertyType'],
    location: str(row.location),
    areaSqm: num(row.area_sqm),
    priceFcfa: num(row.price_fcfa),
    description: str(row.description),
    images: arr(row.images),
    status: str(row.status, 'disponible') as PropertyDTO['status'],
    extraInfo: str(row.extra_info),
    isPublished: Boolean(row.is_published),
    createdAt: row.created_at ? iso(row.created_at) : undefined,
  }
}

export function toProject(row: Row): ProjectDTO {
  return {
    id: String(row.id),
    title: str(row.title),
    category: str(row.category, 'construction') as ProjectDTO['category'],
    description: str(row.description),
    location: str(row.location),
    period: str(row.period),
    coverImage: (row.cover_image as string | null) ?? null,
    images: arr(row.images),
    sortOrder: Number(row.sort_order ?? 0),
    isPublished: Boolean(row.is_published),
  }
}

export function toCourse(row: Row): CourseDTO {
  return {
    id: String(row.id),
    title: str(row.title),
    objective: str(row.objective),
    audience: str(row.audience),
    duration: str(row.duration),
    modalities: str(row.modalities),
    priceText: str(row.price_text),
    sortOrder: Number(row.sort_order ?? 0),
    isPublished: Boolean(row.is_published),
  }
}

export function toQuote(row: Row): QuoteDTO {
  return {
    id: String(row.id),
    reference: str(row.reference),
    fullName: str(row.full_name),
    phone: str(row.phone),
    email: (row.email as string | null) ?? null,
    serviceType: str(row.service_type),
    location: str(row.location),
    budget: str(row.budget),
    timeline: str(row.timeline),
    description: str(row.description),
    sourcePage: str(row.source_page),
    status: str(row.status, 'nouvelle') as QuoteDTO['status'],
    internalNotes: str(row.internal_notes),
    assignedTo: (row.assigned_to as string | null) ?? null,
    assignedName: (row.assigned_name as string | null) ?? null,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  }
}

export function toContactMessage(row: Row): ContactMessageDTO {
  return {
    id: String(row.id),
    name: str(row.name),
    phone: str(row.phone),
    email: (row.email as string | null) ?? null,
    subject: str(row.subject),
    message: str(row.message),
    status: str(row.status, 'nouveau') as ContactMessageDTO['status'],
    createdAt: iso(row.created_at),
  }
}

export function toRegistration(row: Row): RegistrationDTO {
  return {
    id: String(row.id),
    courseId: (row.course_id as string | null) ?? null,
    courseTitle: str(row.course_title),
    fullName: str(row.full_name),
    phone: str(row.phone),
    email: (row.email as string | null) ?? null,
    message: str(row.message),
    status: str(row.status, 'nouvelle') as RegistrationDTO['status'],
    createdAt: iso(row.created_at),
  }
}

export function toAdminUser(row: Row): AdminUserDTO {
  return {
    id: String(row.id),
    email: str(row.email),
    fullName: str(row.full_name),
    role: str(row.role, 'admin') as AdminUserDTO['role'],
    isActive: Boolean(row.is_active),
    lastLoginAt: row.last_login_at ? iso(row.last_login_at) : null,
  }
}
