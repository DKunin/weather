import { describe, expect, it } from 'vitest'
import { getTodayDayparts } from './dayparts'
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
})
