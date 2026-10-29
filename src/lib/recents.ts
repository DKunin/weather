import type { Place } from './types'

const RECENT_PLACES_KEY = 'weather:recent-places'
const MAX_RECENT_PLACES = 5

export function readRecentPlaces(storage: Storage): Place[] {
  try {
    const value = JSON.parse(storage.getItem(RECENT_PLACES_KEY) || '[]')
    return Array.isArray(value) ? value.slice(0, MAX_RECENT_PLACES) as Place[] : []
  } catch {
    return []
  }
}

export function withRecentPlace(recentPlaces: Place[], place: Place) {
  return [place, ...recentPlaces.filter((recent) => recent.id !== place.id)]
    .slice(0, MAX_RECENT_PLACES)
}

export function writeRecentPlaces(storage: Storage, places: Place[]) {
  storage.setItem(RECENT_PLACES_KEY, JSON.stringify(places))
}
