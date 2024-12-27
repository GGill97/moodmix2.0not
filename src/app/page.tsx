"use client";

import { useSession } from "next-auth/react";
import { useState, useCallback } from "react";
import { FaCloudSun, FaSpotify, FaListUl } from "react-icons/fa";

// Components
import LocationSearch from "@/components/search/LocationSearch";
import WeatherMusicSection from "@/components/layout/WeatherMusicSection";

interface FeatureCardProps {
  icon: React.ComponentType;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => (
  <div className="glass p-8 rounded-2xl transform transition-all duration-300 hover:scale-105">
    <div className="text-4xl text-terracotta mb-4 animate-bounce">
      <Icon />
    </div>
    <h3 className="text-xl font-medium mb-3 text-soft-brown">{title}</h3>
    <p className="text-soft-brown/70">{description}</p>
  </div>
);

export default function Home() {
  const { data: session } = useSession();
  const [location, setLocation] = useState("");
  const [weatherDescription, setWeatherDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    if (!query?.trim()) return;  // Add null check with optional chaining
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await fetch(
        `/api/weather?location=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Failed to fetch weather data");
  
      const data = await response.json();
      setLocation(query);
      setWeatherDescription(data.weather?.[0]?.description || "");
    } catch (error) {
      setError("Failed to fetch weather data. Please try again.");
      console.error("Weather fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeatherUpdate = useCallback((description: string) => {
    setWeatherDescription(description);
  }, []);

  const handleMoodAnalysis = useCallback((analysis: any) => {
    // Handle mood analysis results
    console.log("Mood analysis:", analysis);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sandy-beige to-terracotta">
      <div className="container mx-auto px-6 py-16 space-y-16">
        <div className="text-center space-y-6 animate-fadeIn">
          <h1 className="text-7xl font-display text-soft-brown tracking-tight">
            Your Weather, Your Beats
          </h1>
          <p className="text-2xl text-soft-brown/70 italic font-light">
            Weather-inspired melodies for your day
          </p>
        </div>

        <div className="animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <LocationSearch onSearch={handleSearch} isLoading={isLoading} />
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>

        {!location ? (
          <div className="animate-fadeIn" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-3xl font-display text-soft-brown text-center mb-12">
              Discover Your Weather-Inspired Playlist
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
          <WeatherMusicSection
            location={location}
            weatherDescription={weatherDescription}
            onWeatherUpdate={handleWeatherUpdate}
            onMoodAnalysis={handleMoodAnalysis}
          />
        )}
      </div>
    </main>
  );
}
