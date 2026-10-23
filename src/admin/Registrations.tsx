import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '../lib/api'
import { AdminHeading, ErrorBlock, LoadingBlock, Panel, Table } from './ui'
import { Badge } from '../components/ui'
import { formatDate, telHref } from '../lib/format'
import type { RegistrationDTO } from '../lib/types'

const STATUSES: Array<{ value: RegistrationDTO['status']; label: string }> = [
  { value: 'nouvelle', label: 'Nouvelle' },
  { value: 'a_contacter', label: 'À contacter' },
  { value: 'inscrit', label: 'Inscrit' },
  { value: 'sans_suite', label: 'Sans suite' },
]

export default function Registrations() {
  const [rows, setRows] = useState<RegistrationDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.get<{ registrations: RegistrationDTO[] }>('/api/admin/registrations')
      setRows(result.registrations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function updateStatus(id: string, status: RegistrationDTO['status']) {
    try {
      await api.patch(`/api/admin/registrations/${id}`, { status })
      setRows((previous) => previous.map((row) => (row.id === id ? { ...row, status } : row)))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Mise à jour impossible.')
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Supprimer cette inscription ?')) return
    try {
      await api.delete(`/api/admin/registrations/${id}`)
      setRows((previous) => previous.filter((row) => row.id !== id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Suppression impossible.')
    }
  }

  return (
    <>
      <AdminHeading
        title="Inscriptions et demandes de formation"
        description="Demandes reçues via le formulaire de la page Formation."
      />

      {error ? (
        <div className="mb-4">
          <ErrorBlock message={error} onRetry={() => void load()} />
        </div>
      ) : null}

      <Panel>
        {loading ? (
          <LoadingBlock />
        ) : rows.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-navy-400">Aucune demande d’inscription pour le moment.</p>
        ) : (
          <Table head={['Demandeur', 'Formation', 'Message', 'Reçue le', 'Statut', 'Actions']}>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-navy-50/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-navy-900">{row.fullName}</p>
                  <a href={telHref(row.phone)} className="text-xs text-navy-500 hover:text-navy-800">
                    {row.phone}
                  </a>
                  {row.email ? <p className="text-xs text-navy-500">{row.email}</p> : null}
                </td>
                <td className="px-4 py-3 text-xs text-navy-600">{row.courseTitle || '—'}</td>
                <td className="max-w-[240px] px-4 py-3 text-xs text-navy-600">
                  <span className="line-clamp-3 whitespace-pre-line">{row.message || '—'}</span>
                </td>
                <td className="px-4 py-3 text-xs text-navy-500">{formatDate(row.createdAt)}</td>
                <td className="px-4 py-3">
                  <Badge tone={row.status === 'nouvelle' ? 'gold' : row.status === 'inscrit' ? 'green' : 'muted'}>
                    {STATUSES.find((item) => item.value === row.status)?.label}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <select
                      aria-label={`Statut pour ${row.fullName}`}
                      className="rounded-lg border border-navy-200 px-2 py-1 text-xs"
                      value={row.status}
                      onChange={(event) => void updateStatus(row.id, event.target.value as RegistrationDTO['status'])}
                    >
                      {STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => void remove(row.id)}
                      className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-brandred hover:bg-red-50"
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
    </>
  )
}
