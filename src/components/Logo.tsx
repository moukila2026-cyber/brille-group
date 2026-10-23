import { Link } from 'react-router-dom'
import { cn } from '../lib/format'

/**
 * Identité visuelle BRILLE GROUP SARL.
 *
 * Le logo est reconstruit en vectoriel à partir du document officiel de
 * l'entreprise : arche rouge et bleue, bandeau blanc « BRILLE GROUP » et
 * bandeau bleu « Let's shine together ». Il reste net à toutes les tailles
 * (en-tête, pied de page, favicon) et n'est jamais rogné.
 *
 * Couleurs de la charte, relevées sur le logo fourni :
 *   rouge #EE1F3A · bleu #1E90DE · blanc
 */

const RED = '#EE1F3A'
const AZURE = '#1E90DE'

type MarkProps = { className?: string; title?: string }

/** Version carrée (favicon, puces, en-tête compact). */
export function LogoMark({ className, title = 'BRILLE GROUP' }: MarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={cn('h-11 w-11', className)}
    >
      <ellipse cx="32" cy="32" rx="29" ry="20" fill="none" stroke={RED} strokeWidth="4.6" />
      <ellipse cx="32" cy="32" rx="23.5" ry="14.5" fill="none" stroke={AZURE} strokeWidth="4" />
      <rect x="0.6" y="23" width="62.8" height="18" rx="9" fill="#fff" stroke={AZURE} strokeWidth="1.9" />
      <text
        x="32"
        y="36.6"
        textAnchor="middle"
        fontFamily="Segoe UI, system-ui, sans-serif"
        fontSize="14.5"
        fontWeight="800"
        letterSpacing="0.6"
        fill={RED}
      >
        BG
      </text>
    </svg>
  )
}

/**
 * Logo complet : arche, wordmark et signature.
 * `variant="light"` s'utilise sur fond sombre (pied de page).
 */
export function LogoFull({
  className,
  variant = 'dark',
  title = 'BRILLE GROUP SARL — Let’s shine together',
}: MarkProps & { variant?: 'dark' | 'light' }) {
  const wordFill = variant === 'light' ? '#fff' : RED
  return (
    <svg
      viewBox="0 0 460 240"
      role="img"
      aria-label={title}
      className={className}
    >
      {/* Arche double : rouge à l'extérieur, bleu à l'intérieur */}
      <path d="M 25 148 A 205 100 0 0 1 435 148" fill="none" stroke={RED} strokeWidth="15" strokeLinecap="round" />
      <path d="M 47 144 A 183 82 0 0 1 413 144" fill="none" stroke={AZURE} strokeWidth="13" strokeLinecap="round" />
      {/* Volutes basses, de part et d'autre du bandeau */}
      <path d="M 25 148 A 205 100 0 0 0 64 211" fill="none" stroke={RED} strokeWidth="15" strokeLinecap="round" />
      <path d="M 435 148 A 205 100 0 0 1 396 211" fill="none" stroke={RED} strokeWidth="15" strokeLinecap="round" />
      <path d="M 47 144 A 183 82 0 0 0 80 203" fill="none" stroke={AZURE} strokeWidth="13" strokeLinecap="round" />
      <path d="M 413 144 A 183 82 0 0 1 380 203" fill="none" stroke={AZURE} strokeWidth="13" strokeLinecap="round" />

      {/* Bandeau du nom */}
      <rect
        x="1.6"
        y="90"
        width="456.8"
        height="58"
        rx="29"
        fill={variant === 'light' ? '#0F2438' : '#fff'}
        stroke={AZURE}
        strokeWidth="2.8"
      />
      <text
        x="230"
        y="133.5"
        textAnchor="middle"
        fontFamily="Segoe UI, system-ui, sans-serif"
        fontSize="46"
        fontWeight="800"
        letterSpacing="0.5"
        fill={wordFill}
      >
        BRILLE GROUP
      </text>

      {/* Signature */}
      <rect x="58" y="154" width="344" height="36" rx="18" fill={AZURE} />
      <text
        x="230"
        y="178.5"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="19"
        fontStyle="italic"
        fontWeight="600"
        fill="#fff"
      >
        Let’s shine together
      </text>
    </svg>
  )
}

/** Logo cliquable, version en-tête. */
export function Logo({
  light = false,
  compact = false,
  className,
}: {
  light?: boolean
  compact?: boolean
  className?: string
}) {
  return (
    <Link
      to="/"
      aria-label="BRILLE GROUP SARL — Accueil"
      className={cn('group inline-flex items-center gap-2.5 rounded-xl', className)}
    >
      <LogoFull
        variant={light ? 'light' : 'dark'}
        className={cn(
          'transition-transform duration-300 group-hover:scale-[1.02]',
          compact ? 'h-10 w-auto sm:h-11' : 'h-12 w-auto sm:h-16',
        )}
      />
    </Link>
  )
}
