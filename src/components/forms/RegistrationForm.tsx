import { useRef, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../lib/api'
import { Alert, Spinner } from '../ui'
import { Consent, Field, Honeypot, Select, TextArea, TextInput } from './Field'
import type { CourseDTO } from '../../lib/types'

export function RegistrationForm({ courses }: { courses: CourseDTO[] }) {
  const [form, setForm] = useState({
    course_id: '',
    full_name: '',
    phone: '',
    email: '',
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
    if (form.full_name.trim().length < 2) next.full_name = 'Indiquez votre nom complet.'
    if (form.phone.trim().length < 6) next.phone = 'Indiquez un numéro joignable.'
    if (!form.consent) next.consent = 'Votre accord est nécessaire.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      const selected = courses.find((course) => course.id === form.course_id)
      const result = await api.post<{ message: string }>('/api/public/registrations', {
        course_id: form.course_id || null,
        course_title: selected?.title ?? 'Demande générale de formation',
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        consent: form.consent,
        company_website: form.company_website,
        form_opened_at: openedAt.current,
      })
      setSuccess(result.message)
      setForm({ course_id: '', full_name: '', phone: '', email: '', message: '', consent: false, company_website: '' })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fields) {
          const mapped: Record<string, string> = {}
          for (const [key, messages] of Object.entries(error.fields)) if (messages?.[0]) mapped[key] = messages[0]
          setErrors(mapped)
        }
        setGlobalError(error.message)
      } else {
        setGlobalError('Envoi impossible. Merci de réessayer.')
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
        <h3 className="text-xl font-semibold">Demande transmise</h3>
        <p className="mt-2 text-sm text-navy-600">{success}</p>
        <button type="button" onClick={() => setSuccess(null)} className="btn-outline mt-6">
          Nouvelle demande
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card relative p-6 sm:p-8">
      <Honeypot value={form.company_website} onChange={(value) => set('company_website', value)} />
      <h2 className="text-xl font-semibold">Demander une information ou une inscription</h2>
      <p className="mt-2 text-sm text-navy-600">
        Nous vous recontactons avec les modalités, les dates et le programme détaillé.
      </p>

      {globalError ? (
        <Alert tone="error" className="mt-5">
          {globalError}
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Formation concernée" htmlFor="reg-course" className="sm:col-span-2">
          <Select id="reg-course" value={form.course_id} onChange={(event) => set('course_id', event.target.value)}>
            <option value="">Demande générale / autre formation</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nom complet" htmlFor="reg-name" required error={errors.full_name}>
          <TextInput
            id="reg-name"
            autoComplete="name"
            value={form.full_name}
            invalid={Boolean(errors.full_name)}
            onChange={(event) => set('full_name', event.target.value)}
          />
        </Field>
        <Field label="Téléphone" htmlFor="reg-phone" required error={errors.phone}>
          <TextInput
            id="reg-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            invalid={Boolean(errors.phone)}
            onChange={(event) => set('phone', event.target.value)}
          />
        </Field>
        <Field label="Adresse e-mail" htmlFor="reg-email" error={errors.email} className="sm:col-span-2">
          <TextInput
            id="reg-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.email}
            invalid={Boolean(errors.email)}
            onChange={(event) => set('email', event.target.value)}
          />
        </Field>
        <Field label="Votre demande" htmlFor="reg-message" className="sm:col-span-2" hint="Vos attentes, votre niveau, vos disponibilités.">
          <TextArea id="reg-message" value={form.message} onChange={(event) => set('message', event.target.value)} maxLength={2000} />
        </Field>
      </div>

      <div className="mt-5">
        <Consent id="reg-consent" checked={form.consent} onChange={(value) => set('consent', value)} error={errors.consent} />
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
