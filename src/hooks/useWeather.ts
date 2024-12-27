// src/hooks/useWeather.ts
import { useState, useEffect } from "react";

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
}

export function useWeather(location: string) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!location) return;

    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `/api/weather?location=${encodeURIComponent(location)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }
        const weatherData = await response.json();
        setData(weatherData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        setData(null);
      }
    };

    fetchWeather();
  }, [location]);

  return { data, error };
}
