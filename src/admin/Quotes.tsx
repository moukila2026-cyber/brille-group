import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, ApiError, downloadAuthenticated } from '../lib/api'
import { useAuth } from './AuthContext'
import { AdminHeading, ErrorBlock, LoadingBlock, Modal, Panel, Table } from './ui'
import { Alert, Badge, Spinner } from '../components/ui'
import { Field, Select, TextArea } from '../components/forms/Field'
import { downloadCsvName, formatDate, telHref } from '../lib/format'
import { QUOTE_STATUS_LABELS, SERVICE_TYPE_LABELS, type AdminUserDTO, type QuoteDTO, type QuoteStatus } from '../lib/types'

const STATUSES = Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]

export default function Quotes() {
  const { admin } = useAuth()
  const [status, setStatus] = useState<QuoteStatus | 'tous'>('tous')
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [page, setPage] = useState(1)
  const [quotes, setQuotes] = useState<QuoteDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<QuoteDTO | null>(null)
  const [users, setUsers] = useState<AdminUserDTO[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(timer)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (status !== 'tous') params.set('status', status)
      if (debounced) params.set('q', debounced)
      const result = await api.get<{ quotes: QuoteDTO[]; total: number }>(`/api/admin/quotes?${params.toString()}`)
      setQuotes(result.quotes)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.')
    } finally {
      setLoading(false)
    }
  }, [status, debounced, page])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    api
      .get<{ users: AdminUserDTO[] }>('/api/admin/users')
      .then((result) => setUsers(result.users))
      .catch(() => setUsers([]))
  }, [])

  const pages = Math.max(1, Math.ceil(total / 20))

  const handleExport = async () => {
    try {
      await downloadAuthenticated('/api/admin/quotes-export.csv', downloadCsvName())
    } catch {
      setError('Export impossible. Vérifiez votre connexion.')
    }
  }

  return (
    <>
      <AdminHeading
        title="Demandes de devis"
        description={`${total} demande${total > 1 ? 's' : ''} enregistrée${total > 1 ? 's' : ''}. Les coordonnées sont strictement privées.`}
        action={
          <button type="button" onClick={() => void handleExport()} className="btn-outline !py-2.5 text-[13px]">
            Exporter en CSV
          </button>
        }
      />

      <Panel className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
          <div>
            <label htmlFor="quote-search" className="label">
              Rechercher
            </label>
            <input
              id="quote-search"
              className="input"
              placeholder="Référence, nom, téléphone, e-mail, contenu…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />
          </div>
          <div>
            <label htmlFor="quote-status" className="label">
              Statut
            </label>
            <select
              id="quote-status"
              className="input"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as QuoteStatus | 'tous')
                setPage(1)
              }}
            >
              <option value="tous">Tous les statuts</option>
              {STATUSES.map((value) => (
                <option key={value} value={value}>
                  {QUOTE_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Panel>

      {error ? <ErrorBlock message={error} onRetry={() => void load()} /> : null}

      <Panel>
        {loading ? (
          <LoadingBlock label="Chargement des demandes…" />
        ) : quotes.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-navy-400">
            Aucune demande ne correspond à ces critères.
          </p>
        ) : (
          <Table head={['Référence', 'Contact', 'Service', 'Localisation', 'Reçue le', 'Statut', '']}>
            {quotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-navy-50/50">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-navy-700">{quote.reference}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-navy-900">{quote.fullName}</p>
                  <a href={telHref(quote.phone)} className="text-xs text-navy-500 hover:text-navy-800">
                    {quote.phone}
                  </a>
                </td>
                <td className="px-4 py-3 text-xs text-navy-600">{SERVICE_TYPE_LABELS[quote.serviceType] ?? quote.serviceType}</td>
                <td className="px-4 py-3 text-xs text-navy-500">{quote.location || '—'}</td>
                <td className="px-4 py-3 text-xs text-navy-500">{formatDate(quote.createdAt)}</td>
                <td className="px-4 py-3">
                  <Badge
                    tone={
                      quote.status === 'nouvelle'
                        ? 'gold'
                        : quote.status === 'acceptee' || quote.status === 'terminee'
                          ? 'green'
                          : quote.status === 'sans_suite'
                            ? 'red'
                            : 'muted'
                    }
                  >
                    {QUOTE_STATUS_LABELS[quote.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setSelected(quote)}
                    className="rounded-lg border border-navy-200 px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50"
                  >
                    Ouvrir
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-xs text-navy-500">
          <p>
            Page {page} sur {pages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-navy-200 px-3 py-1.5 font-medium disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((value) => Math.min(pages, value + 1))}
              className="rounded-lg border border-navy-200 px-3 py-1.5 font-medium disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      ) : null}

      <QuoteDetail
        quote={selected}
        users={users}
        isSuperAdmin={admin?.role === 'superadmin'}
        onClose={() => setSelected(null)}
        onSaved={(updated) => {
          setQuotes((previous) => previous.map((item) => (item.id === updated.id ? updated : item)))
          setSelected(updated)
        }}
        onDeleted={() => {
          setSelected(null)
          void load()
        }}
      />
    </>
  )
}

function QuoteDetail({
  quote,
  users,
  isSuperAdmin,
  onClose,
  onSaved,
  onDeleted,
}: {
  quote: QuoteDTO | null
  users: AdminUserDTO[]
  isSuperAdmin: boolean
  onClose: () => void
  onSaved: (quote: QuoteDTO) => void
  onDeleted: () => void
}) {
  const [status, setStatus] = useState<QuoteStatus>('nouvelle')
  const [notes, setNotes] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmRef, setConfirmRef] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Réinitialisation uniquement à l'ouverture d'une AUTRE demande : un
  // enregistrement renvoie un objet mis à jour et ne doit pas effacer le message
  // de confirmation affiché à l'utilisateur.
  const currentId = quote?.id ?? null
  useEffect(() => {
    if (!quote) return
    setStatus(quote.status)
    setNotes(quote.internalNotes)
    setAssignedTo(quote.assignedTo ?? '')
    setFeedback(null)
    setError(null)
    setConfirmRef('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId])

  const serviceLabel = useMemo(
    () => (quote ? (SERVICE_TYPE_LABELS[quote.serviceType] ?? quote.serviceType) : ''),
    [quote],
  )

  if (!quote) return null

  async function save() {
    if (!quote) return
    setSaving(true)
    setError(null)
    setFeedback(null)
    try {
      const result = await api.patch<{ quote: QuoteDTO }>(`/api/admin/quotes/${quote.id}`, {
        status,
        internal_notes: notes,
        assigned_to: assignedTo || '',
      })
      onSaved(result.quote)
      setFeedback('Modifications enregistrées.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Enregistrement impossible.')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!quote) return
    setDeleting(true)
    setError(null)
    try {
      await api.delete(`/api/admin/quotes/${quote.id}`, { confirmReference: confirmRef })
      onDeleted()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Suppression impossible.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal open={Boolean(quote)} onClose={onClose} title={`Demande ${quote.reference}`} wide>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-400">Demandeur</p>
          <p className="mt-1 text-sm font-medium text-navy-900">{quote.fullName}</p>
          <a href={telHref(quote.phone)} className="text-sm text-navy-600 hover:underline">
            {quote.phone}
          </a>
          {quote.email ? (
            <a href={`mailto:${quote.email}`} className="block break-all text-sm text-navy-600 hover:underline">
              {quote.email}
            </a>
          ) : null}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-400">Informations</p>
          <p className="mt-1 text-sm text-navy-700">Service : {serviceLabel}</p>
          <p className="text-sm text-navy-700">Localisation : {quote.location || '—'}</p>
          <p className="text-sm text-navy-700">Budget : {quote.budget || '—'}</p>
          <p className="text-sm text-navy-700">Délai : {quote.timeline || '—'}</p>
          <p className="text-sm text-navy-700">Reçue le : {formatDate(quote.createdAt)}</p>
          {quote.sourcePage ? <p className="text-xs text-navy-400">Page source : {quote.sourcePage}</p> : null}
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-navy-50 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-400">Description du besoin</p>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy-800">{quote.description}</p>
      </div>

      {error ? (
        <Alert tone="error" className="mt-5">
          {error}
        </Alert>
      ) : null}
      {feedback ? (
        <Alert tone="success" className="mt-5">
          {feedback}
        </Alert>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Statut" htmlFor="detail-status" required>
          <Select id="detail-status" value={status} onChange={(event) => setStatus(event.target.value as QuoteStatus)}>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {QUOTE_STATUS_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Responsable" htmlFor="detail-assign">
          <Select id="detail-assign" value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)}>
            <option value="">Non affecté</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName} ({user.email})
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Notes internes" htmlFor="detail-notes" hint="Visible uniquement dans l’administration.">
          <TextArea id="detail-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={4000} />
        </Field>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => void save()} disabled={saving} className="btn-primary !py-2.5 text-[13px]">
          {saving ? (
            <>
              <Spinner /> Enregistrement…
            </>
          ) : (
            'Enregistrer'
          )}
        </button>
        <button type="button" onClick={onClose} className="btn-outline !py-2.5 text-[13px]">
          Fermer
        </button>
      </div>

      {isSuperAdmin ? (
        <div className="mt-6 border-t border-navy-100 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-brandred">Zone sensible</p>
          <p className="mt-1 text-xs text-navy-500">
            La suppression est définitive. Saisissez la référence <strong>{quote.reference}</strong> pour confirmer.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              className="input max-w-[220px]"
              value={confirmRef}
              onChange={(event) => setConfirmRef(event.target.value)}
              placeholder={quote.reference}
              aria-label="Référence de confirmation"
            />
            <button
              type="button"
              onClick={() => void remove()}
              disabled={deleting || confirmRef !== quote.reference}
              className="btn !bg-brandred !py-2.5 text-[13px] !text-white disabled:opacity-40"
            >
              {deleting ? 'Suppression…' : 'Supprimer définitivement'}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-6 border-t border-navy-100 pt-4 text-[11px] text-navy-400">
          La suppression d’une demande est réservée au super administrateur.
        </p>
      )}
    </Modal>
  )
}
