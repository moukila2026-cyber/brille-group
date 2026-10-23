/** Utilitaires de formatage et de liens. */

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}

/** 12 500 000 -> « 12 500 000 FCFA » */
export function formatFcfa(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'Prix sur demande'
  return `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`
}

export function formatArea(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'Superficie non précisée'
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value)} m²`
}

export function formatDate(iso: string | null | undefined, withTime = true): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date)
}

/** Ne garde que les chiffres pour les liens tel:. */
export function telHref(phone: string): string {
  const cleaned = phone.replace(/[^+0-9]/g, '')
  return `tel:${cleaned}`
}

/**
 * Lien WhatsApp. Retourne null si aucun numéro n'a été confirmé :
 * on ne fabrique jamais un numéro à partir du numéro fixe.
 */
export function whatsappHref(rawNumber: string | undefined, message?: string): string | null {
  const digits = (rawNumber ?? '').replace(/[^0-9]/g, '')
  if (digits.length < 8) return null
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digits}${text}`
}

export function truncate(value: string, max: number): string {
  if (value.length <= max) return value
  return `${value.slice(0, max).trimEnd()}…`
}

export const SERVICE_TYPE_OPTIONS = [
  { value: 'amenagement_foncier', label: 'Aménagement foncier' },
  { value: 'construction_btp', label: 'Construction / BTP' },
  { value: 'topographie', label: 'Topographie' },
  { value: 'immobilier_terrain', label: 'Immobilier / vente de terrains' },
  { value: 'conseils', label: 'Conseils' },
  { value: 'formation', label: 'Formation' },
  { value: 'nettoyage', label: 'Nettoyage industriel & Hygiène 3D (dératisation, désinfection…)' },
  { value: 'autre', label: 'Autre' },
] as const

/** Nom de fichier horodaté pour les exports. */
export function downloadCsvName(prefix = 'demandes-devis-brille-group'): string {
  return `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`
}
