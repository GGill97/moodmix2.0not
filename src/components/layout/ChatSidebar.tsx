// src/components/layout/ChatSidebar.tsx - FIXED VERSION
"use client";

import React from "react";
import { MessageSquare, Lightbulb } from "lucide-react";
import { FaSpotify } from "react-icons/fa";
import { useSession, signIn, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import ChatInterface from "@/components/chat/ChatInterface";
import InsightsTab from "@/components/layout/InsightsTab";
import type { MoodAnalysis } from "@/types/chat";

interface ChatSidebarProps {
  weatherDescription: string;
  city: string;
  moodAnalysis?: MoodAnalysis | null;
  onMoodAnalyzed?: (analysis: MoodAnalysis) => void;
  currentTracks?: any[];
  insightsLoaded?: boolean;
  cityInsights?: any;
  activeTab?: "chat" | "insights";
  onTabChange?: (tab: "chat" | "insights") => void;
}

export default function ChatSidebar({
  weatherDescription,
  city,
  moodAnalysis,
  onMoodAnalyzed,
  currentTracks = [],
  insightsLoaded = false,
  cityInsights = null,
  activeTab = "chat",
  onTabChange,
}: ChatSidebarProps) {
  const { data: session } = useSession();

  const handleTabClick = (tab: "chat" | "insights") => {
    onTabChange?.(tab);
  };

  return (
    <aside className="glass rounded-2xl flex flex-col h-full">
      {/* Tab Header - Fixed height */}
      <div className="flex border-b border-white/10 flex-shrink-0">
        <button
          onClick={() => handleTabClick("chat")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-soft-brown flex-1 justify-center",
            activeTab === "chat"
              ? "border-b-2 border-terracotta bg-white/5"
              : "opacity-70 hover:opacity-100 hover:bg-white/5"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-medium">Chat</span>
        </button>
        <button
          onClick={() => handleTabClick("insights")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-soft-brown flex-1 justify-center",
            activeTab === "insights"
              ? "border-b-2 border-terracotta bg-white/5"
              : "opacity-70 hover:opacity-100 hover:bg-white/5"
          )}
        >
          <Lightbulb className="w-4 h-4" />
          <span className="text-sm font-medium">Insights</span>
        </button>
      </div>

      {/* Tab Content - Takes remaining height */}
      <div className="flex-1 flex flex-col min-h-0 p-4">
        {activeTab === "chat" ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Header - Fixed height */}
            <div className="flex-shrink-0 mb-6">
              <h3 className="font-display text-lg text-soft-brown mb-3">
                🎭 Mood & Chat
              </h3>
              <p className="text-sm text-soft-brown/70 leading-relaxed">
                Want to switch up the vibes or get a fresh playlist? Just let me
                know how you're feeling today.
              </p>
            </div>

            {/* Chat Interface - Takes remaining height */}
            <div className="flex-1 min-h-0">
              <ChatInterface
                weatherDescription={weatherDescription}
                location={city}
                onMoodAnalyzed={onMoodAnalyzed}
                currentTracks={currentTracks}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Insights Header - Fixed height */}
            <div className="flex-shrink-0 mb-6">
              <h3 className="font-display text-lg text-soft-brown mb-3">
                💡 City Insights
              </h3>
              <p className="text-sm text-soft-brown/70 leading-relaxed">
                Discover what makes {city} unique and how the weather influences
                local culture.
              </p>
            </div>

            {/* Insights Content - Takes remaining height */}
            <div className="flex-1 min-h-0">
              {insightsLoaded ? (
                <InsightsTab
                  city={city}
                  weather={weatherDescription}
                  insights={cityInsights}
                />
              ) : (
                <div className="flex justify-center items-center h-32">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-soft-brown/30 border-t-soft-brown/70 animate-spin"></div>
                    <p className="text-soft-brown/70 text-sm">
                      Loading city insights...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Spotify Status Footer - Fixed height */}
      <div className="border-t border-white/10 p-6 flex-shrink-0">
        {session ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-green-500">
              <FaSpotify className="w-4 h-4" />
              <span className="text-sm font-medium">Connected</span>
            </div>
            <button
              onClick={() => signOut()}
              className="text-xs text-soft-brown/60 hover:text-soft-brown/80 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("spotify")}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <FaSpotify className="w-4 h-4" />
            <span className="text-sm font-medium">Connect Spotify</span>
          </button>
        )}
      </div>
    </aside>
  );
}
