import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'pwa-icon.svg', 'sky-clouds.jpg'],
      manifest: {
        name: 'Weather',
        short_name: 'Weather',
        description: 'Current weather and a focused seven-day forecast for your saved city.',
        theme_color: '#f4f9fd',
        background_color: '#eef7fc',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/healthz$/],
        globPatterns: ['**/*.{html,js,css,png,jpg,svg}'],
        runtimeCaching: [
          {
            urlPattern: /\/api\/weather(?:\?.*)?$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-api-v1',
              networkTimeoutSeconds: 2,
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 8,
                maxAgeSeconds: 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /\/api\/locations(?:\?.*)?$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-locations-v1',
              networkTimeoutSeconds: 3,
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
    }),
  ],
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
