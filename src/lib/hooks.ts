import { useEffect, useState } from 'react'
import { api } from './api'

interface QueryState<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

/** Chargement simple avec annulation (AbortController) et rechargement manuel. */
export function useApiQuery<T>(path: string | null): QueryState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(Boolean(path))
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!path) {
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    api
      .get<T>(path, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Chargement impossible.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [path, tick])

  return { data, loading, error, reload: () => setTick((value) => value + 1) }
}
