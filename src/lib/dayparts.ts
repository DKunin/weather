import type { Forecast } from './types'

const DAYPARTS = [
  { label: 'Morning', time: '06:00' },
  { label: 'Midday', time: '12:00' },
  { label: 'Evening', time: '18:00' },
  { label: 'Night', time: '23:00' },
] as const

export function getTodayDayparts(forecast: Forecast) {
  const today = forecast.daily.time[0]

  return DAYPARTS.map((daypart) => {
    const index = forecast.hourly.time.indexOf(`${today}T${daypart.time}`)
    return {
      ...daypart,
      temperature: index >= 0 ? forecast.hourly.temperature_2m[index] : null,
    }
  })
}
