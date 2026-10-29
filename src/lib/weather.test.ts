import { describe, expect, it } from 'vitest'
import { temperature, windSpeed } from './format'
import { weatherLabel } from './weather'

describe('weather presentation helpers', () => {
  it('maps WMO codes to readable labels', () => {
    expect(weatherLabel(2)).toBe('Partly cloudy')
    expect(weatherLabel(63)).toBe('Rain')
    expect(weatherLabel(95)).toBe('Thunderstorms')
  })

  it('converts metric values only for imperial display', () => {
    expect(temperature(10, 'metric')).toBe('10°')
    expect(temperature(10, 'imperial')).toBe('50°')
    expect(windSpeed(16.1, 'imperial')).toBe('10 mph')
  })
})

