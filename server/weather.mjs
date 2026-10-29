import https from 'node:https'
import { SocksProxyAgent } from 'socks-proxy-agent'

const ALLOWED_HOSTS = new Set([
  'api.open-meteo.com',
  'geocoding-api.open-meteo.com',
])

export function parseCoordinates(latitude, longitude) {
  const lat = Number(latitude)
  const lon = Number(longitude)
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90.')
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    throw new Error('Longitude must be between -180 and 180.')
  }
  return { lat, lon }
}

export function buildLocationsUrl(query, language = 'en') {
  const normalized = String(query ?? '').trim()
  if (normalized.length < 2 || normalized.length > 80) {
    throw new Error('City search must contain between 2 and 80 characters.')
  }
  const safeLanguage = /^[a-z]{2}$/.test(language) ? language : 'en'
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.search = new URLSearchParams({
    name: normalized,
    count: '6',
    language: safeLanguage,
    format: 'json',
  }).toString()
  return url
}

export function buildWeatherUrl(latitude, longitude) {
  const { lat, lon } = parseCoordinates(latitude, longitude)
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.search = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'is_day',
    ].join(','),
    hourly: 'temperature_2m',
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'uv_index_max',
      'sunrise',
      'sunset',
    ].join(','),
    timezone: 'auto',
    forecast_days: '7',
  }).toString()
  return url
}

export function requestJson(url, { proxyUrl, timeoutMs = 15_000 } = {}) {
  if (!(url instanceof URL) || !ALLOWED_HOSTS.has(url.hostname)) {
    return Promise.reject(new Error('Weather upstream is not allowed.'))
  }

  const agent = proxyUrl ? new SocksProxyAgent(proxyUrl) : undefined
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      agent,
      headers: {
        accept: 'application/json',
        'user-agent': 'weather.kunini.ru/0.1 (+https://github.com/DKunin/weather)',
      },
      timeout: timeoutMs,
    }, (response) => {
      let body = ''
      response.setEncoding('utf8')
      response.on('data', (chunk) => {
        body += chunk
        if (body.length > 2_000_000) {
          request.destroy(new Error('Weather upstream response is too large.'))
        }
      })
      response.on('end', () => {
        if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`Weather upstream returned ${response.statusCode ?? 'no status'}.`))
          return
        }
        try {
          resolve(JSON.parse(body))
        } catch {
          reject(new Error('Weather upstream returned invalid JSON.'))
        }
      })
    })
    request.on('timeout', () => request.destroy(new Error('Weather upstream timed out.')))
    request.on('error', reject)
  })
}
