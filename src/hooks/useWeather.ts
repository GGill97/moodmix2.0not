// src/hooks/useWeather.ts
"use client";

/* 
Pseudocode Flow:
1. Initialize state variables
   - weatherData: stores the current weather information
   - isLoading: tracks API request status
   - error: stores any error messages
2. fetchWeather function
   - Validates input
   - Handles API request
   - Updates state based on response
   - Provides detailed error messages
3. Export hook with state and functions
*/

import { useState } from "react";
import type { WeatherData } from "@/types";

export function useWeather() {
  // State Management
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (location: string) => {
    // Input validation
    if (!location?.trim()) {
      setError("Please enter a valid location");
      return null;
    }

    // Reset states before fetch
    setIsLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      // Make API request
      const response = await fetch(
        `/api/weather?location=${encodeURIComponent(location.trim())}`
      );

      // Parse error responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Weather request failed: ${response.status}`
        );
      }

      // Parse successful response
      const data = await response.json();

      // Validate response data
      if (!data || !data.main || !data.weather) {
        throw new Error("Invalid weather data received");
      }

      setWeatherData(data);
      return data;
    } catch (error) {
      // Handle different types of errors
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch weather data. Please try again.";

      setError(errorMessage);
      console.error("Weather fetch error:", {
        error,
        message: errorMessage,
        timestamp: new Date().toISOString(),
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    weatherData,
    isLoading,
    error,
    fetchWeather,
  };
}
