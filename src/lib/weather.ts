import clearDay from '@meteocons/svg-static/fill/clear-day.svg?url'
import clearNight from '@meteocons/svg-static/fill/clear-night.svg?url'
import cloudy from '@meteocons/svg-static/fill/cloudy.svg?url'
import drizzle from '@meteocons/svg-static/fill/drizzle.svg?url'
import fog from '@meteocons/svg-static/fill/fog.svg?url'
import overcast from '@meteocons/svg-static/fill/overcast.svg?url'
import partlyCloudyDay from '@meteocons/svg-static/fill/partly-cloudy-day.svg?url'
import partlyCloudyNight from '@meteocons/svg-static/fill/partly-cloudy-night.svg?url'
import rain from '@meteocons/svg-static/fill/rain.svg?url'
import snow from '@meteocons/svg-static/fill/snow.svg?url'
import thunderstormsDay from '@meteocons/svg-static/fill/thunderstorms-day.svg?url'
import thunderstormsNight from '@meteocons/svg-static/fill/thunderstorms-night.svg?url'

export function weatherLabel(code: number) {
  if (code === 0) return 'Clear sky'
  if (code === 1) return 'Mainly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code === 45 || code === 48) return 'Foggy'
  if (code >= 51 && code <= 57) return 'Drizzle'
  if (code >= 61 && code <= 67) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Rain showers'
  if (code >= 85 && code <= 86) return 'Snow showers'
  if (code >= 95) return 'Thunderstorms'
  return 'Variable conditions'
}

export function weatherIcon(code: number, isDay = true) {
  if (code === 0) return isDay ? clearDay : clearNight
  if (code === 1 || code === 2) return isDay ? partlyCloudyDay : partlyCloudyNight
  if (code === 3) return overcast
  if (code === 45 || code === 48) return fog
  if (code >= 51 && code <= 57) return drizzle
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return rain
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return snow
  if (code >= 95) return isDay ? thunderstormsDay : thunderstormsNight
  return cloudy
}

