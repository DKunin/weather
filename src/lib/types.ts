export type Place = {
  id: number
  name: string
  latitude: number
  longitude: number
  country: string
  country_code: string
  admin1?: string
  timezone: string
}

export type Forecast = {
  latitude: number
  longitude: number
  timezone: string
  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    is_day: number
  }
  current_units: Record<string, string>
  hourly: {
    time: string[]
    temperature_2m: number[]
    weather_code: number[]
    is_day: number[]
  }
  hourly_units: Record<string, string>
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: Array<number | null>
    wind_speed_10m_max: number[]
    uv_index_max: Array<number | null>
    sunrise: string[]
    sunset: string[]
  }
  daily_units: Record<string, string>
}

export type UnitSystem = 'metric' | 'imperial'
