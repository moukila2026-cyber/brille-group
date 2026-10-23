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
 * Sans JavaScript, ou si l'utilisateur a réduit les animations, le contenu
 * reste immédiatement visible : aucun texte ne peut être perdu.
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

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement
            window.setTimeout(() => target.classList.add('is-visible'), delay)
            observer.unobserve(target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [delay])

  const Tag = as as 'div'
  return (
    <Tag ref={ref as never} data-reveal className={cn(className)}>
      {children}
    </Tag>
  )
}
