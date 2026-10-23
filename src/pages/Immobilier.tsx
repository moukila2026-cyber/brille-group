import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Icon } from '../components/Icon'
import { PropertyCard } from '../components/cards'
import { Alert, Badge, Breadcrumb, EmptyState, PageHero, Section, SectionHeading, Spinner } from '../components/ui'
import { QuoteForm } from '../components/forms/QuoteForm'
import { useApiQuery } from '../lib/hooks'
import { useSite } from '../lib/site-context'
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  type PropertyDTO,
  type PropertyStatus,
  type PropertyType,
} from '../lib/types'
import { formatArea, formatFcfa, telHref } from '../lib/format'

const TYPES: Array<{ value: PropertyType | ''; label: string }> = [
  { value: '', label: 'Tous les types' },
  { value: 'terrain', label: 'Terrains' },
  { value: 'maison', label: 'Maisons' },
  { value: 'appartement', label: 'Appartements' },
  { value: 'local_commercial', label: 'Locaux commerciaux' },
  { value: 'autre', label: 'Autres' },
]

const STATUSES: Array<{ value: PropertyStatus | ''; label: string }> = [
  { value: '', label: 'Tous les statuts' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'reserve', label: 'Réservé' },
  { value: 'vendu', label: 'Vendu' },
]

function FoncierNote() {
  const { settings } = useSite()
  return (
    <Alert tone="warning" title="Vérification avant toute transaction">
      {String(
        settings.foncier_warning ??
          'Les informations relatives aux terrains, titres, limites, droits fonciers et documents administratifs affichées sur ce site sont indicatives et doivent être vérifiées avant toute transaction.',
      )}
    </Alert>
  )
}

