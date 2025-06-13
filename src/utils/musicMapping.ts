// src/utils/musicMapping.ts

import { WEATHER_CONDITIONS } from "../types/weather";

// Basic weather categories to verified Spotify genres
export const WEATHER_TO_GENRES: Record<string, string[]> = {
  // Clear weather -> Upbeat, energetic music
  "clear sky": ["pop", "dance", "electronic", "summer"],

  // Cloudy conditions -> Mellow, indie music
  "few clouds": ["indie", "indie-pop", "chill"],
  "scattered clouds": ["alternative", "indie", "pop"],
  "broken clouds": ["indie", "folk", "chill"],
  "overcast clouds": ["ambient", "study", "chill"],

  // Rain conditions -> Calm, reflective music
  "light rain": ["acoustic", "ambient", "piano"],
  "moderate rain": ["classical", "jazz", "rainy-day"],
  "heavy rain": ["sleep", "ambient", "piano"],

  // Thunder conditions -> Intense music
  thunderstorm: ["rock", "electronic", "epic"],

  // Snow conditions -> Soft, peaceful music
  snow: ["classical", "ambient", "piano"],

  // Mist/Fog conditions -> Mysterious, atmospheric music
  mist: ["ambient", "atmospheric", "ethereal"],
  fog: ["ambient", "atmospheric", "ethereal"],
};

export const validateAndMapWeather = async (
  weatherDescription: string,
  validSpotifyGenres: string[]
): Promise<string[]> => {
  // Normalize weather description
  const normalizedWeather = weatherDescription.toLowerCase();

  // Get base genres for this weather
  let genres =
    WEATHER_TO_GENRES[normalizedWeather] || WEATHER_TO_GENRES["clear sky"]; // default to clear sky

  // Filter to only include valid Spotify genres
  const validGenres = genres.filter((genre) =>
    validSpotifyGenres.includes(genre)
  );

  // If no valid genres found, return some safe defaults
  if (validGenres.length === 0) {
    return ["pop", "rock"].filter((genre) =>
      validSpotifyGenres.includes(genre)
    );
  }

  return validGenres;
};
