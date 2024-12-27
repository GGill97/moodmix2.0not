"use client";

import React, { useState } from "react";
import { MessageSquare, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import MoodMixChat from "../Chat/ChatInterface";
import WeatherDisplay from "../Weather/WeatherDisplay";
import MusicInsights from "../music/MusicInsights";

interface WeatherMusicSectionProps {
  location: string;
  weatherDescription: string;
  onMoodAnalysis: (analysis: any) => void;
  onWeatherUpdate: (description: string) => void;
}

export default function WeatherMusicSection({
  location,
  weatherDescription,
  onMoodAnalysis,
  onWeatherUpdate,
}: WeatherMusicSectionProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "insights">("chat");

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col">
          <div className="h-12 mb-4 flex gap-2">
            <button
              onClick={() => setActiveTab("chat")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                activeTab === "chat"
                  ? "bg-white/10 text-terracotta"
                  : "text-soft-brown/80 hover:bg-white/5"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                activeTab === "insights"
                  ? "bg-white/10 text-terracotta"
                  : "text-soft-brown/80 hover:bg-white/5"
              )}
            >
              <Music className="w-4 h-4" />
              AI Insights
            </button>
          </div>

          <div className="glass rounded-xl overflow-hidden h-[480px]">
            <div className="h-full overflow-hidden">
              {activeTab === "chat" ? (
                <MoodMixChat
                  onMoodAnalysis={onMoodAnalysis}
                  className="h-full"
                />
              ) : (
                <MusicInsights
                  location={location}
                  weatherDescription={weatherDescription}
                  genres={[]}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col">
          <div className="h-12 mb-4" /> {/* Spacer for alignment */}
          <div className="glass rounded-xl overflow-hidden h-[480px]">
            <WeatherDisplay
              location={location}
              onWeatherUpdate={onWeatherUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
