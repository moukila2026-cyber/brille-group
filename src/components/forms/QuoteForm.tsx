import { useMemo, useRef, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../lib/api'
import { SERVICE_TYPE_OPTIONS, cn } from '../../lib/format'
import { Alert, Spinner } from '../ui'
import { Consent, Field, Honeypot, Select, TextArea, TextInput } from './Field'

interface QuoteFormProps {
  /** Pré-sélectionne le type de service (page métier). */
  defaultService?: string
  /** Page d'origine, enregistrée avec la demande. */
  sourcePage: string
  /** Variante : « full » sur /devis, « compact » dans les sections. */
  variant?: 'full' | 'compact'
  className?: string
  title?: string
  description?: string
  /** Texte pré-rempli dans la description (ex. demande sur une annonce). */
  initialDescription?: string
}

interface FormState {
  full_name: string
  phone: string
  email: string
  service_type: string
  location: string
  budget: string
  timeline: string
  description: string
  consent: boolean
  company_website: string
}

const emptyForm = (serviceType: string, description = ''): FormState => ({
  full_name: '',
  phone: '',
  email: '',
  service_type: serviceType,
  location: '',
  budget: '',
  timeline: '',
  description,
  consent: false,
  company_website: '',
})

export function QuoteForm({
  defaultService = 'autre',
  sourcePage,
  variant = 'full',
  className,
  title = 'Demander un devis',
  description,
  initialDescription = '',
}: QuoteFormProps) {
  const [form, setForm] = useState<FormState>(() => emptyForm(defaultService, initialDescription))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ reference?: string; message: string } | null>(null)
  const openedAt = useRef(Date.now())

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => {
      if (!previous[key as string]) return previous
      const next = { ...previous }
      delete next[key as string]
      return next
    })
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (form.full_name.trim().length < 2) next.full_name = 'Indiquez votre nom complet.'
    if (form.phone.trim().length < 6 || !/^[+0-9 ().\-/]{6,32}$/.test(form.phone.trim())) {
      next.phone = 'Indiquez un numéro de téléphone joignable.'
    }
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Adresse e-mail invalide.'
    if (!form.service_type) next.service_type = 'Sélectionnez un type de service.'
    if (form.description.trim().length < 10) next.description = 'Décrivez votre besoin en quelques mots (10 caractères minimum).'
    if (!form.consent) next.consent = 'Votre accord est nécessaire pour traiter la demande.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGlobalError(null)
    if (!validate()) {
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"]')
      first?.focus()
      return
    }
    setSubmitting(true)
    try {
      const result = await api.post<{ ok: boolean; reference: string; message: string }>('/api/public/quotes', {
        ...form,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        location: form.location.trim(),
        budget: form.budget.trim(),
        timeline: form.timeline.trim(),
        description: form.description.trim(),
        source_page: sourcePage,
        form_opened_at: openedAt.current,
      })
      setSuccess({ reference: result.reference, message: result.message })
      setForm(emptyForm(defaultService, initialDescription))
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fields) {
          const mapped: Record<string, string> = {}
          for (const [key, messages] of Object.entries(error.fields)) {
            if (messages?.[0]) mapped[key] = messages[0]
          }
          setErrors(mapped)
        }
        setGlobalError(error.message)
      } else {
        setGlobalError('Envoi impossible pour le moment. Merci de réessayer ou de nous appeler.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const budgetOptions = useMemo(
    () => ['Moins de 500 000 FCFA', '500 000 – 2 000 000 FCFA', '2 000 000 – 10 000 000 FCFA', 'Plus de 10 000 000 FCFA', 'Je ne sais pas encore'],
    [],
  )

  if (success) {
    return (
      <div className={cn('card p-6 sm:p-8', className)}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">Demande enregistrée</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-navy-600">{success.message}</p>
          {success.reference ? (
            <p className="mt-4 rounded-xl bg-navy-50 px-4 py-2 text-sm text-navy-700">
              Référence de votre demande : <span className="font-semibold">{success.reference}</span>
            </p>
          ) : null}
          <p className="mt-4 text-xs text-navy-500">
            Conservez cette référence : elle nous permet de retrouver votre dossier rapidement.
          </p>
          <button
            type="button"
            onClick={() => {
              setSuccess(null)
              openedAt.current = Date.now()
            }}
            className="btn-outline mt-6"
          >
            Envoyer une autre demande
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn('card relative p-6 sm:p-8', className)}
      aria-labelledby="quote-form-title"
    >
      <Honeypot value={form.company_website} onChange={(value) => set('company_website', value)} />

      <h2 id="quote-form-title" className="text-xl font-semibold sm:text-2xl">
        {title}
      </h2>
      {description ? <p className="mt-2 text-sm leading-relaxed text-navy-600">{description}</p> : null}
      <p className="mt-2 text-xs text-navy-500">
        Les champs marqués d’un <span className="text-brandred">*</span> sont obligatoires. Réponse sous 48 h ouvrées
        lorsque les coordonnées sont complètes.
      </p>

      {globalError ? (
        <Alert tone="error" className="mt-5" title="Votre demande n’a pas pu être envoyée">
          {globalError} Vos informations sont conservées dans le formulaire : corrigez puis réessayez.
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Nom complet" htmlFor="full_name" required error={errors.full_name}>
          <TextInput
            id="full_name"
            name="full_name"
            autoComplete="name"
            placeholder="Ex. Awa Koné"
            value={form.full_name}
            invalid={Boolean(errors.full_name)}
            onChange={(event) => set('full_name', event.target.value)}
          />
        </Field>

        <Field label="Téléphone" htmlFor="phone" required error={errors.phone} hint="Numéro joignable de préférence sur WhatsApp.">
          <TextInput
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Ex. 07 XX XX XX XX"
            value={form.phone}
            invalid={Boolean(errors.phone)}
            onChange={(event) => set('phone', event.target.value)}
          />
        </Field>

        <Field label="Adresse e-mail" htmlFor="email" error={errors.email}>
          <TextInput
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            value={form.email}
            invalid={Boolean(errors.email)}
            onChange={(event) => set('email', event.target.value)}
          />
        </Field>

        <Field label="Type de service" htmlFor="service_type" required error={errors.service_type}>
          <Select
            id="service_type"
            name="service_type"
            value={form.service_type}
            invalid={Boolean(errors.service_type)}
            onChange={(event) => set('service_type', event.target.value)}
          >
            {SERVICE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Localisation du projet" htmlFor="location" hint="Ville, quartier ou village concerné.">
          <TextInput
            id="location"
            name="location"
            placeholder="Ex. Daloa, Tazibouo"
            value={form.location}
            onChange={(event) => set('location', event.target.value)}
          />
        </Field>

        {variant === 'full' ? (
          <>
            <Field label="Budget indicatif" htmlFor="budget">
              <Select id="budget" name="budget" value={form.budget} onChange={(event) => set('budget', event.target.value)}>
                <option value="">Non précisé</option>
                {budgetOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Délai souhaité" htmlFor="timeline">
              <TextInput
                id="timeline"
                name="timeline"
                placeholder="Ex. dans les 2 mois"
                value={form.timeline}
                onChange={(event) => set('timeline', event.target.value)}
              />
            </Field>
          </>
        ) : (
          <Field label="Délai souhaité" htmlFor="timeline">
            <TextInput
              id="timeline"
              name="timeline"
              placeholder="Ex. dans les 2 mois"
              value={form.timeline}
              onChange={(event) => set('timeline', event.target.value)}
            />
          </Field>
        )}
      </div>

      <div className="mt-5">
        <Field
          label="Description du besoin"
          htmlFor="description"
          required
          error={errors.description}
          hint="Nature des travaux, superficie, nombre de pièces, contraintes particulières…"
        >
          <TextArea
            id="description"
            name="description"
            value={form.description}
            invalid={Boolean(errors.description)}
            onChange={(event) => set('description', event.target.value)}
            maxLength={4000}
          />
        </Field>
        <p className="mt-1 text-right text-[11px] text-navy-400">{form.description.length} / 4000</p>
      </div>

      <div className="mt-5">
        <Consent
          id="consent"
          checked={form.consent}
          onChange={(checked) => set('consent', checked)}
          error={errors.consent}
        />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full sm:w-auto">
        {submitting ? (
          <>
            <Spinner /> Envoi en cours…
          </>
        ) : (
          <>
            Envoyer ma demande
            <span aria-hidden="true">→</span>
          </>
        )}
      </button>
      <p className="mt-3 text-[11px] leading-relaxed text-navy-400">
        Aucun engagement : cette demande permet de préciser votre besoin et d’obtenir une proposition chiffrée.
        Les demandes sont strictement confidentielles.
      </p>
    </form>
  )
}
