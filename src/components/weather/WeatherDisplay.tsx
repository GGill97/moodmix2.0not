"use client";

import React, { useEffect } from "react";
import { Thermometer, Droplets, Wind, Eye } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";

interface WeatherDisplayProps {
  location: string;
  onWeatherUpdate?: (description: string) => void;
}

interface WeatherStatProps {
  icon: typeof Thermometer;
  label: string;
  value: string;
}

const WeatherStat = ({ icon: Icon, label, value }: WeatherStatProps) => (
  <div className="text-center space-y-2">
    <Icon className="w-5 h-5 mx-auto text-soft-brown/40" />
    <div className="text-sm text-soft-brown/60">{label}</div>
    <div className="text-soft-brown font-medium">{value}</div>
  </div>
);

export default function WeatherDisplay({
  location,
  onWeatherUpdate,
}: WeatherDisplayProps) {
  const { data: weatherData, error } = useWeather(location);

  useEffect(() => {
    if (weatherData?.weather?.[0]?.description && onWeatherUpdate) {
      onWeatherUpdate(weatherData.weather[0].description);
    }
  }, [weatherData, onWeatherUpdate]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-soft-brown/70 text-center">
          <p>Unable to load weather data</p>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-soft-brown/70">
          Loading weather data...
        </div>
      </div>
    );
  }

  if (!weatherData.main || !weatherData.weather?.[0]) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-soft-brown/70">Weather data is incomplete</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between p-6">
      {/* Top Section */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display text-soft-brown">
          Current Weather in {weatherData.name}
        </h2>
        <p className="text-soft-brown/60 text-sm">
          {new Date().toLocaleString("en-US", {
            weekday: "long",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}
        </p>
      </div>

      {/* Middle Section */}
      <div className="text-center py-8">
        <div className="font-display text-8xl text-soft-brown mb-2">
          {Math.round(weatherData.main.temp)}°F
        </div>
        <div className="text-soft-brown/70 text-lg font-light capitalize">
          {weatherData.weather[0].description}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <WeatherStat
          icon={Thermometer}
          label="Feels Like"
          value={`${Math.round(weatherData.main.feels_like)}°F`}
        />
        <WeatherStat
          icon={Droplets}
          label="Humidity"
          value={`${weatherData.main.humidity}%`}
        />
        <WeatherStat
          icon={Wind}
          label="Wind Speed"
          value={`${Math.round(weatherData.wind.speed)} mph`}
        />
        <WeatherStat
          icon={Eye}
          label="Visibility"
          value={`${Math.round(weatherData.visibility / 1000)} km`}
        />
      </div>
    </div>
  );
}
// do not change anything in this file