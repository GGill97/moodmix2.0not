// src/components/chat/ChatInterface.tsx - FIXED VERSION (NO REPETITIVE MESSAGES)
"use client";

import React, { useState, useEffect, useRef } from "react";
import { SendHorizontal, Zap, Music } from "lucide-react";
import { getWelcomeMessage, getMoodSuggestions } from "@/constants/chat";
import type { MoodAnalysis, ChatMessage, QuickAction } from "@/types/chat";

interface ChatInterfaceProps {
  weatherDescription?: string;
  location?: string;
  onMoodAnalyzed?: (analysis: MoodAnalysis) => void;
  currentTracks?: any[];
}

export default function ChatInterface({
  weatherDescription = "clear sky",
  location = "your area",
  onMoodAnalyzed,
  currentTracks = [],
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [initialized, setInitialized] = useState(false);

  // ✅ FIXED: Initialize chat with welcome message ONLY ONCE per location
  useEffect(() => {
    console.log("🐛 ChatInterface effect running:", {
      initialized,
      weatherDescription,
      location,
      messagesLength: messages.length,
    });

    if (!initialized && weatherDescription && location) {
      const welcomeMessage = getWelcomeMessage(weatherDescription, location);
      console.log("🐛 Adding welcome message:", welcomeMessage);
      setMessages([{ role: "assistant", content: welcomeMessage }]);
      setInitialized(true);
    }
  }, [weatherDescription, location, initialized]);

  // ✅ Reset chat when location actually changes
  useEffect(() => {
    const currentLocationKey = `${weatherDescription}-${location}`;
    const savedLocationKey = localStorage.getItem("currentLocationKey");

    if (savedLocationKey && savedLocationKey !== currentLocationKey) {
      console.log("🌍 Location changed, resetting chat");
      setInitialized(false);
      setMessages([]);
      setShowSuggestions(true);
      localStorage.setItem("currentLocationKey", currentLocationKey);
    } else if (!savedLocationKey) {
      localStorage.setItem("currentLocationKey", currentLocationKey);
    }
  }, [weatherDescription, location]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (messageToSend?: string) => {
    const userMessage = messageToSend || inputValue;
    if (!userMessage.trim() || isLoading) return;

    const userMsg = { role: "user" as const, content: userMessage };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      console.log("🎭 Sending enhanced chat request:", {
        message: userMessage,
        weatherDescription,
        location,
        currentTracks: currentTracks?.slice(0, 3),
      });

      const response = await fetch("/api/chat/analyze-mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          weatherDescription,
          location,
          currentGenre: localStorage.getItem("currentGenre") || "",
          currentTracks: currentTracks?.slice(0, 3),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server responded with ${response.status}`
        );
      }

      const data: MoodAnalysis = await response.json();
      console.log("🎯 Received enhanced analysis:", data);

      if (data.genres && data.genres.length > 0) {
        localStorage.setItem("currentGenre", data.genres[0]);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);

      if (data.suggestedActions) {
        const actions: QuickAction[] = data.suggestedActions.map(
          (action, index) => ({
            id: `action-${index}`,
            label: action,
            action: "mood_change",
            value: action.toLowerCase(),
          })
        );
        setQuickActions(actions);
      }

      if (onMoodAnalyzed && data.shouldRefreshPlaylist) {
        onMoodAnalyzed(data);
      }
    } catch (error) {
      console.error("❌ Failed to analyze mood:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Sorry, I couldn't process your request"
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble responding right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSubmit(action.label);
  };

  const handleMoodSuggestion = (mood: string) => {
    let message;
    switch (mood) {
      case "cozy":
        message = "I want a cozy playlist for relaxing";
        break;
      case "upbeat":
        message = "Give me some upbeat, energetic music";
        break;
      case "focus":
        message = "I need music to help me focus and concentrate";
        break;
      case "chill":
        message = "Play some chill, laid-back music";
        break;
      default:
        message = `Play some ${mood} music please`;
    }
    handleSubmit(message);
  };

  const moodSuggestions = getMoodSuggestions(weatherDescription);
  const enhancedSuggestions = [
    ...moodSuggestions,
    "study playlist",
    "cooking music",
    "workout vibes",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* ✅ OPTIMIZED: Chat messages with better sizing */}
      <div className="flex-1 min-h-0 mb-4">
        <div className="h-full overflow-y-auto">
          <div className="space-y-3 p-2">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}-${Date.now()}`} // ✅ Unique key to prevent duplicates
                className={`px-3 py-2 rounded-lg text-xs leading-relaxed ${
                  message.role === "user"
                    ? "bg-terracotta/20 text-soft-brown ml-auto max-w-[80%] border border-terracotta/10"
                    : "bg-white/20 text-soft-brown max-w-[80%] border border-white/10"
                }`}
              >
                {message.content}
              </div>
            ))}

            {isLoading && (
              <div className="bg-white/20 text-soft-brown px-3 py-2 rounded-lg max-w-[80%] text-xs">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-terracotta/70 animate-bounce" />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-terracotta/70 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-terracotta/70 animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* ✅ COMPACT: Interactive elements */}
      <div className="flex-shrink-0 space-y-2">
        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="px-2 py-1 text-xs bg-gradient-to-r from-terracotta/10 to-terracotta/20 text-terracotta rounded-full hover:from-terracotta/20 hover:to-terracotta/30 transition-all duration-200 flex items-center gap-1"
              >
                <Zap className="w-2 h-2" />
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Initial mood suggestion chips */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-1">
            {enhancedSuggestions.slice(0, 6).map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodSuggestion(mood)}
                className="px-2 py-1 text-xs bg-terracotta/10 text-terracotta rounded-full hover:bg-terracotta/20 transition-colors flex items-center gap-1"
              >
                <Music className="w-2 h-2" />
                {mood}
              </button>
            ))}
          </div>
        )}

        {/* Input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about music, request playlists..."
            className="flex-1 bg-white/10 text-soft-brown px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-terracotta/50 placeholder:text-soft-brown/50 text-xs"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-3 py-2 bg-terracotta/20 text-terracotta rounded-lg hover:bg-terracotta/30 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Send message"
          >
            <SendHorizontal className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
}
