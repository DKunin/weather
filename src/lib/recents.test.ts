import { describe, expect, it } from 'vitest'
import { withRecentPlace } from './recents'
import type { Place } from './types'

const place = (id: number): Place => ({
  id,
  name: `City ${id}`,
  latitude: id,
  longitude: id,
  country: 'Country',
  country_code: 'CC',
  timezone: 'UTC',
})

describe('withRecentPlace', () => {
  it('moves a selected city to the front, de-duplicates, and keeps five', () => {
    const result = withRecentPlace([1, 2, 3, 4, 5].map(place), place(3))
    expect(result.map(({ id }) => id)).toEqual([3, 1, 2, 4, 5])
    expect(withRecentPlace(result, place(6)).map(({ id }) => id)).toEqual([6, 3, 1, 2, 4])
  })
})
