// src/app/page.tsx - Fixed Layout
"use client";

import type { WeatherData } from "@/types";
import { useSession } from "next-auth/react";
import { useState, useCallback, useEffect } from "react";
import { FaCloudSun, FaSpotify, FaListUl } from "react-icons/fa";
import { useRouter } from "next/navigation";
import LocationSearch from "@/components/search/LocationSearch";
import WeatherMusicSection from "@/components/layout/WeatherMusicSection";
import type { MoodAnalysis } from "@/types/chat";
import { useWeather } from "@/hooks/useWeather";

interface FeatureCardProps {
  icon: React.ComponentType;
  title: string;
  description: string;
}

// CHANGE THE FeatureCard COMPONENT:
const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => (
  <div className="glass p-6 lg:p-8 rounded-2xl transform transition-all duration-300 hover:scale-105 text-center">
    <div className="text-3xl lg:text-4xl text-terracotta mb-6 flex justify-center">
      <Icon />
    </div>
    <h3 className="text-lg lg:text-xl font-medium mb-4 text-soft-brown">
      {title}
    </h3>
    <p className="text-soft-brown/70 text-sm lg:text-base leading-relaxed">
      {description}
    </p>
  </div>
);

export default function Home() {
  // Initialize hooks and state
  const { data: session } = useSession();
  const [location, setLocation] = useState("");
  const { weatherData, isLoading, error, fetchWeather } = useWeather();
  const router = useRouter();

  // Handle location search
  const handleSearch = async (query: string) => {
    if (!query?.trim()) return;

    try {
      // Update location state
      setLocation(query);

      // Update URL without navigation
      window.history.pushState({}, "", `/?city=${encodeURIComponent(query)}`);

      // Fetch weather data
      await fetchWeather(query);
    } catch (err) {
      console.error("Search handling error:", err);
      // Error is handled by useWeather hook
    }
  };

  // Handle mood analysis callback
  const handleMoodAnalysis = useCallback((analysis: MoodAnalysis) => {
    if (!analysis) return;
    console.log("Mood analysis:", analysis);
    // Add any additional mood analysis handling here
  }, []);

  // Handle initial page load
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const cityParam = urlParams.get("city");

      if (cityParam) {
        handleSearch(cityParam);
      }
    } catch (err) {
      console.error("URL parameter parsing error:", err);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sandy-beige to-terracotta overflow-x-hidden">
      {/* Fixed container with proper constraints */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-8">
        {/* Header Section - Responsive sizing */}
        <div className="text-center space-y-4 animate-fadeIn">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display text-soft-brown tracking-tight">
            Your Weather, Your Beats
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-soft-brown/70 italic font-light max-w-3xl mx-auto">
            Weather-inspired melodies for your day
          </p>
        </div>

        {/* Search Section */}
        <div
          className="animate-fadeIn max-w-2xl mx-auto"
          style={{ animationDelay: "0.2s" }}
        >
          <LocationSearch onSearch={handleSearch} isLoading={isLoading} />
          {error && (
            <p className="text-red-500 text-center mt-4 animate-fadeIn text-sm sm:text-base">
              {error}
            </p>
          )}
        </div>

        {/* Content Section */}
        {!weatherData ? (
          <div
            className="animate-fadeIn py-8"
            style={{ animationDelay: "0.4s" }}
          >
            <h2 className="text-2xl sm:text-3xl font-display text-soft-brown text-center mb-12 lg:mb-16">
              Discover Your Weather-Inspired Playlist
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto px-4">
              <FeatureCard
                icon={FaCloudSun}
                title="Real-time Weather"
                description="Get accurate local forecasts and weather-matched music recommendations"
              />
              <FeatureCard
                icon={FaSpotify}
                title="Spotify Integration"
                description="Connect with Spotify to create and save personalized playlists"
              />
              <FeatureCard
                icon={FaListUl}
                title="Smart Matches"
                description="Experience AI-powered music suggestions based on your weather"
              />
            </div>
          </div>
        ) : (
          // Fixed height container for the weather/music section
          <div
            className="animate-fadeIn h-[700px] sm:h-[750px] lg:h-[800px]"
            style={{ animationDelay: "0.4s" }}
          >
            <WeatherMusicSection
              location={location}
              weatherData={weatherData}
              onMoodAnalysis={handleMoodAnalysis}
              spotifyAccessToken={session?.accessToken}
            />
          </div>
        )}
      </div>
    </main>
  );
}
