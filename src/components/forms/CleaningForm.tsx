import { useRef, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../lib/api'
import { Alert, Spinner } from '../ui'
import { Consent, Field, Honeypot, Select, TextArea, TextInput } from './Field'

const PRESTATIONS_SELECT = [
  'Nettoyage & désinfection de maison / bureau / magasin / grande surface',
  'Dératisation, désinsectisation, désinfection & désodorisation (3D / 4D)',
  'Nettoyage & désinfection de fauteuils / canapés',
  'Nettoyage & désinfection de moquettes ou tapis',
  'Nettoyage & désinfection de matelas / punaises de lit',
  'Nettoyage de fin de chantier / avant aménagement / après rénovation',
  'Nettoyage et ponçage du marbre',
  'Nettoyage de baies vitrées / façades et plafonds',
  'Nettoyage d’intérieur de voiture',
  'Plusieurs prestations combinées',
]

const LOCAUX = [
  'Maison / résidence',
  'Bureaux / entreprise',
  'Magasin / supermarché / grande surface',
  'Restaurant / hôtel',
  'Entrepôt / local industriel',
  'Chantier (fin de travaux / rénovation)',
  'Véhicule (intérieur de voiture)',
  'Autre',
]

const FREQUENCES = ['Une seule fois', 'Hebdomadaire', 'Deux fois par mois', 'Mensuelle', 'À définir']

/**
 * Formulaire dédié au nettoyage & hygiène 3D : les informations spécifiques
 * (prestation, type de local, surface, fréquence, date) sont consolidées dans
 * la description de la demande de devis pour un traitement unifié côté admin.
 */
export function CleaningForm() {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    prestation: PRESTATIONS_SELECT[0],
    local_type: LOCAUX[0],
    location: '',
    area: '',
    frequency: FREQUENCES[0],
    desired_date: '',
    description: '',
    consent: false,
    company_website: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ reference: string; message: string } | null>(null)
  const openedAt = useRef(Date.now())

  const set = (key: keyof typeof form, value: string | boolean) => {
    setForm((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => {
      if (!previous[key]) return previous
      const next = { ...previous }
      delete next[key]
      return next
    })
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGlobalError(null)
    const next: Record<string, string> = {}
    if (form.full_name.trim().length < 2) next.full_name = 'Indiquez votre nom complet.'
    if (!/^[+0-9 ().\-/]{6,32}$/.test(form.phone.trim())) next.phone = 'Indiquez un numéro joignable.'
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Adresse e-mail invalide.'
    if (!form.consent) next.consent = 'Votre accord est nécessaire.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const description = [
      `Prestation souhaitée : ${form.prestation}`,
      `Type de lieu : ${form.local_type}`,
      form.area ? `Surface / quantité approximative : ${form.area}` : null,
      `Fréquence souhaitée : ${form.frequency}`,
      form.desired_date ? `Date souhaitée : ${form.desired_date}` : null,
      form.description.trim() ? `\nPrécisions : ${form.description.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    setSubmitting(true)
    try {
      const result = await api.post<{ reference: string; message: string }>('/api/public/quotes', {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        service_type: 'nettoyage',
        location: form.location.trim(),
        budget: '',
        timeline: form.desired_date,
        description,
        source_page: '/nettoyage-professionnel',
        consent: form.consent,
        company_website: form.company_website,
        form_opened_at: openedAt.current,
      })
      setSuccess({ reference: result.reference, message: result.message })
      setForm({
        full_name: '',
        phone: '',
        email: '',
        prestation: PRESTATIONS_SELECT[0],
        local_type: LOCAUX[0],
        location: '',
        area: '',
        frequency: FREQUENCES[0],
        desired_date: '',
        description: '',
        consent: false,
        company_website: '',
      })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fields) {
          const mapped: Record<string, string> = {}
          for (const [key, messages] of Object.entries(error.fields)) if (messages?.[0]) mapped[key] = messages[0]
          setErrors(mapped)
        }
        setGlobalError(error.message)
      } else {
        setGlobalError('Envoi impossible. Merci de réessayer ou de nous appeler.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold">Demande enregistrée</h3>
        <p className="mt-2 text-sm text-navy-600">{success.message}</p>
        <p className="mt-4 rounded-xl bg-navy-50 px-4 py-2 text-sm text-navy-700">
          Référence : <span className="font-semibold">{success.reference}</span>
        </p>
        <button type="button" onClick={() => setSuccess(null)} className="btn-outline mt-6">
          Nouvelle demande
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card relative p-6 sm:p-8">
      <Honeypot value={form.company_website} onChange={(value) => set('company_website', value)} />
      <h2 className="text-xl font-semibold">Devis nettoyage & hygiène 3D</h2>
      <p className="mt-2 text-sm text-navy-600">Quelques précisions suffisent pour recevoir une proposition adaptée.</p>

      {globalError ? (
        <Alert tone="error" className="mt-5">
          {globalError}
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Nom complet" htmlFor="clean-name" required error={errors.full_name}>
          <TextInput
            id="clean-name"
            autoComplete="name"
            value={form.full_name}
            invalid={Boolean(errors.full_name)}
            onChange={(event) => set('full_name', event.target.value)}
          />
        </Field>
        <Field label="Téléphone / WhatsApp" htmlFor="clean-phone" required error={errors.phone}>
          <TextInput
            id="clean-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Ex. 07 XX XX XX XX"
            value={form.phone}
            invalid={Boolean(errors.phone)}
            onChange={(event) => set('phone', event.target.value)}
          />
        </Field>
        <Field label="Prestation souhaitée" htmlFor="clean-prestation" className="sm:col-span-2" required>
          <Select id="clean-prestation" value={form.prestation} onChange={(event) => set('prestation', event.target.value)}>
            {PRESTATIONS_SELECT.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Type de lieu" htmlFor="clean-type" required>
          <Select id="clean-type" value={form.local_type} onChange={(event) => set('local_type', event.target.value)}>
            {LOCAUX.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Adresse e-mail" htmlFor="clean-email" error={errors.email}>
          <TextInput
            id="clean-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.email}
            invalid={Boolean(errors.email)}
            onChange={(event) => set('email', event.target.value)}
          />
        </Field>
        <Field label="Localisation" htmlFor="clean-location" hint="Daloa ou toute autre ville en Côte d’Ivoire.">
          <TextInput
            id="clean-location"
            value={form.location}
            onChange={(event) => set('location', event.target.value)}
            placeholder="Ex. Daloa, Abidjan, Yamoussoukro…"
          />
        </Field>
        <Field label="Surface ou quantité" htmlFor="clean-area" hint="Ex. 120 m², salon 7 places, 2 matelas…">
          <TextInput
            id="clean-area"
            value={form.area}
            onChange={(event) => set('area', event.target.value)}
          />
        </Field>
        <Field label="Fréquence" htmlFor="clean-frequency">
          <Select id="clean-frequency" value={form.frequency} onChange={(event) => set('frequency', event.target.value)}>
            {FREQUENCES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Date souhaitée" htmlFor="clean-date">
          <TextInput
            id="clean-date"
            type="date"
            value={form.desired_date}
            onChange={(event) => set('desired_date', event.target.value)}
          />
        </Field>
        <Field
          label="Précisions"
          htmlFor="clean-description"
          className="sm:col-span-2"
          hint="Nuisibles constatés, état des lieux, horaires d’accès, contraintes particulières."
        >
          <TextArea
            id="clean-description"
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
            maxLength={1500}
          />
        </Field>
      </div>

      <div className="mt-5">
        <Consent id="clean-consent" checked={form.consent} onChange={(value) => set('consent', value)} error={errors.consent} />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full sm:w-auto">
        {submitting ? (
          <>
            <Spinner /> Envoi…
          </>
        ) : (
          'Envoyer ma demande'
        )}
      </button>
    </form>
  )
}
