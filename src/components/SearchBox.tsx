import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Place } from '../lib/types'

type SearchBoxProps = {
  onSelect: (place: Place) => void
}

export function SearchBox({ onSelect }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setBusy(true)
      try {
        const response = await fetch(`/api/locations?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal })
        if (!response.ok) throw new Error('Search failed')
        const payload = await response.json() as { results: Place[] }
        setResults(payload.results)
        setOpen(true)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setResults([])
      } finally {
        setBusy(false)
      }
    }, 280)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  return (
    <div className="search-box" ref={rootRef}>
      <Search aria-hidden="true" size={20} />
      <input
        aria-autocomplete="list"
        aria-controls="city-results"
        aria-expanded={open}
        aria-label="Search city"
        autoComplete="off"
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search city…"
        role="combobox"
        value={query}
      />
      {busy && <span className="search-busy" aria-label="Searching" />}
      {open && results.length > 0 && (
        <ul className="search-results" id="city-results" role="listbox">
          {results.map((place) => (
            <li key={place.id}>
              <button
                onClick={() => {
                  onSelect(place)
                  setQuery('')
                  setOpen(false)
                }}
                role="option"
                type="button"
              >
                <strong>{place.name}</strong>
                <span>{[place.admin1, place.country].filter(Boolean).join(', ')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

