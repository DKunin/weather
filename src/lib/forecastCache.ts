import type { Forecast, Place } from './types'

const STORAGE_KEY = 'weather:forecast-cache:v1'
const MAX_ENTRIES = 6

type CacheEntry = {
  forecast: Forecast
  savedAt: number
}

type ForecastCache = Record<string, CacheEntry>
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

function cacheKey(place: Place) {
  return `${place.latitude.toFixed(4)},${place.longitude.toFixed(4)}`
}

function isNumberArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === 'number')
}

function isNullableNumberArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => item === null || typeof item === 'number')
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isForecast(value: unknown): value is Forecast {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<Forecast>
  const current = candidate.current as Forecast['current'] | undefined
  const hourly = candidate.hourly as Forecast['hourly'] | undefined
  const daily = candidate.daily as Forecast['daily'] | undefined

  return (
    typeof candidate.latitude === 'number'
    && typeof candidate.longitude === 'number'
    && typeof candidate.timezone === 'string'
    && Boolean(current)
    && typeof current?.time === 'string'
    && typeof current?.temperature_2m === 'number'
    && typeof current?.apparent_temperature === 'number'
    && typeof current?.relative_humidity_2m === 'number'
    && typeof current?.weather_code === 'number'
    && typeof current?.wind_speed_10m === 'number'
    && typeof current?.wind_direction_10m === 'number'
    && typeof current?.is_day === 'number'
    && isStringArray(hourly?.time)
    && isNumberArray(hourly?.temperature_2m)
    && isNumberArray(hourly?.weather_code)
    && isNumberArray(hourly?.is_day)
    && [
      hourly.temperature_2m,
      hourly.weather_code,
      hourly.is_day,
    ].every((items) => items.length === hourly.time.length)
    && isStringArray(daily?.time)
    && daily.time.length > 0
    && isNumberArray(daily?.weather_code)
    && isNumberArray(daily?.temperature_2m_max)
    && isNumberArray(daily?.temperature_2m_min)
    && isNullableNumberArray(daily?.precipitation_probability_max)
    && isNumberArray(daily?.wind_speed_10m_max)
    && isNullableNumberArray(daily?.uv_index_max)
    && isStringArray(daily?.sunrise)
    && isStringArray(daily?.sunset)
    && [
      daily.weather_code,
      daily.temperature_2m_max,
      daily.temperature_2m_min,
      daily.precipitation_probability_max,
      daily.wind_speed_10m_max,
      daily.uv_index_max,
      daily.sunrise,
      daily.sunset,
    ].every((items) => items.length === daily.time.length)
  )
}

function readCache(storage: StorageLike): ForecastCache {
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || '{}') as ForecastCache
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function readCachedForecast(place: Place, storage: StorageLike = localStorage) {
  const entry = readCache(storage)[cacheKey(place)]
  if (!entry || !Number.isFinite(entry.savedAt) || !isForecast(entry.forecast)) return null
  return entry
}

export function writeCachedForecast(
  place: Place,
  forecast: Forecast,
  savedAt = Date.now(),
  storage: StorageLike = localStorage,
) {
  try {
    const entries = Object.entries({
      ...readCache(storage),
      [cacheKey(place)]: { forecast, savedAt },
    })
      .sort(([, left], [, right]) => right.savedAt - left.savedAt)
      .slice(0, MAX_ENTRIES)

    storage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)))
  } catch {
    // Storage can be unavailable in private browsing; weather still works online.
  }
}
