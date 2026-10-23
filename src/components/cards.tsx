import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { Badge } from './ui'
import { servicePath } from '../lib/default-site-data'
import { cn, formatArea, formatFcfa } from '../lib/format'
import {
  PROJECT_CATEGORY_LABELS,
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
  const to = servicePath(service.slug)

  return (
    <article className="group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <Link to={to} className="relative block h-44 overflow-hidden bg-navy-100">
        <SmartImage
          src={service.imageUrl}
          alt={`Illustration : ${service.title} — BRILLE GROUP SARL`}
          className="h-44 w-full transition duration-500 group-hover:scale-[1.03]"
          icon={service.icon}
        />
        <span className="absolute left-3 top-3 rounded-full bg-navy-950/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          {typeof index === 'number' ? String(index + 1).padStart(2, '0') : 'Service'}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-2 text-gold-600">
          <Icon name={service.icon} className="h-5 w-5" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Domaine d’activité</span>
        </div>
        <h3 className="text-lg font-semibold leading-snug">
          <Link to={to} className="transition hover:text-azure-700">
            {service.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-navy-600">{service.shortDescription}</p>
        {service.bullets.length > 0 ? (
          <ul className="mt-4 space-y-1.5 border-t border-navy-100 pt-3.5 text-xs text-navy-700">
            {service.bullets.slice(0, 4).map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-auto pt-5">
          <Link
            to={to}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 transition hover:text-gold-700"
          >
            Découvrir les prestations
            <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
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
  const realPhoto = project.coverImage ?? project.images[0] ?? null
  const categoryLabel = PROJECT_CATEGORY_LABELS[project.category] ?? project.category.replace('_', ' ')

  return (
    <article className="card group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      {realPhoto ? (
        <div className="relative h-56 overflow-hidden bg-navy-100">
          <SmartImage
            src={realPhoto}
            alt={project.title}
            className="h-56 w-full transition duration-500 group-hover:scale-[1.03]"
            icon="building"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 to-transparent p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-300">{categoryLabel}</p>
            <h3 className="mt-1 text-base font-semibold leading-snug text-white">{project.title}</h3>
          </div>
        </div>
      ) : (
        <div className="relative flex min-h-[210px] flex-col justify-between overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-6 text-white">
          <div className="absolute inset-0 bg-grid opacity-40" aria-hidden="true" />
          <div className="relative flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-200">
              <Icon name="check" className="h-3.5 w-3.5" />
              Projet réalisé · {categoryLabel}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-azure-300">
              <Icon name="building" className="h-5 w-5" />
            </span>
          </div>
          <div className="relative mt-6">
            <h3 className="text-lg font-bold leading-snug text-white">{project.title}</h3>
            <p className="mt-2 text-[11px] text-navy-300">
              Photographies de chantier sur demande (aucune illustration fictive affichée).
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-navy-500">
          {project.location ? (
            <span className="inline-flex items-center gap-1">
              <Icon name="pin" className="h-3.5 w-3.5 text-azure-600" />
              {project.location}
            </span>
          ) : null}
          {project.period ? <span>{project.period}</span> : null}
        </div>
        {project.description ? (
          <p className="mt-2.5 flex-1 text-sm leading-relaxed text-navy-600">{project.description}</p>
        ) : null}
        <Link to="/devis?service=construction_btp" className="btn-outline mt-4 w-full !py-2.5 text-[13px]">
          Confier un projet similaire
        </Link>
      </div>
    </article>
  )
}
