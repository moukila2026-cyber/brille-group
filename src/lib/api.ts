/**
 * Client HTTP unique. Tous les appels passent par /api (même origine).
 * Les mutations ajoutent l'en-tête X-BG-Request attendu par le serveur (anti-CSRF).
 */
export class ApiError extends Error {
  status: number
  code: string
  fields?: Record<string, string[]>

  constructor(message: string, status: number, code = 'error', fields?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const method = options.method ?? 'GET'
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (method !== 'GET') headers['X-BG-Request'] = '1'

  let response: Response
  try {
    response = await fetch(path, {
      method,
      headers,
      credentials: 'same-origin',
      signal: options.signal,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    if (options.signal?.aborted) throw options.signal.reason
    throw new ApiError(
      'Connexion impossible. Vérifiez votre réseau puis réessayez.',
      0,
      'network_error',
    )
  }

  if (response.status === 204) return undefined as T

  const text = await response.text()
  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    const data = (payload ?? {}) as { error?: string; code?: string; fields?: Record<string, string[]> }
    throw new ApiError(
      data.error ?? `Erreur ${response.status}. Merci de réessayer.`,
      response.status,
      data.code ?? 'error',
      data.fields,
    )
  }

  return payload as T
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string, body?: unknown) => request<T>(path, { method: 'DELETE', body }),
}

/** Téléchargement d'un fichier protégé (export CSV) via fetch + blob. */
export async function downloadAuthenticated(path: string, filename: string) {
  const response = await fetch(path, { credentials: 'same-origin', headers: { 'X-BG-Request': '1' } })
  if (!response.ok) {
    throw new ApiError('Export impossible.', response.status)
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
