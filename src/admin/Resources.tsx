import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, ApiError } from '../lib/api'
import { AdminHeading, ErrorBlock, LoadingBlock, Modal, Panel, Table } from './ui'
import { Alert, Badge, Spinner } from '../components/ui'
import { Field, Select, TextArea, TextInput } from '../components/forms/Field'
import { formatArea, formatDate, formatFcfa } from '../lib/format'
import {
  PROJECT_CATEGORY_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  type CourseDTO,
  type PropertyDTO,
  type ProjectDTO,
  type ServiceDTO,
} from '../lib/types'

type ResourceKey = 'services' | 'properties' | 'projects' | 'courses'

type FieldDef = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'select' | 'boolean' | 'list'
  options?: Array<{ value: string; label: string }>
  help?: string
  required?: boolean
  span?: boolean
}

type ResourceConfig = {
  title: string
  description: string
  endpoint: string
  addLabel: string
  fields: FieldDef[]
  defaults: Record<string, unknown>
  columns: Array<{ label: string; render: (item: Record<string, unknown>) => React.ReactNode }>
}

const CONFIG: Record<ResourceKey, ResourceConfig> = {
  services: {
    title: 'Services et domaines d’activité',
    description: 'Modifiez les textes, les visuels et la publication de chaque service affiché sur le site.',
    endpoint: '/api/admin/services',
    addLabel: 'Ajouter un service',
    defaults: {
      title: '',
      category: 'metier',
      shortDescription: '',
      description: '',
      bullets: [],
      imageUrl: '',
      icon: 'building',
      sortOrder: 0,
      isCore: false,
      isPublished: true,
    },
    fields: [
      { key: 'title', label: 'Titre', type: 'text', required: true },
      {
        key: 'category',
        label: 'Catégorie',
        type: 'select',
        options: [
          { value: 'metier', label: 'Métier principal' },
          { value: 'complementaire', label: 'Activité complémentaire' },
        ],
      },
      { key: 'shortDescription', label: 'Description courte', type: 'text', span: true, help: 'Affichée sur les cartes (300 caractères max.).' },
      { key: 'description', label: 'Description complète', type: 'textarea', span: true },
      { key: 'bullets', label: 'Points clés (un par ligne)', type: 'list', span: true },
      { key: 'imageUrl', label: 'Image (URL)', type: 'text', help: 'Ex. /images/topographie.jpg' },
      { key: 'icon', label: 'Icône', type: 'select', options: ['building', 'map', 'compass', 'home', 'graduation', 'sparkles', 'leaf', 'monitor', 'card', 'truck', 'scissors'].map((value) => ({ value, label: value })) },
      { key: 'sortOrder', label: 'Ordre d’affichage', type: 'number' },
      { key: 'isCore', label: 'Service principal (affiché en avant)', type: 'boolean' },
      { key: 'isPublished', label: 'Publié sur le site', type: 'boolean' },
    ],
    columns: [
      {
        label: 'Service',
        render: (item) => {
          const service = item as unknown as ServiceDTO
          return (
            <div>
              <p className="font-medium text-navy-900">{service.title}</p>
              <p className="text-xs text-navy-400">/{service.slug}</p>
            </div>
          )
        },
      },
      { label: 'Catégorie', render: (item) => <span className="text-xs text-navy-600">{(item as unknown as ServiceDTO).category === 'metier' ? 'Principal' : 'Complémentaire'}</span> },
      { label: 'Ordre', render: (item) => <span className="text-xs text-navy-500">{(item as unknown as ServiceDTO).sortOrder}</span> },
      {
        label: 'État',
        render: (item) => <Badge tone={(item as unknown as ServiceDTO).isPublished ? 'green' : 'muted'}>{(item as unknown as ServiceDTO).isPublished ? 'Publié' : 'Brouillon'}</Badge>,
      },
    ],
  },

  properties: {
    title: 'Biens immobiliers et terrains',
    description: 'Publiez uniquement des biens réels. Les annonces fictives sont interdites et nuisent à la crédibilité de l’entreprise.',
    endpoint: '/api/admin/properties',
    addLabel: 'Ajouter un bien',
    defaults: {
      reference: '',
      title: '',
      propertyType: 'terrain',
      location: '',
      areaSqm: '',
      priceFcfa: '',
      description: '',
      images: [],
      status: 'disponible',
      extraInfo: '',
      isPublished: true,
    },
    fields: [
      { key: 'reference', label: 'Référence', type: 'text', help: 'Laisser vide pour générer automatiquement.' },
      { key: 'title', label: 'Titre de l’annonce', type: 'text', required: true },
      {
        key: 'propertyType',
        label: 'Type de bien',
        type: 'select',
        options: Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({ value, label })),
      },
      {
        key: 'status',
        label: 'Disponibilité',
        type: 'select',
        options: Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => ({ value, label })),
      },
      { key: 'location', label: 'Localisation', type: 'text' },
      { key: 'areaSqm', label: 'Superficie (m²)', type: 'number' },
      { key: 'priceFcfa', label: 'Prix (FCFA)', type: 'number', help: 'Laisser vide si le prix ne doit pas être publié.' },
      { key: 'images', label: 'Photos (une URL par ligne)', type: 'list', span: true },
      { key: 'description', label: 'Description', type: 'textarea', span: true },
      { key: 'extraInfo', label: 'Informations complémentaires', type: 'textarea', span: true, help: 'Documents disponibles, conditions, précisions à vérifier…' },
      { key: 'isPublished', label: 'Publier l’annonce', type: 'boolean' },
    ],
    columns: [
      {
        label: 'Bien',
        render: (item) => {
          const property = item as unknown as PropertyDTO
          return (
            <div>
              <p className="font-medium text-navy-900">{property.title}</p>
              <p className="text-xs text-navy-400">
                {property.reference} · {PROPERTY_TYPE_LABELS[property.propertyType]}
              </p>
            </div>
          )
        },
      },
      { label: 'Localisation', render: (item) => <span className="text-xs text-navy-600">{(item as unknown as PropertyDTO).location || '—'}</span> },
      { label: 'Surface / Prix', render: (item) => {
        const property = item as unknown as PropertyDTO
        return (
          <span className="text-xs text-navy-600">
            {formatArea(property.areaSqm)} · {formatFcfa(property.priceFcfa)}
          </span>
        )
      } },
      { label: 'Statut', render: (item) => {
        const property = item as unknown as PropertyDTO
        return <Badge tone={property.status === 'disponible' ? 'green' : property.status === 'reserve' ? 'gold' : 'muted'}>{PROPERTY_STATUS_LABELS[property.status]}</Badge>
      } },
      { label: 'Publication', render: (item) => <Badge tone={(item as unknown as PropertyDTO).isPublished ? 'green' : 'muted'}>{(item as unknown as PropertyDTO).isPublished ? 'Publié' : 'Brouillon'}</Badge> },
    ],
  },

  projects: {
    title: 'Réalisations',
    description: 'Ne publiez que des projets réellement exécutés par l’entreprise et autorisés à la diffusion.',
    endpoint: '/api/admin/projects',
    addLabel: 'Ajouter une réalisation',
    defaults: {
      title: '',
      category: 'construction',
      description: '',
      location: '',
      period: '',
      coverImage: '',
      images: [],
      sortOrder: 0,
      isPublished: true,
    },
    fields: [
      { key: 'title', label: 'Titre du projet', type: 'text', required: true },
      {
        key: 'category',
        label: 'Catégorie',
        type: 'select',
        options: Object.entries(PROJECT_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
      },
      { key: 'location', label: 'Localisation', type: 'text' },
      { key: 'period', label: 'Période', type: 'text', help: 'Ex. 2025 ou mars–juin 2025' },
      { key: 'coverImage', label: 'Photo de couverture (URL)', type: 'text', span: true },
      { key: 'images', label: 'Galerie (une URL par ligne)', type: 'list', span: true },
      { key: 'description', label: 'Description', type: 'textarea', span: true },
      { key: 'sortOrder', label: 'Ordre d’affichage', type: 'number' },
      { key: 'isPublished', label: 'Publier', type: 'boolean' },
    ],
    columns: [
      { label: 'Projet', render: (item) => <p className="font-medium text-navy-900">{(item as unknown as ProjectDTO).title}</p> },
      { label: 'Catégorie', render: (item) => <span className="text-xs text-navy-600">{PROJECT_CATEGORY_LABELS[(item as unknown as ProjectDTO).category]}</span> },
      { label: 'Localisation', render: (item) => <span className="text-xs text-navy-500">{(item as unknown as ProjectDTO).location || '—'}</span> },
      { label: 'Publication', render: (item) => <Badge tone={(item as unknown as ProjectDTO).isPublished ? 'green' : 'muted'}>{(item as unknown as ProjectDTO).isPublished ? 'Publié' : 'Brouillon'}</Badge> },
    ],
  },

  courses: {
    title: 'Catalogue de formations',
    description: 'Ne publiez que des formations réellement proposées, avec des modalités confirmées.',
    endpoint: '/api/admin/courses',
    addLabel: 'Ajouter une formation',
    defaults: {
      title: '',
      objective: '',
      audience: '',
      duration: '',
      modalities: '',
      priceText: '',
      sortOrder: 0,
      isPublished: true,
    },
    fields: [
      { key: 'title', label: 'Intitulé', type: 'text', required: true, span: true },
      { key: 'objective', label: 'Objectifs', type: 'textarea', span: true },
      { key: 'audience', label: 'Public concerné', type: 'text', span: true },
      { key: 'duration', label: 'Durée', type: 'text', help: 'Ex. 3 jours' },
      { key: 'priceText', label: 'Tarif (texte libre)', type: 'text', help: 'Ex. 75 000 FCFA ou « sur devis »' },
      { key: 'modalities', label: 'Modalités', type: 'textarea', span: true },
      { key: 'sortOrder', label: 'Ordre d’affichage', type: 'number' },
      { key: 'isPublished', label: 'Publier', type: 'boolean' },
    ],
    columns: [
      { label: 'Formation', render: (item) => <p className="font-medium text-navy-900">{(item as unknown as CourseDTO).title}</p> },
      { label: 'Durée', render: (item) => <span className="text-xs text-navy-600">{(item as unknown as CourseDTO).duration || '—'}</span> },
      { label: 'Tarif', render: (item) => <span className="text-xs text-navy-600">{(item as unknown as CourseDTO).priceText || '—'}</span> },
      { label: 'Publication', render: (item) => <Badge tone={(item as unknown as CourseDTO).isPublished ? 'green' : 'muted'}>{(item as unknown as CourseDTO).isPublished ? 'Publiée' : 'Brouillon'}</Badge> },
    ],
  },
}

