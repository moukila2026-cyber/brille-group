import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { ApiError } from '../lib/api'
import { Alert, Spinner } from '../components/ui'
import { Field, TextInput } from '../components/forms/Field'

export default function AdminLogin() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Connexion impossible pour le moment. Vérifiez votre réseau puis réessayez.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-navy-950">
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="rounded-2xl bg-white px-6 py-4 shadow-lift">
              <img
                src="/images/logo-brille-group.svg"
                alt="BRILLE GROUP SARL"
                className="h-16 w-auto"
                width={460}
                height={240}
              />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-azure-300">
              Espace administration
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white p-7 shadow-lift sm:p-8">
            <h1 className="text-xl font-semibold">Connexion sécurisée</h1>
            <p className="mt-1.5 text-sm text-navy-500">
              Espace réservé aux personnes autorisées de BRILLE GROUP SARL.
            </p>

            {error ? (
              <Alert tone="error" className="mt-5">
                {error}
              </Alert>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
              <Field label="Adresse e-mail" htmlFor="admin-email" required>
                <TextInput
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
              <Field label="Mot de passe" htmlFor="admin-password" required>
                <TextInput
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </Field>

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? (
                  <>
                    <Spinner /> Connexion…
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <p className="mt-5 text-[11px] leading-relaxed text-navy-400">
              Après 8 tentatives échouées, l’accès est temporairement bloqué. La session expire automatiquement au bout
              de 8 heures.
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-navy-400">
            <Link to="/" className="transition hover:text-white">
              ← Retour au site public
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