export function ImmobilierList() {
  const [type, setType] = useState<PropertyType | ''>('')
  const [status, setStatus] = useState<PropertyStatus | ''>('')
  const [location, setLocation] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minArea, setMinArea] = useState('')

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (status) params.set('status', status)
    if (location.trim()) params.set('location', location.trim())
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (minArea) params.set('minArea', minArea)
    const suffix = params.toString()
    return `/api/public/properties${suffix ? `?${suffix}` : ''}`
  }, [type, status, location, maxPrice, minArea])

  const { data, loading, error } = useApiQuery<{ properties: PropertyDTO[] }>(query)
  const { settings } = useSite()
  const phone = String(settings.phone_primary ?? '')
  const properties = data?.properties ?? []

  return (
    <>
      <Seo
        title="Immobilier et vente de terrains à Daloa"
        description="Terrains et biens immobiliers proposés par BRILLE GROUP SARL à Daloa et en Côte d’Ivoire : localisation, superficie, prix et disponibilité, avec vérification des documents avant transaction."
        path="/immobilier"
      />
      <PageHero
        logo
        eyebrow="Immobilier & terrains"
        title="Terrains et biens disponibles"
        description="Les annonces publiées ici sont celles transmises par l’entreprise. Chaque fiche précise, lorsqu’elle est disponible, la localisation, la superficie, le prix et le statut de disponibilité."
        image="/images/immobilier.jpg"
      >
        <Link to="/contact" className="btn-gold">
          Poser une question
        </Link>
        {phone ? (
          <a href={telHref(phone)} className="btn-ghost-light">
            <Icon name="phone" className="h-4 w-4" />
            {phone}
          </a>
        ) : null}
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeading
              eyebrow="Annonces"
              title="Trouver le bien qui correspond à votre projet"
              description="Utilisez les filtres pour affiner la recherche. Les annonces marquées « vendu » ou « réservé » restent visibles à titre informatif."
            />

            <div className="mt-8 grid gap-3 rounded-2xl border border-navy-100 bg-navy-50/60 p-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="filter-type" className="label">
                  Type de bien
                </label>
                <select
                  id="filter-type"
                  className="input !bg-white"
                  value={type}
                  onChange={(event) => setType(event.target.value as PropertyType | '')}
                >
                  {TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filter-status" className="label">
                  Disponibilité
                </label>
                <select
                  id="filter-status"
                  className="input !bg-white"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as PropertyStatus | '')}
                >
                  {STATUSES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filter-location" className="label">
                  Localisation
                </label>
                <input
                  id="filter-location"
                  className="input !bg-white"
                  placeholder="Ex. Daloa"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="filter-price" className="label">
                  Budget maximum (FCFA)
                </label>
                <input
                  id="filter-price"
                  className="input !bg-white"
                  inputMode="numeric"
                  placeholder="Ex. 5000000"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              <div>
                <label htmlFor="filter-area" className="label">
                  Superficie minimum (m²)
                </label>
                <input
                  id="filter-area"
                  className="input !bg-white"
                  inputMode="numeric"
                  placeholder="Ex. 500"
                  value={minArea}
                  onChange={(event) => setMinArea(event.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setType('')
                    setStatus('')
                    setLocation('')
                    setMaxPrice('')
                    setMinArea('')
                  }}
                  className="btn-outline w-full !bg-white"
                >
                  Réinitialiser
                </button>
              </div>
            </div>

            <div className="mt-8">
              {loading ? (
                <div className="flex justify-center py-16 text-navy-400">
                  <Spinner />
                </div>
              ) : error ? (
                <Alert tone="error" title="Chargement impossible">
                  {error}
                </Alert>
              ) : properties.length === 0 ? (
                <EmptyState
                  title="Aucune annonce ne correspond à votre recherche"
                  description="Aucun bien n’est publié pour le moment avec ces critères. Nous n’affichons pas d’annonces fictives : contactez-nous pour connaître les disponibilités réelles."
                  action={{ label: 'Nous contacter', to: '/contact' }}
                  icon={<Icon name="home" className="h-7 w-7" />}
                />
              ) : (
                <>
                  <p className="mb-4 text-sm text-navy-500">
                    {properties.length} annonce{properties.length > 1 ? 's' : ''} affichée
                    {properties.length > 1 ? 's' : ''}
                  </p>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <FoncierNote />
              <div className="card p-6">
                <h2 className="text-lg font-semibold">Vous cherchez un terrain précis ?</h2>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">
                  Indiquez la zone recherchée, la superficie souhaitée et votre budget : nous vous répondons avec les
                  disponibilités réelles.
                </p>
                <Link to="/devis" className="btn-primary mt-4 w-full">
                  Demander des informations
                </Link>
                {phone ? (
                  <a href={telHref(phone)} className="btn-outline mt-2 w-full">
                    <Icon name="phone" className="h-4 w-4" />
                    {phone}
                  </a>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  )
}

export function PropertyDetail() {
  const { id = '' } = useParams()
  const { data, loading, error } = useApiQuery<{ property: PropertyDTO }>(id ? `/api/public/properties/${id}` : null)
  const property = data?.property

  if (loading) {
    return (
      <div className="container-page flex justify-center py-24 text-navy-400">
        <Spinner />
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="container-page py-20">
        <EmptyState
          title="Annonce introuvable"
          description={error ?? 'Cette annonce n’est plus disponible ou n’a pas été publiée.'}
          action={{ label: 'Voir toutes les annonces', to: '/immobilier' }}
        />
      </div>
    )
  }

  const statusTone = property.status === 'disponible' ? 'green' : property.status === 'reserve' ? 'gold' : 'muted'

  return (
    <>
      <Seo
        title={`${property.title} — ${property.reference}`}
        description={`${PROPERTY_TYPE_LABELS[property.propertyType]} à ${property.location || 'Daloa'} : ${formatArea(property.areaSqm)}, ${formatFcfa(property.priceFcfa)}. Référence ${property.reference} — BRILLE GROUP SARL.`}
        path={`/immobilier/${property.id}`}
      />

      <div className="border-b border-navy-100 bg-navy-50/60">
        <div className="container-page py-5">
          <Breadcrumb
            items={[
              { label: 'Accueil', to: '/' },
              { label: 'Immobilier', to: '/immobilier' },
              { label: property.reference },
            ]}
          />
        </div>
      </div>

      <Section className="!pt-10">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-navy-100 bg-navy-100">
              {property.images.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="h-[280px] w-full object-cover sm:h-[400px]"
                  onError={(event) => {
                    event.currentTarget.src = '/images/immobilier.jpg'
                  }}
                />
              ) : (
                <div className="flex h-[280px] items-center justify-center text-gold-300 sm:h-[400px]">
                  <Icon name="home" className="h-12 w-12" />
                </div>
              )}
            </div>

            {property.images.length > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {property.images.slice(1, 5).map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt={`${property.title} — vue complémentaire`}
                    className="h-20 w-full rounded-xl object-cover sm:h-24"
                    loading="lazy"
                  />
                ))}
              </div>
            ) : null}

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={statusTone}>{PROPERTY_STATUS_LABELS[property.status]}</Badge>
                <Badge tone="muted">{PROPERTY_TYPE_LABELS[property.propertyType]}</Badge>
                <span className="text-xs text-navy-400">Réf. {property.reference}</span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{property.title}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-navy-600">
                <Icon name="pin" className="h-4 w-4" />
                {property.location || 'Localisation à préciser'}
              </p>

              <dl className="mt-6 grid gap-4 rounded-2xl border border-navy-100 bg-white p-5 sm:grid-cols-3">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-navy-400">Prix</dt>
                  <dd className="mt-1 text-lg font-semibold text-navy-900">{formatFcfa(property.priceFcfa)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-navy-400">Superficie</dt>
                  <dd className="mt-1 text-lg font-semibold text-navy-900">{formatArea(property.areaSqm)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-navy-400">Disponibilité</dt>
                  <dd className="mt-1 text-lg font-semibold text-navy-900">{PROPERTY_STATUS_LABELS[property.status]}</dd>
                </div>
              </dl>

              {property.description ? (
                <div className="prose-brille mt-6">
                  <h2 className="!mt-0 text-lg font-semibold">Description</h2>
                  {property.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mt-2">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : null}

              {property.extraInfo ? (
                <div className="mt-6 rounded-2xl bg-navy-50 p-5">
                  <h2 className="text-sm font-semibold text-navy-900">Informations complémentaires</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy-700">{property.extraInfo}</p>
                </div>
              ) : null}

              <div className="mt-6">
                <FoncierNote />
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <QuoteForm
                defaultService="immobilier_terrain"
                sourcePage={`/immobilier/${property.reference}`}
                variant="compact"
                title="Demander des informations"
                description={`Annonce ${property.reference} — ${property.title}.`}
                initialDescription={`Je souhaite des informations sur l’annonce ${property.reference} (${property.title}).`}
              />
            </div>
          </aside>
        </div>
      </Section>
    </>
  )
}
