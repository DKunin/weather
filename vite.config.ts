import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:4175',
      '/healthz': 'http://127.0.0.1:4175',
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'server/**/*.test.mjs'],
  },
})
