/**
 * Serveur de développement : API Node + Vite en middleware, sur un seul port.
 * Lancement : npm run dev
 */
import http from 'node:http'
import { createServer as createViteServer } from 'vite'
import { handleApi } from './app.js'

const port = Number(process.env.PORT ?? 3000)

async function main() {
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: { server: undefined } },
    appType: 'spa',
  })

  const server = http.createServer(async (req, res) => {
    const url = req.url ?? '/'
    if (url.startsWith('/api')) {
      const handled = await handleApi(req, res)
      if (!handled) {
        res.statusCode = 404
        res.end('Not found')
      }
      return
    }
    vite.middlewares(req, res, () => {
      res.statusCode = 404
      res.end('Not found')
    })
  })

  server.listen(port, '0.0.0.0', () => {
    console.log(`\n  BRILLE GROUP — serveur de développement`)
    console.log(`  ➜  http://localhost:${port}`)
    console.log(`  ➜  API : http://localhost:${port}/api/health\n`)
  })
}

main().catch((error) => {
  console.error('[dev] démarrage impossible', error)
  process.exit(1)
})
