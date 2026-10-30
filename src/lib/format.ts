import type { UnitSystem } from './types'

export function temperature(value: number, units: UnitSystem) {
  const converted = units === 'imperial' ? (value * 9) / 5 + 32 : value
  return `${Math.round(converted)}°`
}

export function windSpeed(value: number, units: UnitSystem) {
  const converted = units === 'imperial' ? value * 0.621371 : value
  return `${Math.round(converted)} ${units === 'imperial' ? 'mph' : 'km/h'}`
}

export function dayName(date: string, long = false) {
  return new Intl.DateTimeFormat('en', {
    weekday: long ? 'long' : 'short',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))
}

export function relativeUpdate(timestamp: Date, prefix = 'Updated') {
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp.getTime()) / 60_000))
  if (minutes < 1) return `${prefix} just now`
  if (minutes === 1) return `${prefix} 1 min ago`
  return `${prefix} ${minutes} min ago`
}
