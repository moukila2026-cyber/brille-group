import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Icon } from '../components/Icon'
import { ProjectCard } from '../components/cards'
import { EmptyState, PageHero, Section, SectionHeading, Spinner } from '../components/ui'
import { useApiQuery } from '../lib/hooks'
import { useSite } from '../lib/site-context'
import { PROJECT_CATEGORY_LABELS, type ProjectCategory, type ProjectDTO } from '../lib/types'
import { cn } from '../lib/format'

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
  const { data, loading, error } = useApiQuery<{ projects: ProjectDTO[] }>('/api/public/projects')
  const { capabilities } = useSite()

  const projects = useMemo(() => {
    const list = data?.projects ?? []
    return filter === 'tous' ? list : list.filter((project) => project.category === filter)
  }, [data, filter])

  return (
    <>
      <Seo
        title="Nos réalisations et projets"
        description="Galerie des projets et réalisations de BRILLE GROUP SARL : construction, aménagement foncier, topographie, immobilier et nettoyage. Chaque projet est publié après validation de l’entreprise."
        path="/realisations"
      />
      <PageHero
        logo
        eyebrow="Nos réalisations"
        title="Nos projets, documentés et validés"
        description="Cette galerie ne contient que des projets réellement réalisés par l’entreprise et autorisés à la publication. Aucune image d’illustration n’y est présentée comme un chantier livré."
        image="/images/btp-construction.jpg"
      >
        <Link to="/devis" className="btn-gold">
          Parler de mon projet
        </Link>
      </PageHero>

      <Section>
        <SectionHeading
          eyebrow="Galerie"
          title="Filtrer par domaine"
          description="Sélectionnez une catégorie pour afficher les projets correspondants."
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
          {loading ? (
            <div className="flex justify-center py-16 text-navy-400">
              <Spinner />
            </div>
          ) : error ? (
            <EmptyState title="Chargement impossible" description={error} action={{ label: 'Réessayer', to: '/realisations' }} />
          ) : projects.length === 0 ? (
            <EmptyState
              title={capabilities.hasProjects ? 'Aucun projet dans cette catégorie' : 'Galerie en préparation'}
              description={
                capabilities.hasProjects
                  ? 'Aucun projet publié ne correspond à ce filtre pour le moment. Essayez une autre catégorie.'
                  : 'Les réalisations seront publiées ici au fur et à mesure de leur documentation et de l’accord de l’entreprise. Nous préférons une galerie vide à des références inventées.'
              }
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
              Décrivez votre besoin : nous vous indiquons ce qui est réalisable et sous quelles conditions.
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
