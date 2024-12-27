// src/components/layout/MainContent.tsx
"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Music, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import WeatherDisplay from "../weather/WeatherDisplay";
import MusicRecommendations from "../music/MusicRecommendations";
import MusicInsights from "../music/MusicInsights";

interface MainContentProps {
  location: string;
  onWeatherUpdate: (description: string) => void;
  spotifyAccessToken?: string;
}

interface TabButtonProps {
  label: string;
  icon: React.ComponentType;
  onClick: () => void;
  isActive: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({
  label,
  icon: Icon,
  onClick,
  isActive,
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
      isActive
        ? "bg-white/10 text-terracotta border-b-2 border-terracotta"
        : "text-soft-brown/80 hover:bg-white/5"
    )}
  >
    <Icon className="h-4 w-4" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default function MainContent({
  location,
  onWeatherUpdate,
  spotifyAccessToken,
}: MainContentProps) {
  const [activeTab, setActiveTab] = React.useState<"weather" | "insights">(
    "weather"
  );
  const [weatherDescription, setWeatherDescription] = React.useState("");

  // Handle weather updates
  const handleWeatherUpdate = (description: string) => {
    setWeatherDescription(description);
    onWeatherUpdate(description);
  };

  if (!location) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-soft-brown mb-4">
          How it Works
        </h2>
        <ul className="space-y-4 text-soft-brown/80">
          <li>1. Enter your location above</li>
          <li>2. Get current weather information</li>
          <li>3. Connect with Spotify for personalized music</li>
          <li>4. Discover weather-inspired playlists</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weather Display */}
      <div className="glass rounded-xl p-6">
        <WeatherDisplay
          location={location}
          onWeatherUpdate={handleWeatherUpdate}
        />
      </div>

      {/* Tabs Section */}
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex gap-2">
          <TabButton
            label="Music"
            icon={Music}
            onClick={() => setActiveTab("weather")}
            isActive={activeTab === "weather"}
          />
          <TabButton
            label="Insights"
            icon={MessageSquare}
            onClick={() => setActiveTab("insights")}
            isActive={activeTab === "insights"}
          />
        </div>

        {activeTab === "weather" ? (
          <MusicRecommendations
            weatherDescription={weatherDescription}
            spotifyAccessToken={spotifyAccessToken}
          />
        ) : (
          <MusicInsights
            location={location}
            weather={weatherDescription}
            genres={[]}
          />
        )}
      </div>
    </div>
  );
}
