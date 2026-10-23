import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '../lib/api'
import { AdminHeading, ErrorBlock, LoadingBlock, Panel } from './ui'
import { Alert, Badge } from '../components/ui'
import { formatDate, telHref } from '../lib/format'
import type { ContactMessageDTO } from '../lib/types'

const STATUS_LABELS: Record<ContactMessageDTO['status'], string> = {
  nouveau: 'Nouveau',
  lu: 'Lu',
  traite: 'Traité',
}

export default function Messages() {
  const [messages, setMessages] = useState<ContactMessageDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'tous' | ContactMessageDTO['status']>('tous')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.get<{ messages: ContactMessageDTO[] }>(
        `/api/admin/messages${filter === 'tous' ? '' : `?status=${filter}`}`,
      )
      setMessages(result.messages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    void load()
  }, [load])

  async function updateStatus(id: string, status: ContactMessageDTO['status']) {
    try {
      await api.patch(`/api/admin/messages/${id}`, { status })
      setMessages((previous) => previous.map((message) => (message.id === id ? { ...message, status } : message)))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Mise à jour impossible.')
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Supprimer définitivement ce message ?')) return
    try {
      await api.delete(`/api/admin/messages/${id}`)
      setMessages((previous) => previous.filter((message) => message.id !== id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Suppression impossible.')
    }
  }

  return (
    <>
      <AdminHeading title="Messages de contact" description="Messages reçus via le formulaire de contact du site." />

      <div className="mb-4 flex flex-wrap gap-2">
        {(['tous', 'nouveau', 'lu', 'traite'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={
              filter === value
                ? 'rounded-full bg-navy-900 px-4 py-2 text-xs font-semibold text-white'
                : 'rounded-full border border-navy-200 bg-white px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50'
            }
          >
            {value === 'tous' ? 'Tous' : STATUS_LABELS[value]}
          </button>
        ))}
      </div>

      {error ? (
        <div className="mb-4">
          <ErrorBlock message={error} onRetry={() => void load()} />
        </div>
      ) : null}

      {loading ? (
        <Panel>
          <LoadingBlock />
        </Panel>
      ) : messages.length === 0 ? (
        <Panel>
          <p className="px-5 py-14 text-center text-sm text-navy-400">Aucun message pour le moment.</p>
        </Panel>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <Panel key={message.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-navy-900">{message.name}</p>
                    <Badge tone={message.status === 'nouveau' ? 'gold' : message.status === 'traite' ? 'green' : 'muted'}>
                      {STATUS_LABELS[message.status]}
                    </Badge>
                    <span className="text-xs text-navy-400">{formatDate(message.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-xs text-navy-500">
                    {message.phone ? (
                      <a href={telHref(message.phone)} className="hover:text-navy-800">
                        {message.phone}
                      </a>
                    ) : null}
                    {message.email ? (
                      <>
                        {message.phone ? ' · ' : ''}
                        <a href={`mailto:${message.email}`} className="hover:text-navy-800">
                          {message.email}
                        </a>
                      </>
                    ) : null}
                  </p>
                  {message.subject ? <p className="mt-2 text-xs font-medium text-navy-700">Objet : {message.subject}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {message.status !== 'traite' ? (
                    <button
                      type="button"
                      onClick={() => void updateStatus(message.id, 'traite')}
                      className="rounded-lg border border-navy-200 px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50"
                    >
                      Marquer traité
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void remove(message.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-brandred hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line border-t border-navy-50 pt-3 text-sm leading-relaxed text-navy-700">
                {message.message}
              </p>
            </Panel>
          ))}
        </div>
      )}

      <Alert tone="info" className="mt-6">
        Ces messages ne sont visibles que par les administrateurs connectés. Ils ne sont jamais publiés sur le site.
      </Alert>
    </>
  )
}
