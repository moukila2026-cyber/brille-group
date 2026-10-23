/**
 * Paramètres du site (clé/valeur JSON) avec valeurs par défaut sûres.
 * Seules les clés listées dans PUBLIC_SETTING_KEYS sont exposées publiquement.
 */
import { query } from './db.js'

export const PUBLIC_SETTING_KEYS = [
  'company_name',
  'company_short_name',
  'tagline',
  'legal_form',
  'phone_primary',
  'phone_secondary',
  'phone_third',
  'whatsapp_number',
  'whatsapp_enabled',
  'email_primary',
  'address_line',
  'city',
  'region',
  'country',
  'intervention_area',
  'opening_hours',
  'facebook_url',
  'linkedin_url',
  'instagram_url',
  'tiktok_url',
  'website_url',
  'legal_rcm',
  'legal_cc',
  'legal_text',
  'about_intro',
  'about_mission',
  'about_vision',
  'values_json',
  'seo_default_title',
  'seo_default_description',
  'hero_title',
  'hero_subtitle',
  'foncier_warning',
  'maintenance_mode',
] as const

export type SettingsMap = Record<string, unknown>

export async function getAllSettings(): Promise<SettingsMap> {
  const rows = await query<{ key: string; value: unknown }>('SELECT key, value FROM site_settings')
  const map: SettingsMap = {}
  for (const row of rows) map[row.key] = row.value
  return map
}

export async function getPublicSettings(): Promise<SettingsMap> {
  const map = await getAllSettings()
  const out: SettingsMap = {}
  for (const key of PUBLIC_SETTING_KEYS) {
    if (key in map) out[key] = map[key]
  }
  return out
}

/** Écriture transactionnelle d'un lot de paramètres. */
export async function saveSettings(entries: Record<string, unknown>) {
  for (const [key, value] of Object.entries(entries)) {
    if (!/^[a-z0-9_]{2,64}$/.test(key)) continue
    await query(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2::jsonb)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [key, JSON.stringify(value ?? null)],
    )
  }
}

/** Accès typé à une valeur texte. */
export function asString(settings: SettingsMap, key: string, fallback = ''): string {
  const value = settings[key]
  return typeof value === 'string' ? value : fallback
}
