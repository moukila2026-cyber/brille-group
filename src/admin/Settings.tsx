import { useEffect, useMemo, useState } from 'react'
import { api, ApiError } from '../lib/api'
import { AdminHeading, ErrorBlock, LoadingBlock, Panel } from './ui'
import { Alert, Spinner } from '../components/ui'
import { Field, TextArea, TextInput } from '../components/forms/Field'
import { useSite } from '../lib/site-context'

type FieldDef = {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'boolean'
  help?: string
  span?: boolean
  placeholder?: string
}

const GROUPS: Array<{ title: string; description?: string; fields: FieldDef[] }> = [
  {
    title: 'Identité de l’entreprise',
    fields: [
      { key: 'company_name', label: 'Nom complet', placeholder: 'BRILLE GROUP SARL' },
      { key: 'company_short_name', label: 'Nom court', placeholder: 'BRILLE GROUP' },
      { key: 'tagline', label: 'Slogan' },
      { key: 'legal_form', label: 'Forme juridique' },
      { key: 'website_url', label: 'URL du site' },
    ],
  },
  {
    title: 'Coordonnées',
    description: 'Ces informations s’affichent sur tout le site (en-tête, pied de page, pages de contact).',
    fields: [
      { key: 'phone_primary', label: 'Téléphone principal' },
      { key: 'phone_secondary', label: 'Téléphone secondaire' },
      { key: 'phone_third', label: 'Autre numéro' },
      {
        key: 'whatsapp_number',
        label: 'Numéro WhatsApp (format international)',
        help: 'Uniquement si un vrai numéro WhatsApp est confirmé. Laisser vide sinon : aucun bouton WhatsApp ne sera affiché.',
        placeholder: '2250102030405',
        span: true,
      },
      { key: 'email_primary', label: 'Adresse e-mail' },
      { key: 'address_line', label: 'Adresse / localité' },
      { key: 'city', label: 'Ville' },
      { key: 'region', label: 'Région' },
      { key: 'country', label: 'Pays' },
      { key: 'intervention_area', label: 'Zone d’intervention', span: true },
      { key: 'opening_hours', label: 'Horaires d’ouverture', type: 'textarea', span: true, placeholder: 'Ex. Lundi – vendredi : 8h – 17h' },
    ],
  },
  {
    title: 'Réseaux sociaux',
    fields: [
      { key: 'facebook_url', label: 'Page Facebook', span: true },
      { key: 'linkedin_url', label: 'LinkedIn', span: true },
      { key: 'instagram_url', label: 'Instagram' },
      { key: 'tiktok_url', label: 'TikTok' },
    ],
  },
  {
    title: 'Textes du site',
    fields: [
      { key: 'hero_title', label: 'Titre de la page d’accueil', type: 'textarea', span: true },
      { key: 'hero_subtitle', label: 'Sous-titre de la page d’accueil', type: 'textarea', span: true },
      { key: 'about_intro', label: 'Présentation (page À propos)', type: 'textarea', span: true },
      { key: 'about_mission', label: 'Mission', type: 'textarea', span: true },
      { key: 'about_vision', label: 'Vision', type: 'textarea', span: true },
      { key: 'foncier_warning', label: 'Avertissement foncier', type: 'textarea', span: true },
      { key: 'legal_text', label: 'Mention légale générale', type: 'textarea', span: true },
      { key: 'legal_rcm', label: 'RCCM / immatriculation', span: true },
      { key: 'legal_cc', label: 'Compte contribuable', span: true },
    ],
  },
  {
    title: 'Référencement (SEO)',
    fields: [
      { key: 'seo_default_title', label: 'Titre par défaut', span: true },
      { key: 'seo_default_description', label: 'Description par défaut', type: 'textarea', span: true },
    ],
  },
  {
    title: 'Options',
    fields: [
      { key: 'whatsapp_enabled', label: 'Afficher le bouton WhatsApp flottant', type: 'boolean', span: true },
      { key: 'maintenance_mode', label: 'Afficher le bandeau « site en cours de mise à jour »', type: 'boolean', span: true },
    ],
  },
]

