import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from './api'
import { DEFAULT_SITE_DATA } from './default-site-data'
import type { PublicSiteData, ServiceDTO, SiteSettings } from './types'

interface SiteContextValue {
  loading: boolean
  error: string | null
  settings: SiteSettings
  services: ServiceDTO[]
  coreServices: ServiceDTO[]
  complementaryServices: ServiceDTO[]
  capabilities: PublicSiteData['capabilities']
  reload: () => void
}

const SiteContext = createContext<SiteContextValue | null>(null)

export function SiteProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PublicSiteData>(DEFAULT_SITE_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    /**
     * Message toujours lisible : on ne laisse jamais remonter un objet brut
     * (« [object Object] ») à l'écran.
     */
    const messageLisible = (err: unknown): string => {
      if (typeof err === 'string') return err
      if (err instanceof Error && err.message) return err.message
      return 'Le contenu du site n’a pas pu être actualisé.'
    }

    /** Deux tentatives : la première requête réveille parfois une base Neon en veille. */
    const charger = async (tentative: number): Promise<void> => {
      try {
        const result = await api.get<PublicSiteData>('/api/public/site', controller.signal)
        if (!controller.signal.aborted) {
          setData({
            settings: { ...DEFAULT_SITE_DATA.settings, ...result.settings },
            services: result.services.length > 0 ? result.services : DEFAULT_SITE_DATA.services,
            capabilities: result.capabilities,
          })
          setLoading(false)
        }
      } catch (err) {
        if (controller.signal.aborted) return
        if (tentative < 2) {
          window.setTimeout(() => {
            if (!controller.signal.aborted) void charger(tentative + 1)
          }, 1200)
          return
        }
        setError(messageLisible(err))
        setLoading(false)
      }
    }

    void charger(1)
    return () => controller.abort()
  }, [tick])

  const value = useMemo<SiteContextValue>(() => {
    const services = data.services
    return {
      loading,
      error,
      settings: data.settings,
      services,
      coreServices: services.filter((service) => service.isCore),
      complementaryServices: services.filter((service) => !service.isCore),
      capabilities: data.capabilities,
      reload,
    }
  }, [data, loading, error, reload])

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite(): SiteContextValue {
  const context = useContext(SiteContext)
  if (!context) throw new Error('useSite doit être utilisé dans <SiteProvider>.')
  return context
}

/** Raccourci pour lire un paramètre texte du site. */
export function useSetting(key: string, fallback = ''): string {
  const { settings } = useSite()
  const value = settings[key]
  return typeof value === 'string' && value.trim() !== '' ? value : fallback
}
