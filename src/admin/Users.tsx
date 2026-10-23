import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '../lib/api'
import { useAuth } from './AuthContext'
import { AdminHeading, ErrorBlock, LoadingBlock, Panel, Table } from './ui'
import { Alert, Badge, Spinner } from '../components/ui'
import { Field, Select, TextInput } from '../components/forms/Field'
import { formatDate } from '../lib/format'
import type { AdminUserDTO } from '../lib/types'

export default function Users() {
  const { admin: me } = useAuth()
  const [users, setUsers] = useState<AdminUserDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [form, setForm] = useState({ email: '', full_name: '', password: '', role: 'admin' })
  const [creating, setCreating] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.get<{ users: AdminUserDTO[] }>('/api/admin/users')
      setUsers(result.users)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function createUser() {
    setCreating(true)
    setFormErrors({})
    setError(null)
    setFeedback(null)
    try {
      await api.post('/api/admin/users', form)
      setForm({ email: '', full_name: '', password: '', role: 'admin' })
      setFeedback('Compte créé. Communiquez le mot de passe à la personne par un canal sûr, puis invitez-la à le changer.')
      await load()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) {
          const mapped: Record<string, string> = {}
          for (const [key, messages] of Object.entries(err.fields)) if (messages?.[0]) mapped[key] = messages[0]
          setFormErrors(mapped)
        }
        setError(err.message)
      } else {
        setError('Création impossible.')
      }
    } finally {
      setCreating(false)
    }
  }

  async function toggleActive(user: AdminUserDTO) {
    try {
      await api.patch(`/api/admin/users/${user.id}`, { isActive: !user.isActive })
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Mise à jour impossible.')
    }
  }

  async function revokeSessions(user: AdminUserDTO) {
    if (!window.confirm(`Déconnecter toutes les sessions de ${user.fullName} ?`)) return
    try {
      await api.patch(`/api/admin/users/${user.id}`, { resetTokenVersion: true })
      setFeedback('Sessions révoquées. La personne devra se reconnecter.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action impossible.')
    }
  }

  const isSuperAdmin = me?.role === 'superadmin'

  return (
    <>
      <AdminHeading
        title="Utilisateurs de l’administration"
        description="Comptes autorisés à consulter les demandes et à gérer le contenu du site."
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

      <Panel className="mb-6">
        {loading ? (
          <LoadingBlock />
        ) : (
          <Table head={['Utilisateur', 'Rôle', 'État', 'Dernière connexion', 'Actions']}>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-navy-900">{user.fullName}</p>
                  <p className="text-xs text-navy-500">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={user.role === 'superadmin' ? 'navy' : 'muted'}>{user.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={user.isActive ? 'green' : 'red'}>{user.isActive ? 'Actif' : 'Désactivé'}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-navy-500">{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Jamais'}</td>
                <td className="px-4 py-3">
                  {isSuperAdmin ? (
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        disabled={user.id === me?.id}
                        onClick={() => void toggleActive(user)}
                        className="rounded-lg border border-navy-200 px-2.5 py-1 text-xs font-semibold text-navy-700 hover:bg-navy-50 disabled:opacity-40"
                      >
                        {user.isActive ? 'Désactiver' : 'Réactiver'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void revokeSessions(user)}
                        className="rounded-lg border border-navy-200 px-2.5 py-1 text-xs font-semibold text-navy-700 hover:bg-navy-50"
                      >
                        Révoquer les sessions
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-navy-400">Réservé au super administrateur</span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      {isSuperAdmin ? (
        <Panel className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-navy-500">Créer un compte</h2>
          <p className="mt-1 text-xs text-navy-400">
            Mot de passe : 12 caractères minimum, avec majuscule, minuscule et chiffre. Aucun mot de passe n’est
            envoyé par e-mail : transmettez-le par un canal sûr.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Nom complet" htmlFor="new-name" required error={formErrors.full_name}>
              <TextInput id="new-name" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} />
            </Field>
            <Field label="Adresse e-mail" htmlFor="new-email" required error={formErrors.email}>
              <TextInput id="new-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </Field>
            <Field label="Mot de passe initial" htmlFor="new-password" required error={formErrors.password}>
              <TextInput
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </Field>
            <Field label="Rôle" htmlFor="new-role">
              <Select id="new-role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="admin">Administrateur</option>
                <option value="superadmin">Super administrateur</option>
              </Select>
            </Field>
          </div>
          <button type="button" onClick={() => void createUser()} disabled={creating} className="btn-primary mt-5 !py-2.5 text-[13px]">
            {creating ? (
              <>
                <Spinner /> Création…
              </>
            ) : (
              'Créer le compte'
            )}
          </button>
        </Panel>
      ) : (
        <Alert tone="info">Seul un super administrateur peut créer ou modifier des comptes.</Alert>
      )}
    </>
  )
}
