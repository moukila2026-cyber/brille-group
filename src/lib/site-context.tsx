import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from './api'
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
  const [data, setData] = useState<PublicSiteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    api
      .get<PublicSiteData>('/api/public/site', controller.signal)
      .then((result) => setData(result))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Chargement impossible.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [tick])

  const value = useMemo<SiteContextValue>(() => {
    const services = data?.services ?? []
    return {
      loading,
      error,
      settings: data?.settings ?? {},
      services,
      coreServices: services.filter((service) => service.isCore),
      complementaryServices: services.filter((service) => !service.isCore),
      capabilities: data?.capabilities ?? {
        hasProperties: false,
        hasProjects: false,
        hasCourses: false,
        whatsappConfigured: false,
      },
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
