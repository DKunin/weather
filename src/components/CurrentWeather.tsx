import { Droplets, Sun, Wind } from 'lucide-react'
import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { temperature, windSpeed } from '../lib/format'
import { getTodayDayparts } from '../lib/dayparts'
import type { Forecast, UnitSystem } from '../lib/types'
import { weatherIcon, weatherLabel } from '../lib/weather'

type CurrentWeatherProps = {
  forecast: Forecast
  units: UnitSystem
}

export function CurrentWeather({ forecast, units }: CurrentWeatherProps) {
  const cardRef = useRef<HTMLElement>(null)
  const { current, daily } = forecast
  const dayparts = getTodayDayparts(forecast)
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

  const resetParallax = () => {
    const card = cardRef.current
    if (!card) return
    for (const property of ['--sky-x', '--sky-y', '--foreground-x', '--foreground-y', '--tilt-x', '--tilt-y']) {
      card.style.removeProperty(property)
    }
  }

  const updateParallax = (event: ReactPointerEvent<HTMLElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    const card = event.currentTarget
    card.style.setProperty('--sky-x', `${x * 12}px`)
    card.style.setProperty('--sky-y', `${y * 8}px`)
    card.style.setProperty('--foreground-x', `${x * -5}px`)
    card.style.setProperty('--foreground-y', `${y * -4}px`)
    card.style.setProperty('--tilt-x', `${y * -1.1}deg`)
    card.style.setProperty('--tilt-y', `${x * 1.1}deg`)
  }

  return (
    <section
      className="current-card"
      aria-labelledby="current-condition"
      onPointerCancel={resetParallax}
      onPointerLeave={resetParallax}
      onPointerMove={updateParallax}
      ref={cardRef}
    >
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
      <div className="dayparts" aria-label="Today's temperatures by time of day">
        {dayparts.map(({ label, time, temperature: value }) => (
          <div className="daypart" key={label}>
            <span>{label}</span>
            <strong>{value === null ? '—' : temperature(value, units)}</strong>
            <small>{time}</small>
          </div>
        ))}
      </div>
    </section>
  )
}