export default function Settings() {
  const { reload } = useSite()
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [valuesJson, setValuesJson] = useState('')

  useEffect(() => {
    api
      .get<{ settings: Record<string, unknown> }>('/api/admin/settings')
      .then((result) => {
        setValues(result.settings)
        setValuesJson(JSON.stringify(result.settings.values_json ?? [], null, 2))
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Chargement impossible.'))
      .finally(() => setLoading(false))
  }, [])

  const set = (key: string, value: unknown) => {
    setValues((previous) => ({ ...previous, [key]: value }))
    setFeedback(null)
  }

  const editableKeys = useMemo(() => new Set(GROUPS.flatMap((group) => group.fields.map((field) => field.key))), [])

  async function save() {
    setSaving(true)
    setError(null)
    setFeedback(null)
    const payload: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(values)) {
      if (editableKeys.has(key)) payload[key] = value
    }
    try {
      const parsed = JSON.parse(valuesJson) as unknown
      if (!Array.isArray(parsed)) throw new Error('Le bloc « engagements » doit être une liste JSON.')
      payload.values_json = parsed
    } catch {
      setError('Le bloc des engagements doit être un tableau JSON valide, par exemple : [{"title":"Excellence","text":"…"}]')
      setSaving(false)
      return
    }
    try {
      const result = await api.put<{ settings: Record<string, unknown> }>('/api/admin/settings', payload)
      setValues(result.settings)
      setFeedback('Paramètres enregistrés. Le site public est mis à jour.')
      reload()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Enregistrement impossible.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingBlock />
  if (error && Object.keys(values).length === 0) return <ErrorBlock message={error} />

  return (
    <>
      <AdminHeading
        title="Paramètres du site"
        description="Coordonnées, textes et réglages généraux. Les champs laissés vides ne sont pas affichés sur le site."
        action={
          <button type="button" onClick={() => void save()} disabled={saving} className="btn-primary !py-2.5 text-[13px]">
            {saving ? (
              <>
                <Spinner /> Enregistrement…
              </>
            ) : (
              'Enregistrer les modifications'
            )}
          </button>
        }
      />

      {error ? (
        <div className="mb-4">
          <ErrorBlock message={error} />
        </div>
      ) : null}
      {feedback ? (
        <div className="mb-4">
          <Alert tone="success">{feedback}</Alert>
        </div>
      ) : null}

      <div className="space-y-6">
        {GROUPS.map((group) => (
          <Panel key={group.title} className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-navy-500">{group.title}</h2>
            {group.description ? <p className="mt-1 text-xs text-navy-400">{group.description}</p> : null}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {group.fields.map((field) => (
                <Field
                  key={field.key}
                  label={field.label}
                  htmlFor={`setting-${field.key}`}
                  hint={field.help}
                  className={field.span ? 'sm:col-span-2' : undefined}
                >
                  {field.type === 'textarea' ? (
                    <TextArea
                      id={`setting-${field.key}`}
                      value={String(values[field.key] ?? '')}
                      onChange={(event) => set(field.key, event.target.value)}
                      placeholder={field.placeholder}
                    />
                  ) : field.type === 'boolean' ? (
                    <label className="flex items-center gap-2.5 rounded-xl border border-navy-200 px-4 py-3">
                      <input
                        id={`setting-${field.key}`}
                        type="checkbox"
                        checked={values[field.key] === true}
                        onChange={(event) => set(field.key, event.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-navy-700">{field.label}</span>
                    </label>
                  ) : (
                    <TextInput
                      id={`setting-${field.key}`}
                      value={String(values[field.key] ?? '')}
                      onChange={(event) => set(field.key, event.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </Field>
              ))}
            </div>
          </Panel>
        ))}

        <Panel className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-navy-500">Engagements (page À propos)</h2>
          <p className="mt-1 text-xs text-navy-400">
            Tableau JSON de la forme <code className="rounded bg-navy-50 px-1">{'[{"title":"…","text":"…"}]'}</code>
          </p>
          <div className="mt-4">
            <TextArea value={valuesJson} onChange={(event) => setValuesJson(event.target.value)} className="min-h-[160px] font-mono text-xs" />
          </div>
        </Panel>

        <div className="flex justify-end">
          <button type="button" onClick={() => void save()} disabled={saving} className="btn-primary">
            {saving ? (
              <>
                <Spinner /> Enregistrement…
              </>
            ) : (
              'Enregistrer les modifications'
            )}
          </button>
        </div>
      </div>
    </>
  )
}
