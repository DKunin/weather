import { Droplets, Wind } from 'lucide-react'
import { getForecastDayparts } from '../lib/dayparts'
import { dayName, temperature, windSpeed } from '../lib/format'
import type { Forecast, UnitSystem } from '../lib/types'
import { weatherIcon, weatherLabel } from '../lib/weather'

type ForecastsProps = {
  forecast: Forecast
  units: UnitSystem
}

export function ThreeDayForecast({ forecast, units }: ForecastsProps) {
  return (
    <div className="three-day-grid">
      {forecast.daily.time.slice(0, 3).map((date, index) => {
        const dayparts = getForecastDayparts(forecast, date)
        return <article className="forecast-card" key={date}>
          <h3>{dayName(date)}</h3>
          <div className="forecast-main">
            <img alt={weatherLabel(forecast.daily.weather_code[index])} src={weatherIcon(forecast.daily.weather_code[index])} />
            <div>
              <strong>{temperature(forecast.daily.temperature_2m_max[index], units)}</strong>
              <span>{temperature(forecast.daily.temperature_2m_min[index], units)}</span>
            </div>
          </div>
          <div className="forecast-dayparts" aria-label={`${dayName(date, true)} weather and temperatures by time of day`}>
            {dayparts.map(({ label, temperature: value, weatherCode, isDay }) => (
              <div className="forecast-daypart" key={label}>
                <small>{label}</small>
                <div className="forecast-daypart-value">
                  {weatherCode !== null && (
                    <img
                      alt={weatherLabel(weatherCode)}
                      src={weatherIcon(weatherCode, isDay ?? true)}
                    />
                  )}
                  <strong>{value === null ? '—' : temperature(value, units)}</strong>
                </div>
              </div>
            ))}
          </div>
          <div className="forecast-meta">
            <span><Droplets aria-hidden="true" />{forecast.daily.precipitation_probability_max[index] ?? 0}%</span>
            <span><Wind aria-hidden="true" />{windSpeed(forecast.daily.wind_speed_10m_max[index], units)}</span>
          </div>
        </article>
      })}
    </div>
  )
}

export function WeekForecast({ forecast, units }: ForecastsProps) {
  return (
    <section className="week-panel" aria-labelledby="week-heading">
      <h2 id="week-heading">7-day outlook</h2>
      <div className="week-grid">
        {forecast.daily.time.map((date, index) => (
          <article className="week-day" key={date}>
            <h3>{dayName(date)}</h3>
            <img alt={weatherLabel(forecast.daily.weather_code[index])} src={weatherIcon(forecast.daily.weather_code[index])} />
            <div className="week-temperatures">
              <strong>{temperature(forecast.daily.temperature_2m_max[index], units)}</strong>
              <span>{temperature(forecast.daily.temperature_2m_min[index], units)}</span>
            </div>
            <span className="week-rain"><Droplets aria-hidden="true" />{forecast.daily.precipitation_probability_max[index] ?? 0}%</span>
          </article>
        ))}
      </div>
    </section>
  )
}
