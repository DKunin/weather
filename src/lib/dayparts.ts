import type { Forecast } from './types'

const TODAY_DAYPARTS = [
  { label: 'Morning', time: '06:00' },
  { label: 'Midday', time: '12:00' },
  { label: 'Evening', time: '18:00' },
  { label: 'Night', time: '23:00' },
] as const

const FORECAST_DAYPARTS = [
  { label: 'Morning', time: '06:00' },
  { label: 'Midday', time: '12:00' },
  { label: 'Night', time: '23:00' },
] as const

function getDayparts(
  forecast: Forecast,
  date: string,
  definitions: ReadonlyArray<{ label: string; time: string }>,
) {
  return definitions.map((daypart) => {
    const index = forecast.hourly.time.indexOf(`${date}T${daypart.time}`)

    return {
      ...daypart,
      temperature: index >= 0 ? forecast.hourly.temperature_2m[index] : null,
    }
  })
}

export function getTodayDayparts(forecast: Forecast) {
  return getDayparts(forecast, forecast.daily.time[0], TODAY_DAYPARTS)
}

export function getForecastDayparts(forecast: Forecast, date: string) {
  return getDayparts(forecast, date, FORECAST_DAYPARTS)
}
