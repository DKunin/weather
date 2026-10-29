import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildLocationsUrl,
  buildWeatherUrl,
  requestJson,
} from './weather.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const port = Number(process.env.PORT || 4175)
const appVersion = process.env.APP_VERSION || 'development'
const proxyUrl = process.env.WEATHER_SOCKS_PROXY || ''
const app = express()

const cache = new Map()
const rateWindows = new Map()

function readCache(key) {
  const entry = cache.get(key)
  if (!entry || entry.expiresAt <= Date.now()) {
    cache.delete(key)
    return undefined
  }
  return entry.value
}

function writeCache(key, value, ttlMs) {
  if (cache.size >= 200) {
    const oldest = cache.keys().next().value
    if (oldest) cache.delete(oldest)
  }
  cache.set(key, { value, expiresAt: Date.now() + ttlMs })
}

function rateLimit(req, res, next) {
  const key = req.ip || req.socket.remoteAddress || 'unknown'
  const now = Date.now()
  const window = rateWindows.get(key)
  if (!window || window.resetAt <= now) {
    rateWindows.set(key, { count: 1, resetAt: now + 60_000 })
    next()
    return
  }
  window.count += 1
  if (window.count > 90) {
    res.set('Retry-After', String(Math.ceil((window.resetAt - now) / 1000)))
    res.status(429).json({ error: 'Too many weather requests. Please try again shortly.' })
    return
  }
  next()
}

function securityHeaders(_req, res, next) {
  res.set({
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
  })
  next()
}

app.set('trust proxy', 'loopback')
app.disable('x-powered-by')
app.use(securityHeaders)
app.use('/api', rateLimit)

app.get('/healthz', (_req, res) => {
  res.json({
    status: 'ok',
    version: appVersion,
    proxyConfigured: Boolean(proxyUrl),
  })
})

app.get('/api/locations', async (req, res) => {
  try {
    const url = buildLocationsUrl(req.query.q, String(req.query.language || 'en'))
    const cacheKey = `locations:${url.search}`
    const cached = readCache(cacheKey)
    if (cached) {
      res.set('X-Weather-Cache', 'HIT').json(cached)
      return
    }
    const data = await requestJson(url, { proxyUrl })
    const payload = { results: Array.isArray(data.results) ? data.results : [] }
    writeCache(cacheKey, payload, 24 * 60 * 60 * 1000)
    res.set('X-Weather-Cache', 'MISS').json(payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Location lookup failed.'
    const invalidInput = message.startsWith('City search')
    res.status(invalidInput ? 400 : 502).json({ error: message })
  }
})

app.get('/api/weather', async (req, res) => {
  try {
    const url = buildWeatherUrl(req.query.latitude, req.query.longitude)
    const cacheKey = `weather:${url.search}`
    const cached = readCache(cacheKey)
    if (cached) {
      res.set('X-Weather-Cache', 'HIT').json(cached)
      return
    }
    const data = await requestJson(url, { proxyUrl })
    writeCache(cacheKey, data, 10 * 60 * 1000)
    res.set('X-Weather-Cache', 'MISS').json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Weather lookup failed.'
    const invalidInput = message.startsWith('Latitude') || message.startsWith('Longitude')
    res.status(invalidInput ? 400 : 502).json({ error: message })
  }
})

app.use(express.static(distDir, {
  etag: true,
  maxAge: '1h',
  setHeaders(res, filePath) {
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    }
  },
}))

app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) {
    next()
    return
  }
  res.sendFile(path.join(distDir, 'index.html'))
})

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

app.listen(port, '127.0.0.1', () => {
  console.log(JSON.stringify({ event: 'weather.started', port, version: appVersion, proxyConfigured: Boolean(proxyUrl) }))
})
