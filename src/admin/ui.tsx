import type { ReactNode } from 'react'
import { Alert, Spinner } from '../components/ui'
import { cn } from '../lib/format'

export function AdminHeading({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-navy-900 sm:text-2xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-navy-500">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </div>
  )
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl border border-navy-100 bg-white shadow-card', className)}>{children}</div>
}

export function LoadingBlock({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-navy-400">
      <Spinner /> {label}
    </div>
  )
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Alert tone="error" title="Une erreur est survenue">
      {message}
      {onRetry ? (
        <button type="button" onClick={onRetry} className="ml-1 font-semibold underline">
          Réessayer
        </button>
      ) : null}
    </Alert>
  )
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: number | string
  hint?: string
  tone?: 'default' | 'attention' | 'success'
}) {
  const tones = {
    default: 'bg-white',
    attention: 'bg-gold-50 border-gold-200',
    success: 'bg-emerald-50 border-emerald-200',
  }
  return (
    <div className={cn('rounded-2xl border border-navy-100 p-5 shadow-card', tones[tone])}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-navy-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-navy-500">{hint}</p> : null}
    </div>
  )
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-navy-100 text-[11px] uppercase tracking-wider text-navy-400">
            {head.map((cell) => (
              <th key={cell} className="px-4 py-3 font-semibold">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-50">{children}</tbody>
      </table>
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-950/50 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label={title}>
      <div className={cn('w-full rounded-2xl bg-white shadow-lift', wide ? 'max-w-3xl' : 'max-w-xl')}>
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-lg p-1.5 text-navy-400 hover:bg-navy-50">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}
