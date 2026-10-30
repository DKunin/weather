import { ChevronDown, MapPin, Moon, RefreshCw, Star, Sun } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CurrentWeather } from './components/CurrentWeather'
import { ThreeDayForecast, WeekForecast } from './components/Forecasts'
import { SearchBox } from './components/SearchBox'
import { readCachedForecast, writeCachedForecast } from './lib/forecastCache'
import { relativeUpdate } from './lib/format'
import type { Forecast, Place, UnitSystem } from './lib/types'

const DEFAULT_PLACE: Place = {
  id: 2950159,
  name: 'Berlin',
  latitude: 52.52437,
  longitude: 13.41053,
  country: 'Germany',
  country_code: 'DE',
  admin1: 'State of Berlin',
  timezone: 'Europe/Berlin',
}

function readStoredPlace() {
  try {
    return JSON.parse(localStorage.getItem('weather:saved-place') || '') as Place
  } catch {
    return DEFAULT_PLACE
  }
}

function readStoredUnits(): UnitSystem {
  return localStorage.getItem('weather:units') === 'imperial' ? 'imperial' : 'metric'
}

function readStoredTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('weather:theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [place, setPlace] = useState<Place>(readStoredPlace)
  const [savedPlace, setSavedPlace] = useState<Place>(readStoredPlace)
  const [initialCache] = useState(() => readCachedForecast(place))
  const [units, setUnits] = useState<UnitSystem>(readStoredUnits)
  const [theme, setTheme] = useState<'light' | 'dark'>(readStoredTheme)
  const [forecast, setForecast] = useState<Forecast | null>(initialCache?.forecast ?? null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(() => initialCache ? new Date(initialCache.savedAt) : null)
  const [isCached, setIsCached] = useState(Boolean(initialCache))
  const [clock, setClock] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showWeek, setShowWeek] = useState(() => window.matchMedia('(min-width: 760px)').matches)

  const loadForecast = useCallback(async (target: Place, signal?: AbortSignal) => {
    const requestedAt = Date.now()
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        latitude: String(target.latitude),
        longitude: String(target.longitude),
      })
      const response = await fetch(`/api/weather?${params}`, { signal })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Weather is unavailable right now.')
      const responseDate = Date.parse(response.headers.get('date') || '')
      const savedAt = Number.isFinite(responseDate) ? Math.min(responseDate, Date.now()) : Date.now()
      setForecast(payload as Forecast)
      setUpdatedAt(new Date(savedAt))
      setIsCached(savedAt < requestedAt - 5_000)
      writeCachedForecast(target, payload as Forecast, savedAt)
    } catch (reason) {
      if (!(reason instanceof DOMException && reason.name === 'AbortError')) {
        setError(reason instanceof Error ? reason.message : 'Weather is unavailable right now.')
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const cached = readCachedForecast(place)
    setForecast(cached?.forecast ?? null)
    setUpdatedAt(cached ? new Date(cached.savedAt) : null)
    setIsCached(Boolean(cached))
    const controller = new AbortController()
    void loadForecast(place, controller.signal)
    return () => controller.abort()
  }, [loadForecast, place])

  useEffect(() => {
    const timer = window.setInterval(() => setClock((value) => value + 1), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('weather:theme', theme)
  }, [theme])

  const isSaved = useMemo(() => place.id === savedPlace.id, [place.id, savedPlace.id])
  const updatedLabel = updatedAt ? relativeUpdate(updatedAt, isCached ? 'Cached' : 'Updated') : 'Updating weather…'
  void clock

  const saveCurrent = () => {
    setSavedPlace(place)
    localStorage.setItem('weather:saved-place', JSON.stringify(place))
  }

  const changeUnits = (next: UnitSystem) => {
    setUnits(next)
    localStorage.setItem('weather:units', next)
  }

  return (
    <main className="page-shell">
      <section className="weather-app" aria-busy={loading}>
        <header className="topbar">
          <div className="place-title"><MapPin aria-hidden="true" /> <strong>{place.name}</strong></div>
          <SearchBox onSelect={setPlace} />
          <button
            className={`saved-place ${isSaved ? 'is-saved' : ''}`}
            onClick={isSaved ? () => setPlace(savedPlace) : saveCurrent}
            title={isSaved ? 'Saved city' : 'Save this city'}
            type="button"
          >
            <Star aria-hidden="true" fill={isSaved ? 'currentColor' : 'none'} />
            <span>{isSaved ? savedPlace.name : 'Save city'}</span>
          </button>
          <div className="unit-toggle" aria-label="Temperature units">
            <button className={units === 'metric' ? 'active' : ''} onClick={() => changeUnits('metric')} type="button">°C</button>
            <button className={units === 'imperial' ? 'active' : ''} onClick={() => changeUnits('imperial')} type="button">°F</button>
          </div>
          <button
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            className="theme-toggle"
            onClick={() => setTheme((value) => value === 'light' ? 'dark' : 'light')}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            type="button"
          >
            {theme === 'light' ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
          </button>
          <button aria-label={`${updatedLabel}. Refresh weather`} className="refresh" onClick={() => void loadForecast(place)} type="button">
            <RefreshCw aria-hidden="true" className={loading ? 'is-loading' : ''} />
            <span>{updatedLabel}</span>
          </button>
        </header>

        {error && (
          <div className="error-panel" role="alert">
            <div>
              <strong>{forecast ? 'Showing cached weather.' : 'Couldn’t load the forecast.'}</strong>
              <span>{error}</span>
            </div>
            <button onClick={() => void loadForecast(place)} type="button">Try again</button>
          </div>
        )}

        {!forecast && loading && <div className="weather-skeleton" aria-label="Loading weather" />}

        {forecast && (
          <>
            <CurrentWeather forecast={forecast} units={units} />
            <section className="forecast-section" aria-labelledby="three-day-heading">
              <div className="section-heading">
                <h2 id="three-day-heading">Next 3 days</h2>
                <button aria-expanded={showWeek} className="week-toggle" onClick={() => setShowWeek((value) => !value)} type="button">
                  {showWeek ? 'Hide 7 days' : 'View 7 days'}
                  <ChevronDown aria-hidden="true" className={showWeek ? 'rotated' : ''} />
                </button>
              </div>
              <ThreeDayForecast forecast={forecast} units={units} />
            </section>
            {showWeek && <WeekForecast forecast={forecast} units={units} />}
          </>
        )}

        <footer>
          <span>Forecasts can change.</span>
          <a href="https://open-meteo.com/" rel="noreferrer" target="_blank">Weather data by Open-Meteo</a>
        </footer>
      </section>
    </main>
  )
}
