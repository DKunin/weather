import { describe, expect, it } from 'vitest'
import type { Forecast, Place } from './types'
import { readCachedForecast, writeCachedForecast } from './forecastCache'

const place: Place = {
  id: 1,
  name: 'Berlin',
  latitude: 52.52,
  longitude: 13.41,
  country: 'Germany',
  country_code: 'DE',
  timezone: 'Europe/Berlin',
}

const forecast = {
  latitude: 52.52,
  longitude: 13.41,
  timezone: 'Europe/Berlin',
  current: {
    time: '2026-10-30T12:00',
    temperature_2m: 12,
    apparent_temperature: 10,
    relative_humidity_2m: 70,
    weather_code: 2,
    wind_speed_10m: 8,
    wind_direction_10m: 180,
    is_day: 1,
  },
  current_units: {},
  hourly: { time: ['2026-10-30T12:00'], temperature_2m: [12] },
  hourly_units: {},
  daily: {
    time: ['2026-10-30'],
    weather_code: [2],
    temperature_2m_max: [14],
    temperature_2m_min: [7],
    precipitation_probability_max: [10],
    wind_speed_10m_max: [12],
    uv_index_max: [2],
    sunrise: ['2026-10-30T07:00'],
    sunset: ['2026-10-30T17:00'],
  },
  daily_units: {},
} satisfies Forecast

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  }
}

describe('forecast cache', () => {
  it('restores the last forecast for the same coordinates', () => {
    const storage = memoryStorage()
    writeCachedForecast(place, forecast, 1234, storage)

    expect(readCachedForecast(place, storage)).toEqual({ forecast, savedAt: 1234 })
  })

  it('does not return a forecast saved for another city', () => {
    const storage = memoryStorage()
    writeCachedForecast(place, forecast, 1234, storage)

    expect(readCachedForecast({ ...place, longitude: 13.5 }, storage)).toBeNull()
  })

  it('ignores malformed cached data', () => {
    const storage = memoryStorage()
    storage.setItem('weather:forecast-cache:v1', JSON.stringify({
      '52.5200,13.4100': { savedAt: 1234, forecast: { timezone: 'Europe/Berlin' } },
    }))

    expect(readCachedForecast(place, storage)).toBeNull()
  })
})
