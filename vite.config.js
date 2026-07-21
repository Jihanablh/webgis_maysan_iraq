import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function manualChunks(id) {
  if (!id.includes('node_modules')) return undefined
  if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react-vendor'
  if (id.includes('node_modules/framer-motion/')) return 'motion'
  if (id.includes('node_modules/lucide-react/')) return 'icons'
  if (id.includes('node_modules/recharts/')) return 'charts-core'
  if (/node_modules\/(victory-vendor|d3-|decimal\.js-light|react-redux|redux|reselect|immer|es-toolkit|tiny-invariant)\//.test(id)) return 'charts-vendor'
  return undefined
}

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: { manualChunks },
    },
  },
  preview: {
    allowedHosts: ['maysan.test', 'localhost', '127.0.0.1'],
  },
})
