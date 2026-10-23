import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../lib/format'

export function Section({
  children,
  className,
  id,
  tone = 'white',
}: {
  children: ReactNode
  className?: string
  id?: string
  tone?: 'white' | 'muted' | 'navy'
}) {
  const tones = {
    white: 'bg-white',
    muted: 'bg-navy-50',
    navy: 'bg-navy-900 text-white',
  }
  return (
    <section id={id} className={cn('py-16 sm:py-20 lg:py-24', tones[tone], className)}>
      <div className="container-page">{children}</div>
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  light = false,
  as: Heading = 'h2',
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  light?: boolean
  as?: 'h1' | 'h2' | 'h3'
  className?: string
}) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? (
        <p className={cn('eyebrow', light && 'text-gold-300')}>
          <span className="h-px w-6 bg-current" aria-hidden="true" />
          {eyebrow}
        </p>
      ) : null}
      <Heading
        className={cn(
          'mt-3 text-3xl font-semibold leading-tight sm:text-4xl',
          light ? 'text-white' : 'text-navy-900',
        )}
      >
        {title}
      </Heading>
      <div className={cn('rule-gold mt-5', align === 'center' && 'mx-auto')} aria-hidden="true" />
      {description ? (
        <p className={cn('mt-5 text-[15px] leading-relaxed sm:text-base', light ? 'text-navy-100' : 'text-navy-600')}>
          {description}
        </p>
      ) : null}
    </div>
  )
}

export function Badge({
  children,
  tone = 'navy',
  className,
}: {
  children: ReactNode
  tone?: 'navy' | 'gold' | 'green' | 'red' | 'muted' | 'white'
  className?: string
}) {
  const tones = {
    navy: 'bg-navy-900 text-white',
    gold: 'bg-gold-100 text-gold-800 ring-1 ring-gold-200',
    green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    red: 'bg-red-50 text-brandred ring-1 ring-red-200',
    muted: 'bg-navy-100 text-navy-700',
    white: 'bg-white/10 text-white ring-1 ring-white/20',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Alert({
  children,
  tone = 'info',
  title,
  className,
}: {
  children: ReactNode
  tone?: 'info' | 'warning' | 'success' | 'error'
  title?: string
  className?: string
}) {
  const tones = {
    info: 'border-navy-200 bg-navy-50 text-navy-800',
    warning: 'border-gold-300 bg-gold-50 text-navy-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    error: 'border-red-200 bg-red-50 text-red-900',
  }
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('rounded-xl border p-4 text-sm', tones[tone], className)}>
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <div className="leading-relaxed">{children}</div>
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent', className)}
      role="status"
      aria-label="Chargement"
    />
  )
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description: string
  action?: { label: string; to: string }
  icon?: ReactNode
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-400">
        {icon ?? (
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M4 7h16M4 12h10M4 17h7" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-navy-500">{description}</p>
      {action ? (
        <Link to={action.to} className="btn-outline mt-6">
          {action.label}
        </Link>
      ) : null}
    </div>
  )
}

export function Breadcrumb({ items }: { items: Array<{ label: string; to?: string }> }) {
  return (
    <nav aria-label="Fil d’Ariane" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-navy-400">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.to ? (
              <Link to={item.to} className="transition hover:text-navy-700">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-navy-600">{item.label}</span>
            )}
            {index < items.length - 1 ? <span aria-hidden="true">/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  image?: string
  children?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      {image ? (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          loading="eager"
        />
      ) : null}
      <div
        className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/95 to-navy-900/70"
        aria-hidden="true"
      />
      <div className="container-page relative py-16 sm:py-20 lg:py-24">
        {eyebrow ? <p className="eyebrow text-gold-300">{eyebrow}</p> : null}
        <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <div className="rule-gold mt-6" aria-hidden="true" />
        {description ? (
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-navy-100 sm:text-base">{description}</p>
        ) : null}
        {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </section>
  )
}
