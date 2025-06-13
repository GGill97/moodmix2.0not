//src/components/weather/WeatherDisplay.tsx
"use client";

import React from "react";
import { Thermometer, Droplets, Wind, Eye } from "lucide-react";
import type { WeatherData } from "@/types/weather";

interface WeatherDisplayProps {
  weatherData: WeatherData;
  city: string;
}

interface WeatherStatProps {
  icon: typeof Thermometer;
  label: string;
  value: string;
}

const WeatherStat = ({ icon: Icon, label, value }: WeatherStatProps) => (
  <div className="text-center flex flex-col items-center space-y-1">
    <Icon className="w-5 h-5 text-soft-brown/40" />
    <div className="text-sm text-soft-brown/60">{label}</div>
    <div className="text-soft-brown font-medium">{value}</div>
  </div>
);

export default function WeatherDisplay({
  weatherData,
  city,
}: WeatherDisplayProps) {
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
    <div className="flex flex-col h-full w-full">
      {/* City and Date */}
      <div className="text-center mb-2 md:mb-4">
        <h2 className="text-2xl font-display text-soft-brown">
          Current Weather in {weatherData.name || city}
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

      {/* Main Content with flexible space */}
      <div className="flex-grow flex flex-col justify-center">
        {/* Temperature and Weather Description */}
        <div className="text-center">
          <div className="font-display text-7xl md:text-8xl text-soft-brown mb-1">
            {Math.round(weatherData.main.temp)}°F
          </div>
          <div className="text-soft-brown/70 text-lg font-light capitalize">
            {weatherData.weather[0].description}
          </div>
        </div>
      </div>

      {/* Weather Stats Grid - Fixed Height */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-auto pt-4">
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
