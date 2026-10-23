import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '../lib/format'

type RevealProps = {
  children: ReactNode
  className?: string
  /** Décalage en millisecondes, pour un effet en cascade. */
  delay?: number
  as?: 'div' | 'section' | 'li' | 'article' | 'header'
}

/**
 * Fait apparaître son contenu à l'entrée dans la fenêtre.
 * Sans JavaScript, sur petit écran, ou si l'observateur tarde, un filet de
 * sécurité rend toujours l'élément visible : aucun contenu ne peut rester masqué.
 */
export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      node.classList.add('is-visible')
      return
    }

    const revealNow = () => {
      window.setTimeout(() => node.classList.add('is-visible'), delay)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            revealNow()
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -20px 0px', threshold: 0.02 },
    )

    observer.observe(node)
    // Filet de sécurité : garantit qu'aucune carte de service ne reste jamais invisible.
    const safetyTimer = window.setTimeout(() => node.classList.add('is-visible'), 1200 + delay)

    return () => {
      observer.disconnect()
      window.clearTimeout(safetyTimer)
    }
  }, [delay])

  const Tag = as as 'div'
  return (
    <Tag ref={ref as never} data-reveal className={cn(className)}>
      {children}
    </Tag>
  )
}
