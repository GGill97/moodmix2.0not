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
      <div className="glass rounded-xl p-8 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-soft-brown mb-4">
          How it Works
        </h2>
        <ul className="space-y-4 text-soft-brown/80 text-left">
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 bg-terracotta/20 rounded-full flex items-center justify-center text-terracotta text-sm font-bold">
              1
            </span>
            Enter your location above
          </li>
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 bg-terracotta/20 rounded-full flex items-center justify-center text-terracotta text-sm font-bold">
              2
            </span>
            Get current weather information
          </li>
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 bg-terracotta/20 rounded-full flex items-center justify-center text-terracotta text-sm font-bold">
              3
            </span>
            Connect with Spotify for personalized music
          </li>
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 bg-terracotta/20 rounded-full flex items-center justify-center text-terracotta text-sm font-bold">
              4
            </span>
            Discover weather-inspired playlists
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-8 min-h-[600px] max-w-7xl mx-auto">
      {/* Weather Display */}
      <div className="xl:w-1/3 glass rounded-xl p-6 h-fit">
        <WeatherDisplay
          location={location}
          onWeatherUpdate={handleWeatherUpdate}
        />
      </div>

      {/* Music/Insights Section */}
      <div className="xl:w-2/3 glass rounded-xl flex flex-col overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-white/10 px-6 pt-6">
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

        {/* Tab Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {activeTab === "weather" ? (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/5">
                <h2 className="text-xl font-display text-soft-brown mb-1">
                  Weather-Inspired Music
                </h2>
                <p className="text-sm text-soft-brown/70">
                  Weather: {weatherDescription || "Loading..."}
                </p>
              </div>

              {/* Music Content */}
              <div className="flex-1 overflow-hidden">
                <MusicRecommendations
                  weatherDescription={weatherDescription}
                  spotifyAccessToken={spotifyAccessToken}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 p-6">
              <MusicInsights
                location={location}
                weather={weatherDescription}
                genres={[]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
