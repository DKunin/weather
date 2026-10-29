import { describe, expect, it } from 'vitest'
import {
  buildLocationsUrl,
  buildWeatherUrl,
  parseCoordinates,
} from './weather.mjs'

describe('weather upstream URL builders', () => {
  it('normalizes a city lookup without exposing arbitrary hosts', () => {
    const url = buildLocationsUrl('  Berlin  ', 'en')
    expect(url.hostname).toBe('geocoding-api.open-meteo.com')
    expect(url.searchParams.get('name')).toBe('Berlin')
    expect(url.searchParams.get('count')).toBe('6')
  })

  it('builds one seven-day forecast payload', () => {
    const url = buildWeatherUrl(52.52437, 13.41053)
    expect(url.hostname).toBe('api.open-meteo.com')
    expect(url.searchParams.get('forecast_days')).toBe('7')
    expect(url.searchParams.get('timezone')).toBe('auto')
    expect(url.searchParams.get('daily')).toContain('precipitation_probability_max')
  })

  it('rejects invalid coordinates and short searches', () => {
    expect(() => parseCoordinates(91, 0)).toThrow('Latitude')
    expect(() => parseCoordinates(0, -181)).toThrow('Longitude')
    expect(() => buildLocationsUrl('x')).toThrow('between 2 and 80')
  })
})

