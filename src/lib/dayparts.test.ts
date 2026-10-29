import { describe, expect, it } from 'vitest'
import { getForecastDayparts, getTodayDayparts } from './dayparts'
import type { Forecast } from './types'

describe('getTodayDayparts', () => {
  it('selects representative temperatures from the city-local current day', () => {
    const forecast = {
      daily: { time: ['2026-10-29'] },
      hourly: {
        time: [
          '2026-10-29T06:00',
          '2026-10-29T12:00',
          '2026-10-29T18:00',
          '2026-10-29T23:00',
        ],
        temperature_2m: [4.1, 9.8, 6.3, 2.7],
      },
    } as Forecast

    expect(getTodayDayparts(forecast).map(({ temperature }) => temperature)).toEqual([
      4.1, 9.8, 6.3, 2.7,
    ])
  })

  it('selects morning, midday, and night for an individual forecast date', () => {
    const forecast = {
      daily: { time: ['2026-10-29', '2026-10-30'] },
      hourly: {
        time: [
          '2026-10-30T06:00',
          '2026-10-30T12:00',
          '2026-10-30T23:00',
        ],
        temperature_2m: [5.4, 11.2, 7.1],
      },
    } as Forecast

    expect(getForecastDayparts(forecast, '2026-10-30')).toEqual([
      { label: 'Morning', time: '06:00', temperature: 5.4 },
      { label: 'Midday', time: '12:00', temperature: 11.2 },
      { label: 'Night', time: '23:00', temperature: 7.1 },
    ])
  })
})
