// src/types/weather.ts

// OpenWeather condition codes and descriptions
// Source: https://openweathermap.org/weather-conditions
export const WEATHER_CONDITIONS = {
    // Thunderstorm
    '2xx': ['thunderstorm with light rain', 'thunderstorm with rain', 'thunderstorm with heavy rain', 'light thunderstorm', 'thunderstorm', 'heavy thunderstorm'],
    // Drizzle
    '3xx': ['light intensity drizzle', 'drizzle', 'heavy intensity drizzle', 'light intensity drizzle rain', 'drizzle rain'],
    // Rain
    '5xx': ['light rain', 'moderate rain', 'heavy intensity rain', 'very heavy rain', 'extreme rain'],
    // Snow
    '6xx': ['light snow', 'snow', 'heavy snow', 'sleet', 'light shower sleet'],
    // Atmosphere
    '7xx': ['mist', 'smoke', 'haze', 'sand/dust whirls', 'fog'],
    // Clear
    '800': ['clear sky'],
    // Clouds
    '80x': ['few clouds', 'scattered clouds', 'broken clouds', 'overcast clouds']
  } as const;
  