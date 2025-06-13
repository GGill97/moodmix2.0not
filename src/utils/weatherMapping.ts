// src/utils/weatherMapping.ts

export interface WeatherGenreMapping {
  genres: string[];
  valence: number; // Happiness (0.0 to 1.0)
  energy: number; // Energy (0.0 to 1.0)
  danceability: number; // Danceability (0.0 to 1.0)
}

// Common valid Spotify genres that work well with weather
const VALID_BASE_GENRES = [
  "pop",
  "rock",
  "indie",
  "electronic",
  "classical",
  "ambient",
  "chill",
  "dance",
  "jazz",
  "piano",
] as const;

export const WEATHER_MAPPINGS: Record<string, WeatherGenreMapping> = {
  // Clear Conditions
  "clear sky": {
    genres: ["pop", "dance", "electronic"],
    valence: 0.8,
    energy: 0.8,
    danceability: 0.7,
  },
  clear: {
    genres: ["pop", "dance", "electronic"],
    valence: 0.8,
    energy: 0.8,
    danceability: 0.7,
  },

  // Cloud Conditions
  "few clouds": {
    genres: ["indie", "pop", "electronic"],
    valence: 0.6,
    energy: 0.6,
    danceability: 0.6,
  },
  "scattered clouds": {
    genres: ["indie", "pop", "electronic"],
    valence: 0.5,
    energy: 0.5,
    danceability: 0.5,
  },
  "broken clouds": {
    genres: ["indie", "ambient", "electronic"],
    valence: 0.4,
    energy: 0.4,
    danceability: 0.4,
  },
  "overcast clouds": {
    genres: ["indie", "ambient", "electronic"],
    valence: 0.4,
    energy: 0.4,
    danceability: 0.4,
  },

  // Rain Conditions
  "light rain": {
    genres: ["chill", "ambient", "piano"],
    valence: 0.4,
    energy: 0.3,
    danceability: 0.3,
  },
  "moderate rain": {
    genres: ["classical", "ambient", "piano"],
    valence: 0.3,
    energy: 0.3,
    danceability: 0.3,
  },
  "heavy rain": {
    genres: ["classical", "ambient", "piano"],
    valence: 0.2,
    energy: 0.2,
    danceability: 0.2,
  },

  // Special Conditions
  thunderstorm: {
    genres: ["rock", "electronic"],
    valence: 0.6,
    energy: 0.8,
    danceability: 0.4,
  },
  snow: {
    genres: ["classical", "ambient"],
    valence: 0.4,
    energy: 0.3,
    danceability: 0.3,
  },
  mist: {
    genres: ["ambient", "electronic"],
    valence: 0.4,
    energy: 0.4,
    danceability: 0.4,
  },
  fog: {
    genres: ["ambient", "electronic"],
    valence: 0.4,
    energy: 0.4,
    danceability: 0.4,
  },
};

export const getWeatherMapping = (
  weatherDescription: string
): WeatherGenreMapping => {
  try {
    // Normalize weather description
    const normalizedWeather = weatherDescription.toLowerCase().trim();

    console.log("Processing weather description:", {
      original: weatherDescription,
      normalized: normalizedWeather,
    });

    // Find exact match
    if (WEATHER_MAPPINGS[normalizedWeather]) {
      console.log("Found exact weather match:", normalizedWeather);
      return WEATHER_MAPPINGS[normalizedWeather];
    }

    // Find partial match
    const matchingKey = Object.keys(WEATHER_MAPPINGS).find((key) =>
      normalizedWeather.includes(key)
    );

    if (matchingKey) {
      console.log("Found partial weather match:", {
        input: normalizedWeather,
        matched: matchingKey,
      });
      return WEATHER_MAPPINGS[matchingKey];
    }

    console.log("No weather match found, using default (clear sky)");
    return WEATHER_MAPPINGS["clear sky"];
  } catch (error) {
    console.error("Error in getWeatherMapping:", error);
    return WEATHER_MAPPINGS["clear sky"];
  }
};