function toFormValue(value: unknown): string | number | boolean {
  if (Array.isArray(value)) return value.join('\n')
  if (typeof value === 'number' || typeof value === 'boolean') return value
  return (value as string | null) ?? ''
}

export default function Resources({ resource }: { resource: ResourceKey }) {
  const config = CONFIG[resource]
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.get<Record<string, Array<Record<string, unknown>>>>(config.endpoint)
      setItems(result[resource] ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.')
    } finally {
      setLoading(false)
    }
  }, [config.endpoint, resource])

  useEffect(() => {
    void load()
  }, [load])

  const openCreate = () => {
    setEditing({ id: null })
    setForm({ ...config.defaults })
    setFormError(null)
    setFieldErrors({})
  }

  const openEdit = (item: Record<string, unknown>) => {
    setEditing(item)
    const values: Record<string, unknown> = {}
    for (const field of config.fields) values[field.key] = toFormValue(item[field.key])
    setForm(values)
    setFormError(null)
    setFieldErrors({})
  }

  const payload = useMemo(() => {
    const out: Record<string, unknown> = {}
    for (const field of config.fields) {
      const raw = form[field.key]
      if (field.type === 'list') {
        out[field.key] = String(raw ?? '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
      } else if (field.type === 'number') {
        out[field.key] = raw === '' || raw === null ? null : Number(raw)
      } else if (field.type === 'boolean') {
        out[field.key] = Boolean(raw)
      } else {
        out[field.key] = typeof raw === 'string' ? raw.trim() : raw
      }
    }
    return out
  }, [form, config.fields])

  async function save() {
    const isNew = !editing?.id
    setSaving(true)
    setFormError(null)
    setFieldErrors({})
    try {
      if (isNew) {
        await api.post(config.endpoint, payload)
      } else {
        await api.patch(`${config.endpoint}/${String(editing?.id)}`, payload)
      }
      setEditing(null)
      await load()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) {
          const mapped: Record<string, string> = {}
          for (const [key, messages] of Object.entries(err.fields)) if (messages?.[0]) mapped[key] = messages[0]
          setFieldErrors(mapped)
        }
        setFormError(err.message)
      } else {
        setFormError('Enregistrement impossible. Vérifiez votre connexion.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(item: Record<string, unknown>) {
    try {
      await api.patch(`${config.endpoint}/${String(item.id)}`, { isPublished: !item.isPublished })
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Mise à jour impossible.')
    }
  }

  async function remove(item: Record<string, unknown>) {
    if (!window.confirm('Supprimer définitivement cet élément ? Cette action est irréversible.')) return
    try {
      await api.delete(`${config.endpoint}/${String(item.id)}`)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Suppression impossible.')
    }
  }

  return (
    <>
      <AdminHeading
        title={config.title}
        description={config.description}
        action={
          <button type="button" onClick={openCreate} className="btn-primary !py-2.5 text-[13px]">
            {config.addLabel}
          </button>
        }
      />

      {error ? (
        <div className="mb-4">
          <ErrorBlock message={error} onRetry={() => void load()} />
        </div>
      ) : null}

      <Panel>
        {loading ? (
          <LoadingBlock />
        ) : items.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-medium text-navy-700">Aucun élément pour le moment</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-navy-500">
              {resource === 'properties'
                ? 'Aucune annonce publiée : la page publique affiche un état vide honnête plutôt que des biens fictifs.'
                : 'Créez un premier élément pour alimenter cette rubrique du site.'}
            </p>
            <button type="button" onClick={openCreate} className="btn-outline mt-5 !py-2.5 text-[13px]">
              {config.addLabel}
            </button>
          </div>
        ) : (
          <Table head={[...config.columns.map((column) => column.label), 'Créé / modifié', 'Actions']}>
            {items.map((item) => (
              <tr key={String(item.id)} className="hover:bg-navy-50/50">
                {config.columns.map((column) => (
                  <td key={column.label} className="px-4 py-3 align-top">
                    {column.render(item)}
                  </td>
                ))}
                <td className="px-4 py-3 align-top text-xs text-navy-400">
                  {item.createdAt ? formatDate(String(item.createdAt), false) : '—'}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="rounded-lg border border-navy-200 px-2.5 py-1 text-xs font-semibold text-navy-700 hover:bg-navy-50"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => void togglePublish(item)}
                      className="rounded-lg border border-navy-200 px-2.5 py-1 text-xs font-semibold text-navy-700 hover:bg-navy-50"
                    >
                      {item.isPublished ? 'Dépublier' : 'Publier'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(item)}
                      className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-brandred hover:bg-red-50"
                    >
                      Suppr.
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Modifier' : config.addLabel}
        wide
      >
        {formError ? (
          <Alert tone="error" className="mb-4">
            {formError}
          </Alert>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {config.fields.map((field) => (
            <Field
              key={field.key}
              label={field.label}
              htmlFor={`field-${field.key}`}
              required={field.required}
              error={fieldErrors[field.key]}
              hint={field.help}
              className={field.span ? 'sm:col-span-2' : undefined}
            >
              {field.type === 'textarea' ? (
                <TextArea
                  id={`field-${field.key}`}
                  value={String(form[field.key] ?? '')}
                  onChange={(event) => setForm((previous) => ({ ...previous, [field.key]: event.target.value }))}
                />
              ) : field.type === 'list' ? (
                <TextArea
                  id={`field-${field.key}`}
                  value={String(form[field.key] ?? '')}
                  onChange={(event) => setForm((previous) => ({ ...previous, [field.key]: event.target.value }))}
                />
              ) : field.type === 'select' ? (
                <Select
                  id={`field-${field.key}`}
                  value={String(form[field.key] ?? '')}
                  onChange={(event) => setForm((previous) => ({ ...previous, [field.key]: event.target.value }))}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : field.type === 'boolean' ? (
                <label className="flex items-center gap-2.5 rounded-xl border border-navy-200 px-4 py-3">
                  <input
                    id={`field-${field.key}`}
                    type="checkbox"
                    checked={Boolean(form[field.key])}
                    onChange={(event) => setForm((previous) => ({ ...previous, [field.key]: event.target.checked }))}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-navy-700">{field.label}</span>
                </label>
              ) : (
                <TextInput
                  id={`field-${field.key}`}
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={String(form[field.key] ?? '')}
                  onChange={(event) => setForm((previous) => ({ ...previous, [field.key]: event.target.value }))}
                />
              )}
            </Field>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-navy-100 pt-5">
          <button type="button" onClick={() => void save()} disabled={saving} className="btn-primary !py-2.5 text-[13px]">
            {saving ? (
              <>
                <Spinner /> Enregistrement…
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
          <button type="button" onClick={() => setEditing(null)} className="btn-outline !py-2.5 text-[13px]">
            Annuler
          </button>
        </div>
      </Modal>
    </>
  )
}
