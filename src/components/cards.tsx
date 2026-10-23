import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { Badge } from './ui'
import { cn, formatArea, formatFcfa } from '../lib/format'
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  type PropertyDTO,
  type ProjectDTO,
  type ServiceDTO,
} from '../lib/types'

/** Image avec repli élégant si le fichier est absent. */
function SmartImage({
  src,
  alt,
  className,
  icon = 'building',
}: {
  src?: string | null
  alt: string
  className?: string
  icon?: string
}) {
  if (!src) {
    return (
      <div className={cn('flex items-center justify-center bg-navy-900 text-gold-300', className)} aria-hidden="true">
        <Icon name={icon} className="h-10 w-10" />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn('object-cover', className)}
      onError={(event) => {
        const target = event.currentTarget
        target.style.display = 'none'
        const parent = target.parentElement
        if (parent) {
          parent.classList.add('flex', 'items-center', 'justify-center', 'bg-navy-900', 'text-gold-300')
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
          svg.setAttribute('viewBox', '0 0 24 24')
          svg.setAttribute('class', 'h-10 w-10')
          svg.setAttribute('fill', 'none')
          svg.setAttribute('stroke', 'currentColor')
          svg.setAttribute('stroke-width', '1.6')
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
          path.setAttribute('d', 'M4 21V6a2 2 0 012-2h6a2 2 0 012 2v15M14 21V10h4a2 2 0 012 2v9M3 21h18')
          svg.appendChild(path)
          parent.appendChild(svg)
        }
      }}
    />
  )
}

export function ServiceCard({ service, index }: { service: ServiceDTO; index?: number }) {
  return (
    <article className="group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative h-44 overflow-hidden bg-navy-100">
        <SmartImage
          src={service.imageUrl}
          alt={`Illustration : ${service.title} — BRILLE GROUP SARL`}
          className="h-44 w-full transition duration-500 group-hover:scale-[1.03]"
          icon={service.icon}
        />
        <span className="absolute left-3 top-3 rounded-full bg-navy-950/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          {typeof index === 'number' ? String(index + 1).padStart(2, '0') : 'Service'}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-2 text-gold-600">
          <Icon name={service.icon} className="h-5 w-5" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Domaine d’activité</span>
        </div>
        <h3 className="text-lg font-semibold leading-snug">{service.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600">{service.shortDescription}</p>
        <Link
          to={`/services/${service.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 transition hover:text-gold-700"
        >
          En savoir plus
          <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  )
}

export function PropertyCard({ property }: { property: PropertyDTO }) {
  const statusTone = property.status === 'disponible' ? 'green' : property.status === 'reserve' ? 'gold' : 'muted'
  return (
    <article className="card group flex h-full flex-col overflow-hidden transition hover:shadow-lift">
      <Link to={`/immobilier/${property.id}`} className="relative block h-48 overflow-hidden bg-navy-100">
        <SmartImage
          src={property.images[0]}
          alt={property.title}
          className="h-48 w-full transition duration-500 group-hover:scale-[1.03]"
          icon="home"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge tone={statusTone}>{PROPERTY_STATUS_LABELS[property.status]}</Badge>
          <Badge tone="white">{PROPERTY_TYPE_LABELS[property.propertyType]}</Badge>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-400">{property.reference}</p>
        <h3 className="mt-1 text-base font-semibold leading-snug">
          <Link to={`/immobilier/${property.id}`} className="hover:text-gold-700">
            {property.title}
          </Link>
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-navy-500">
          <Icon name="pin" className="h-4 w-4 shrink-0" />
          {property.location || 'Localisation à préciser'}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-semibold text-navy-900">{formatFcfa(property.priceFcfa)}</span>
          <span className="text-navy-500">{formatArea(property.areaSqm)}</span>
        </div>
        <Link to={`/immobilier/${property.id}`} className="btn-outline mt-4 w-full !py-2.5 text-[13px]">
          Demander des informations
        </Link>
      </div>
    </article>
  )
}

export function ProjectCard({ project }: { project: ProjectDTO }) {
  return (
    <article className="card group overflow-hidden">
      <div className="relative h-56 overflow-hidden bg-navy-100">
        <SmartImage
          src={project.coverImage ?? project.images[0]}
          alt={project.title}
          className="h-56 w-full transition duration-500 group-hover:scale-[1.03]"
          icon="building"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/85 to-transparent p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-300">
            {project.category.replace('_', ' ')}
          </p>
          <h3 className="mt-1 text-base font-semibold text-white">{project.title}</h3>
        </div>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-500">
          {project.location ? <span>{project.location}</span> : null}
          {project.period ? <span>{project.period}</span> : null}
        </div>
        {project.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-navy-600">{project.description}</p>
        ) : null}
      </div>
    </article>
  )
}
