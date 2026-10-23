import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Icon } from '../components/Icon'
import { ProjectCard } from '../components/cards'
import { EmptyState, PageHero, Section, SectionHeading, Spinner } from '../components/ui'
import { DEFAULT_PROJECTS } from '../lib/default-site-data'
import { useApiQuery } from '../lib/hooks'
import { useSite } from '../lib/site-context'
import { PROJECT_CATEGORY_LABELS, type ProjectCategory, type ProjectDTO } from '../lib/types'
import { cn, whatsappHref } from '../lib/format'

const FILTERS: Array<{ value: ProjectCategory | 'tous'; label: string }> = [
  { value: 'tous', label: 'Tous les projets' },
  { value: 'construction', label: PROJECT_CATEGORY_LABELS.construction },
  { value: 'amenagement_foncier', label: PROJECT_CATEGORY_LABELS.amenagement_foncier },
  { value: 'topographie', label: PROJECT_CATEGORY_LABELS.topographie },
  { value: 'immobilier', label: PROJECT_CATEGORY_LABELS.immobilier },
  { value: 'nettoyage', label: PROJECT_CATEGORY_LABELS.nettoyage },
  { value: 'autre', label: PROJECT_CATEGORY_LABELS.autre },
]

export default function Realisations() {
  const [filter, setFilter] = useState<ProjectCategory | 'tous'>('tous')
  const { data, loading } = useApiQuery<{ projects: ProjectDTO[] }>('/api/public/projects')
  const { capabilities, settings } = useSite()

  const baseList = useMemo(() => {
    if (data && data.projects.length > 0) return data.projects
    return capabilities.hasProjects ? DEFAULT_PROJECTS : []
  }, [data, capabilities.hasProjects])

  const projects = useMemo(() => {
    return filter === 'tous' ? baseList : baseList.filter((project) => project.category === filter)
  }, [baseList, filter])

  const wa = whatsappHref(
    typeof settings.whatsapp_number === 'string' ? settings.whatsapp_number : '',
    'Bonjour BRILLE GROUP, je souhaite échanger au sujet d’un projet de construction.',
  )

  return (
    <>
      <Seo
        title="Nos réalisations et projets — BRILLE GROUP SARL"
        description="Projets déjà réalisés par BRILLE GROUP SARL en Côte d’Ivoire : construction d’une cité résidentielle (2×3 pièces, 1×2 pièces et 6 studios) et chantiers BTP."
        path="/realisations"
      />
      <PageHero
        logo
        eyebrow="Nos réalisations"
        title="Nos projets déjà réalisés"
        description="Cette page présente uniquement les réalisations réellement exécutées et confirmées par BRILLE GROUP SARL. Aucune image d’illustration n’est présentée comme photographie de chantier."
        image="/images/btp-construction.jpg"
      >
        <Link to="/devis" className="btn-gold">
          Parler de mon projet
        </Link>
        {wa && capabilities.whatsappConfigured ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-ghost-light">
            WhatsApp · 07 49 63 47 26
          </a>
        ) : null}
      </PageHero>

      <Section>
        <SectionHeading
          eyebrow="Références"
          title="Filtrer par domaine"
          description="Sélectionnez une catégorie pour afficher les réalisations correspondantes."
        />

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filtrer les réalisations par catégorie">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition',
                filter === item.value
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-navy-200 bg-white text-navy-700 hover:border-navy-300',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {loading && baseList.length === 0 ? (
            <div className="flex justify-center py-16 text-navy-400">
              <Spinner />
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              title="Aucun projet publié dans cette catégorie"
              description="Aucune réalisation publiée ne correspond à ce filtre pour le moment. Consultez « Tous les projets » ou « Construction » pour voir nos réalisations publiées."
              action={{ label: 'Demander des références', to: '/contact' }}
              icon={<Icon name="building" className="h-7 w-7" />}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section tone="muted" className="!py-14">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Votre projet pourrait être le prochain</h2>
            <p className="mt-2 max-w-xl text-sm text-navy-600">
              Décrivez votre besoin : nous vous indiquons ce qui est réalisable et sous quelles conditions, à Daloa
              comme partout en Côte d’Ivoire.
            </p>
          </div>
          <Link to="/devis" className="btn-primary shrink-0">
            Demander un devis
          </Link>
        </div>
      </Section>
    </>
  )
}
