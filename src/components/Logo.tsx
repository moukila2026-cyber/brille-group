import { Link } from 'react-router-dom'
import { cn } from '../lib/format'

/**
 * Identité visuelle provisoire, construite à partir des couleurs du document
 * officiel de l'entreprise (bleu et rouge).
 * → Remplacer par le fichier logo officiel via Administration > Paramètres.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="BRILLE GROUP" className={cn('h-11 w-11', className)}>
      <defs>
        <linearGradient id="bg-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#16253d" />
          <stop offset="100%" stopColor="#0d1a2d" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#bg-mark)" />
      <path d="M8 33c9-13 20-16 32-15" stroke="#c8102e" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M8 38c10-14 21-17 32-16" stroke="#d6a945" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".95" />
      <text
        x="24"
        y="24"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Segoe UI, system-ui, sans-serif"
        fontSize="17"
        fontWeight="700"
        fill="#ffffff"
      >
        BG
      </text>
    </svg>
  )
}

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="BRILLE GROUP SARL — Accueil">
      <LogoMark className={compact ? 'h-9 w-9' : 'h-11 w-11'} />
      <span className="leading-tight">
        <span
          className={cn(
            'block font-display text-[17px] font-bold tracking-tight sm:text-lg',
            light ? 'text-white' : 'text-navy-900',
          )}
        >
          BRILLE GROUP
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn('block text-[10px] font-semibold uppercase tracking-[0.28em]', light ? 'text-gold-300' : 'text-gold-600')}>
            SARL
          </span>
          <span className={cn('hidden text-[10px] italic sm:inline', light ? 'text-navy-200' : 'text-navy-400')}>
            Let’s shine together
          </span>
        </span>
      </span>
    </Link>
  )
}
