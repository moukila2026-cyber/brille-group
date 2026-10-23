/**
 * Routeur minimaliste (aucune dépendance). Les routes sont déclarées avec des
 * paramètres nommés, ex. `/api/admin/services/:id`.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { HttpError, json } from './http.js'

export type RouteContext = {
  req: IncomingMessage
  res: ServerResponse
  params: Record<string, string>
  url: URL
}

export type Handler = (ctx: RouteContext) => Promise<void>

type Route = {
  method: string
  regex: RegExp
  keys: string[]
  handler: Handler
}

function compile(path: string): { regex: RegExp; keys: string[] } {
  const keys: string[] = []
  const pattern = path
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        keys.push(segment.slice(1))
        return '([^/]+)'
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')
  return { regex: new RegExp(`^${pattern}$`), keys }
}

export class Router {
  private routes: Route[] = []

  add(method: string, path: string, handler: Handler) {
    const { regex, keys } = compile(path)
    this.routes.push({ method, regex, keys, handler })
    return this
  }

  get(path: string, handler: Handler) {
    return this.add('GET', path, handler)
  }
  post(path: string, handler: Handler) {
    return this.add('POST', path, handler)
  }
  patch(path: string, handler: Handler) {
    return this.add('PATCH', path, handler)
  }
  put(path: string, handler: Handler) {
    return this.add('PUT', path, handler)
  }
  delete(path: string, handler: Handler) {
    return this.add('DELETE', path, handler)
  }

  async dispatch(method: string, pathname: string, req: IncomingMessage, res: ServerResponse, url: URL) {
    let matchedPath = false
    for (const route of this.routes) {
      const match = route.regex.exec(pathname)
      if (!match) continue
      matchedPath = true
      if (route.method !== method && !(method === 'HEAD' && route.method === 'GET')) continue
      const params: Record<string, string> = {}
      route.keys.forEach((key, index) => {
        params[key] = decodeURIComponent(match[index + 1] ?? '')
      })
      await route.handler({ req, res, params, url })
      return true
    }
    if (matchedPath) throw new HttpError(405, 'Méthode non autorisée.', 'method_not_allowed')
    return false
  }
}

export function sendJson(res: ServerResponse, status: number, data: unknown) {
  json(res, status, data)
}
