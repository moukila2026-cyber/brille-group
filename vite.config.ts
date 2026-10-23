import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// Le serveur de développement (server/dev.ts) sert l'API et le front sur le même port.
// En production, Vercel sert le build statique et les fonctions du dossier /api.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    allowedHosts: true,
  },
  preview: { host: '0.0.0.0' },
  define: {
    // Garantit le build React de production même si NODE_ENV traîne dans l'environnement.
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
})
