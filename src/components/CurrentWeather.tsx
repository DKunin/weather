import { Droplets, Sun, Wind } from 'lucide-react'
import { temperature, windSpeed } from '../lib/format'
import type { Forecast, UnitSystem } from '../lib/types'
import { weatherIcon, weatherLabel } from '../lib/weather'

type CurrentWeatherProps = {
  forecast: Forecast
  units: UnitSystem
}

export function CurrentWeather({ forecast, units }: CurrentWeatherProps) {
  const { current, daily } = forecast
  const metrics = [
    {
      label: 'Precipitation',
      value: `${daily.precipitation_probability_max[0] ?? 0}%`,
      icon: Droplets,
    },
    { label: 'Wind', value: windSpeed(current.wind_speed_10m, units), icon: Wind },
    { label: 'Humidity', value: `${current.relative_humidity_2m}%`, icon: Droplets },
    { label: 'UV', value: `${Math.round(daily.uv_index_max[0] ?? 0)}`, icon: Sun },
  ]

  return (
    <section className="current-card" aria-labelledby="current-condition">
      <div className="current-icon-wrap">
        <img
          alt=""
          className="current-icon"
          src={weatherIcon(current.weather_code, current.is_day === 1)}
        />
      </div>
      <div className="current-summary">
        <div className="current-temperature">{temperature(current.temperature_2m, units)}</div>
        <div className="feels-like">Feels like {temperature(current.apparent_temperature, units)}</div>
        <h1 id="current-condition">{weatherLabel(current.weather_code)}</h1>
        <div className="high-low">
          H {temperature(daily.temperature_2m_max[0], units)}
          <span>L {temperature(daily.temperature_2m_min[0], units)}</span>
        </div>
      </div>
      <div className="current-metrics">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div className="metric" key={label}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

