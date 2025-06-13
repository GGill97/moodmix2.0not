// src/components/layout/WeatherMusicSection.tsx - SIMPLE & WORKING VERSION
"use client";

import React, { useState, useEffect } from "react";
import CompactWeatherHeader from "@/components/weather/CompactWeatherHeader";
import MusicRecommendations from "@/components/music/MusicRecommendations";
import ChatSidebar from "@/components/layout/ChatSidebar";
import MiniPlayer from "@/components/music/MiniPlayer";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import type { WeatherData } from "@/types/weather";
import type { MoodAnalysis } from "@/types/chat";
import type { SpotifyTrack } from "@/types/spotify";

interface WeatherMusicSectionProps {
  weatherData: WeatherData;
  location: string;
  moodAnalysis?: MoodAnalysis | null;
  onMoodAnalysis?: (analysis: MoodAnalysis) => void;
  spotifyAccessToken?: string;
}

export default function WeatherMusicSection({
  weatherData,
  location,
  moodAnalysis,
  onMoodAnalysis,
  spotifyAccessToken,
}: WeatherMusicSectionProps) {
  const { data: session } = useSession();
  const [musicSource, setMusicSource] = useState<"weather" | "mood">("weather");
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [currentMoodGenres, setCurrentMoodGenres] = useState<string[]>([]);
  const [insightsLoaded, setInsightsLoaded] = useState(false);
  const [cityInsights, setCityInsights] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "insights">("chat");
  const [currentTracks, setCurrentTracks] = useState<SpotifyTrack[]>([]);
  const [musicLoading, setMusicLoading] = useState(false);

  // SIMPLE AUDIO STATE
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Effect to handle mood analysis updates
  useEffect(() => {
    if (
      moodAnalysis?.shouldRefreshPlaylist &&
      moodAnalysis.genres?.length > 0
    ) {
      setCurrentMoodGenres(moodAnalysis.genres);
      setMusicSource("mood");
      setRefreshKey((prev) => prev + 1);
    }
  }, [moodAnalysis]);

  useEffect(() => {
    setCityInsights(null);
    setInsightsLoaded(false);
  }, [location]);

  // Handle mood analysis from chat
  const handleMoodAnalyzed = (analysis: MoodAnalysis) => {
    if (analysis.shouldRefreshPlaylist) {
      setCurrentMoodGenres(analysis.genres || []);
      setMusicSource("mood");
      setRefreshKey((prev) => prev + 1);
    }
    if (onMoodAnalysis) {
      onMoodAnalysis(analysis);
    }
  };

  // Handle tracks loaded
  const handleTracksLoaded = (tracks: SpotifyTrack[]) => {
    setCurrentTracks(tracks);
    setMusicLoading(false);
  };

  // Fetch city insights
  useEffect(() => {
    if (!location || insightsLoaded || cityInsights) return;

    const fetchCityInsights = async () => {
      try {
        const response = await fetch("/api/city-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city: location,
            weather: weatherData.weather[0].description,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setCityInsights(data);
        }
        setInsightsLoaded(true);
      } catch (error) {
        console.error("Error fetching city insights:", error);
        setInsightsLoaded(true);
      }
    };

    fetchCityInsights();
  }, [location]);

  // SIMPLE PLAY TRACK FUNCTION
  const playTrack = (track: SpotifyTrack) => {
    if (!track.preview_url) {
      alert("No preview available for this track");
      return;
    }

    // Stop current audio
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }

    // Create new audio
    const newAudio = new Audio(track.preview_url);
    newAudio.volume = 0.7;

    // Simple event handlers
    newAudio.ontimeupdate = () => {
      if (newAudio.duration) {
        setProgress((newAudio.currentTime / newAudio.duration) * 100);
        setCurrentTime(newAudio.currentTime);
      }
    };

    newAudio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    newAudio.onerror = () => {
      alert("Error playing track");
      setIsPlaying(false);
    };

    // Play the track
    newAudio
      .play()
      .then(() => {
        setAudio(newAudio);
        setCurrentTrack(track);
        setIsPlaying(true);
      })
      .catch((error) => {
        if (error.name === "NotAllowedError") {
          alert("Click anywhere on the page first, then try again");
        } else {
          alert("Could not play track");
        }
      });
  };

  // SIMPLE PLAY/PAUSE FUNCTION
  const handlePlayPause = () => {
    if (!audio || !currentTrack?.preview_url) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          alert("Could not resume playback");
        });
    }
  };

  // SIMPLE NEXT/PREVIOUS
  const handleNext = () => {
    if (!currentTracks.length || !currentTrack) return;
    const currentIndex = currentTracks.findIndex(
      (t) => t.id === currentTrack.id
    );
    const nextTrack = currentTracks[(currentIndex + 1) % currentTracks.length];
    if (nextTrack?.preview_url) playTrack(nextTrack);
  };

  const handlePrevious = () => {
    if (!currentTracks.length || !currentTrack) return;
    const currentIndex = currentTracks.findIndex(
      (t) => t.id === currentTrack.id
    );
    const prevIndex =
      currentIndex === 0 ? currentTracks.length - 1 : currentIndex - 1;
    const prevTrack = currentTracks[prevIndex];
    if (prevTrack?.preview_url) playTrack(prevTrack);
  };

  const handleVolumeChange = (volume: number) => {
    if (audio) audio.volume = volume / 100;
  };

  // WORKING REFRESH FUNCTION - SIMPLER APPROACH
  const handleRefresh = () => {
    console.log("🔄 Refresh triggered - forcing component remount");
    setMusicLoading(true);

    // Stop current playback
    if (audio) {
      audio.pause();
      setIsPlaying(false);
      setCurrentTrack(null);
    }

    // Clear tracks immediately
    setCurrentTracks([]);

    // Force component remount with new key
    setRefreshKey((prev) => prev + 1);
  };

  // REPLACE the handleSavePlaylist function in WeatherMusicSection.tsx with this:

  const handleSavePlaylist = async () => {
    if (!session || !currentTracks.length) {
      alert("No tracks to save or not logged in");
      return;
    }

    try {
      console.log("💾 Saving playlist to Spotify...");

      // Get track URIs (only tracks with URIs)
      const trackUris = currentTracks
        .filter((track) => track.uri)
        .map((track) => track.uri);

      if (trackUris.length === 0) {
        alert("No valid tracks to save");
        return;
      }

      // Call API with complete data for better naming
      const response = await fetch("/api/spotify/create-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackUris: trackUris,
          location: location, // ✅ Now passing location
          weatherDescription: weatherDescription, // ✅ Now passing weather
          source: musicSource, // ✅ Now passing source (weather vs mood)
          // Let the API generate the smart name and description
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}`);
        console.log("✅ Playlist created:", result);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to create playlist");
      }
    } catch (error) {
      console.error("❌ Error saving playlist:", error);
      alert("Failed to save playlist. Please try again.");
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [audio]);

  if (!weatherData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-soft-brown" />
      </div>
    );
  }

  const weatherDescription = weatherData.weather[0]?.description || "";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Compact Weather Header */}
      <div className="flex-shrink-0">
        <CompactWeatherHeader weatherData={weatherData} city={location} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-8 p-6">
        {/* Chat Sidebar */}
        <div className="w-96 flex-shrink-0 h-[calc(100vh-160px)]">
          <ChatSidebar
            weatherDescription={weatherDescription}
            city={location}
            moodAnalysis={moodAnalysis}
            onMoodAnalyzed={handleMoodAnalyzed}
            currentTracks={currentTracks}
            insightsLoaded={insightsLoaded}
            cityInsights={cityInsights}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Music Main Area */}
        <div className="flex-1 glass rounded-2xl flex flex-col h-[calc(100vh-160px)]">
          {/* Music Header */}
          <div className="flex-shrink-0 p-6 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-display text-soft-brown mb-2">
                  Weather-Inspired Music
                </h2>
                <h3 className="text-lg text-soft-brown/80">
                  {musicSource === "mood" && currentMoodGenres.length > 0
                    ? `Mood: ${currentMoodGenres.join(", ")}`
                    : `Weather: ${getGenreFromWeather(weatherDescription)}`}
                </h3>
                <p className="text-sm text-soft-brown/60 mt-1">
                  {currentTracks.length} tracks available
                </p>
              </div>

              <div className="text-right">
                <button
                  onClick={handleRefresh}
                  className="btn btn-secondary text-sm"
                  disabled={musicLoading}
                >
                  {musicLoading ? "⏳" : "🔄"} Refresh Playlist
                </button>
              </div>
            </div>
          </div>

          {/* Music Content */}
          <div className="flex-1 min-h-0">
            <MusicRecommendations
              key={`music-${refreshKey}`}
              weatherDescription={
                musicSource === "mood" && currentMoodGenres.length > 0
                  ? currentMoodGenres.join(",")
                  : weatherDescription
              }
              source={musicSource}
              onTracksLoaded={handleTracksLoaded}
              onTrackPlay={playTrack}
              currentlyPlayingId={currentTrack?.id || null}
              onSavePlaylist={handleSavePlaylist}
            />
          </div>
        </div>
      </div>

      {/* Mini Player */}
      <div className="flex-shrink-0">
        <MiniPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onVolumeChange={handleVolumeChange}
          progress={progress}
          currentTime={currentTime}
          duration={30}
        />
      </div>
    </div>
  );
}

// Helper function
function getGenreFromWeather(weather: string): string {
  const weatherLower = weather.toLowerCase();
  if (weatherLower.includes("rain")) return "ambient & jazz";
  if (weatherLower.includes("cloud")) return "chill & indie";
  if (weatherLower.includes("clear")) return "upbeat & happy";
  if (weatherLower.includes("storm")) return "intense & dramatic";
  if (weatherLower.includes("snow")) return "peaceful & classical";
  return "mood-appropriate";
}
