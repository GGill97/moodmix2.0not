// src/components/weather/CompactWeatherHeader.tsx
"use client";

import React from "react";
import { Thermometer, Droplets, Wind, Eye, MapPin } from "lucide-react";
import type { WeatherData } from "@/types/weather";

interface CompactWeatherHeaderProps {
  weatherData: WeatherData;
  city: string;
}

interface WeatherDetailProps {
  icon: typeof Thermometer;
  label: string;
  value: string;
}

const WeatherDetail = ({ icon: Icon, label, value }: WeatherDetailProps) => (
  <div className="flex items-center gap-2 text-sm">
    <Icon className="w-4 h-4 text-soft-brown/60" />
    <span className="text-soft-brown/70">{label}:</span>
    <span className="text-soft-brown font-medium">{value}</span>
  </div>
);

export default function CompactWeatherHeader({
  weatherData,
  city,
}: CompactWeatherHeaderProps) {
  if (!weatherData?.main || !weatherData?.weather?.[0]) {
    return (
      <header className="glass border-b border-white/10 px-6 py-2">
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-soft-brown/70">
            Loading weather...
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="glass border-b border-white/10 px-6 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Compact Weather Info */}
        <div className="flex items-center gap-6">
          {/* Main Temperature & Location */}
          <div className="flex items-center gap-4">
            <div className="text-3xl font-display text-soft-brown">
              {Math.round(weatherData.main.temp)}°F
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-soft-brown font-semibold">
                <MapPin className="w-4 h-4" />
                <span>{weatherData.name || city}</span>
              </div>
              <div className="text-soft-brown/70 text-sm capitalize">
                {weatherData.weather[0].description}
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="hidden md:flex items-center gap-6">
            <WeatherDetail
              icon={Thermometer}
              label="Feels like"
              value={`${Math.round(weatherData.main.feels_like)}°F`}
            />
            <WeatherDetail
              icon={Droplets}
              label="Humidity"
              value={`${weatherData.main.humidity}%`}
            />
            <WeatherDetail
              icon={Wind}
              label="Wind"
              value={`${Math.round(weatherData.wind.speed)} mph`}
            />
            <WeatherDetail
              icon={Eye}
              label="Visibility"
              value={`${Math.round(weatherData.visibility / 1000)} km`}
            />
          </div>
        </div>

        {/* Center: App Title */}
        <div className="hidden lg:block text-center">
          <h1 className="text-2xl font-display text-soft-brown">
            Your Weather, Your Beats
          </h1>
          <p className="text-sm text-soft-brown/60 italic">
            Weather-inspired melodies for your day
          </p>
        </div>

        {/* Right: Current Time */}
        <div className="text-right">
          <div className="text-sm text-soft-brown/60">
            {new Date().toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="text-lg text-soft-brown font-medium">
            {new Date().toLocaleString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </div>
        </div>
      </div>

      {/* Mobile Weather Details */}
      <div className="md:hidden mt-4 pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4">
          <WeatherDetail
            icon={Thermometer}
            label="Feels like"
            value={`${Math.round(weatherData.main.feels_like)}°F`}
          />
          <WeatherDetail
            icon={Droplets}
            label="Humidity"
            value={`${weatherData.main.humidity}%`}
          />
          <WeatherDetail
            icon={Wind}
            label="Wind"
            value={`${Math.round(weatherData.wind.speed)} mph`}
          />
          <WeatherDetail
            icon={Eye}
            label="Visibility"
            value={`${Math.round(weatherData.visibility / 1000)} km`}
          />
        </div>
      </div>
    </header>
  );
}
