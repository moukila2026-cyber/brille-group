import { cn } from '../lib/format'

const PATHS: Record<string, string> = {
  building: 'M4 21V6a2 2 0 012-2h6a2 2 0 012 2v15M14 21V10h4a2 2 0 012 2v9M3 21h18M7 8h2M7 12h2M7 16h2M17 14h1M17 18h1',
  map: 'M9 4l6 2 5-2v14l-5 2-6-2-5 2V6l5-2zM9 4v14M15 6v14',
  compass: 'M12 21a9 9 0 100-18 9 9 0 000 18zM14.8 9.2l-1.6 4.4-4.4 1.6 1.6-4.4 4.4-1.6z',
  home: 'M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-9.5z',
  graduation: 'M22 9l-10-5L2 9l10 5 10-5zM6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5',
  sparkles: 'M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3zM18.5 15l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9.9-2.3z',
  leaf: 'M20 4c-8 0-14 4-14 11a5 5 0 0010 0c0-5 0-8 4-11zM6 20c2-5 5-8 10-10',
  monitor: 'M4 5h16v10H4V5zm5 15h6M12 15v5',
  card: 'M3 7h18v10H3V7zm0 4h18M6.5 15h3',
  truck: 'M3 7h11v9H3V7zm11 3h4l3 3v3h-7v-6zM7 19a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z',
  scissors: 'M6 7a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm0 15a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm2-6.5L20 4M8 9.5L20 20',
  phone: 'M6.5 3h3l1.5 4-2 1.5a12 12 0 006.5 6.5L17 13l4 1.5v3a2 2 0 01-2.2 2A17 17 0 014.5 5.2 2 2 0 016.5 3z',
  check: 'M5 13l4 4L19 7',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z',
  pin: 'M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0-13v5l3 2',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  spark: 'M12 2l2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2L12 2z',
  layers: 'M12 3l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 16l9 5 9-5',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-3.3 3.6-6 8-6s8 2.7 8 6',
  file: 'M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5zM14 3v5h5M9 13h6M9 17h4',
}

export function Icon({ name, className }: { name: string; className?: string }) {
  const path = PATHS[name] ?? PATHS.building
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('h-5 w-5', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}
