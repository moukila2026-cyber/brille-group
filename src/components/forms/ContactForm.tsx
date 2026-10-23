import { useRef, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../lib/api'
import { Alert, Spinner } from '../ui'
import { Consent, Field, Honeypot, TextArea, TextInput } from './Field'

export function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
    consent: false,
    company_website: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
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
    if (form.name.trim().length < 2) next.name = 'Indiquez votre nom.'
    if (form.message.trim().length < 10) next.message = 'Votre message doit contenir au moins 10 caractères.'
    if (form.phone && !/^[+0-9 ().\-/]{6,32}$/.test(form.phone.trim())) next.phone = 'Numéro de téléphone invalide.'
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Adresse e-mail invalide.'
    if (!form.consent) next.consent = 'Votre accord est nécessaire pour traiter le message.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      const result = await api.post<{ message: string }>('/api/public/contact', {
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        form_opened_at: openedAt.current,
      })
      setSuccess(result.message)
      setForm({ name: '', phone: '', email: '', subject: '', message: '', consent: false, company_website: '' })
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
        <h3 className="text-xl font-semibold">Message envoyé</h3>
        <p className="mt-2 text-sm text-navy-600">{success}</p>
        <button type="button" onClick={() => setSuccess(null)} className="btn-outline mt-6">
          Écrire un autre message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card relative p-6 sm:p-8">
      <Honeypot value={form.company_website} onChange={(value) => set('company_website', value)} />
      <h2 className="text-xl font-semibold">Nous écrire</h2>
      <p className="mt-2 text-sm text-navy-600">
        Une question, une demande de partenariat ou d’information ? Remplissez ce formulaire.
      </p>
      <p className="mt-2 text-xs text-navy-500">
        Ces informations restent confidentielles : elles ne sont jamais publiées sur le site.
      </p>

      {globalError ? (
        <Alert tone="error" className="mt-5" title="Message non envoyé">
          {globalError}
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Nom complet" htmlFor="contact-name" required error={errors.name}>
          <TextInput
            id="contact-name"
            autoComplete="name"
            value={form.name}
            invalid={Boolean(errors.name)}
            onChange={(event) => set('name', event.target.value)}
          />
        </Field>
        <Field label="Téléphone" htmlFor="contact-phone" error={errors.phone}>
          <TextInput
            id="contact-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            invalid={Boolean(errors.phone)}
            onChange={(event) => set('phone', event.target.value)}
          />
        </Field>
        <Field label="Adresse e-mail" htmlFor="contact-email" error={errors.email}>
          <TextInput
            id="contact-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.email}
            invalid={Boolean(errors.email)}
            onChange={(event) => set('email', event.target.value)}
          />
        </Field>
        <Field label="Objet" htmlFor="contact-subject">
          <TextInput
            id="contact-subject"
            value={form.subject}
            onChange={(event) => set('subject', event.target.value)}
            placeholder="Ex. Information sur un terrain"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Votre message" htmlFor="contact-message" required error={errors.message}>
          <TextArea
            id="contact-message"
            value={form.message}
            invalid={Boolean(errors.message)}
            onChange={(event) => set('message', event.target.value)}
            maxLength={4000}
          />
        </Field>
      </div>

      <div className="mt-5">
        <Consent id="contact-consent" checked={form.consent} onChange={(value) => set('consent', value)} error={errors.consent} />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full sm:w-auto">
        {submitting ? (
          <>
            <Spinner /> Envoi…
          </>
        ) : (
          'Envoyer le message'
        )}
      </button>
    </form>
  )
}
