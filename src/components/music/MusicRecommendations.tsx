// src/components/music/MusicRecommendations.tsx - CLEAN VERSION WITHOUT DUPLICATE HEADERS
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { FaSpotify, FaMusic } from "react-icons/fa";
import { Loader2, ExternalLink } from "lucide-react";
import type { SpotifyTrack } from "@/types/spotify";

interface MusicRecommendationsProps {
  weatherDescription: string;
  source?: string;
  onTracksLoaded?: (tracks: SpotifyTrack[]) => void;
  onSavePlaylist?: () => void;
}

export default function MusicRecommendations({
  weatherDescription = "clear sky",
  source = "weather",
  onTracksLoaded,
  onSavePlaylist,
}: MusicRecommendationsProps) {
  const { data: session } = useSession();
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchParams, setLastFetchParams] = useState<string>("");

  // MUSIC FETCHING WITH PROPER DEBOUNCING
  const fetchMusic = useCallback(
    async (forceRefresh = false) => {
      if (!session) {
        console.log("❌ No session available");
        return;
      }

      const currentParams = `${weatherDescription}-${source}`;

      if (
        !forceRefresh &&
        currentParams === lastFetchParams &&
        tracks.length > 0
      ) {
        console.log("⏭️ Same parameters, skipping fetch");
        return;
      }

      if (isLoading) {
        console.log("⏳ Already loading, skipping request");
        return;
      }

      console.log("🎵 Fetching music for:", weatherDescription);
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          weatherDescription: weatherDescription.toLowerCase(),
          source: source || "weather",
          t: Date.now().toString(),
        });

        const response = await fetch(`/api/music?${params}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Failed to fetch: ${response.status}`
          );
        }

        const musicTracks = await response.json();

        if (!Array.isArray(musicTracks)) {
          throw new Error("Invalid response format");
        }

        console.log("✅ Fetched tracks:", musicTracks.length);
        setTracks(musicTracks);
        setLastFetchParams(currentParams);

        if (onTracksLoaded) {
          onTracksLoaded(musicTracks);
        }
      } catch (err) {
        console.error("❌ Music fetch error:", err);
        setError(err instanceof Error ? err.message : "Could not load music");
        setTracks([]);
        if (onTracksLoaded) {
          onTracksLoaded([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      session,
      weatherDescription,
      source,
      isLoading,
      tracks.length,
      lastFetchParams,
      onTracksLoaded,
    ]
  );

  // Fetch music when parameters change
  useEffect(() => {
    if (session && !isLoading) {
      const timer = setTimeout(() => {
        fetchMusic();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [session, weatherDescription, source]);

  const formatDuration = (durationMs: number): string => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // RENDER CONDITIONS
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="text-center">
          <FaMusic className="w-12 h-12 text-soft-brown/30 mx-auto mb-4" />
          <h3 className="text-lg font-display text-soft-brown mb-2">
            Connect Spotify to Get Started
          </h3>
          <p className="text-soft-brown/60 text-sm">
            Use the Connect Spotify button in the sidebar
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-soft-brown" />
          <p className="text-soft-brown/70">
            Loading weather-inspired tracks...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-6 mt-6 text-red-500 text-center py-4 bg-red-50/10 rounded-lg">
        <p className="mb-3">{error}</p>
        <button
          onClick={() => fetchMusic(true)}
          className="px-4 py-2 bg-soft-brown/20 text-soft-brown rounded-lg hover:bg-soft-brown/30 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="text-center">
          <FaMusic className="w-12 h-12 text-soft-brown/30 mx-auto mb-3" />
          <p className="text-soft-brown/70 mb-4">No recommendations found</p>
          <button
            onClick={() => fetchMusic(true)}
            className="px-4 py-2 bg-soft-brown/20 text-soft-brown rounded-lg hover:bg-soft-brown/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // MAIN RENDER - NO DUPLICATE HEADERS, JUST TRACKS AND SAVE BUTTON
  return (
    <div className="flex-1 flex flex-col">
      {/* FIXED HEIGHT SCROLLABLE CONTAINER LIKE CHAT */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)]">
        <div className="p-6 space-y-2">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className="group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:bg-white/10 hover:shadow-sm hover:border-white/10 border border-transparent min-h-[72px]"
            >
              {/* TRACK NUMBER */}
              <div className="w-10 text-center">
                <span className="text-sm text-soft-brown/50 font-mono">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
              </div>

              {/* ALBUM ARTWORK */}
              {track.album?.images?.[2]?.url ||
              track.album?.images?.[1]?.url ? (
                <img
                  src={track.album.images[2]?.url || track.album.images[1]?.url}
                  alt={track.album?.name || track.name}
                  className="w-14 h-14 rounded-lg shadow-sm object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center">
                  <FaMusic className="text-soft-brown/50 w-5 h-5" />
                </div>
              )}

              {/* TRACK INFORMATION */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-soft-brown truncate mb-1 text-sm group-hover:text-terracotta/80 transition-colors">
                  {track.name}
                </div>
                <div className="text-xs text-soft-brown/70 truncate mb-1">
                  {track.artists?.map((a) => a.name).join(", ")}
                </div>
                {track.album?.name && (
                  <div className="text-xs text-soft-brown/50 truncate">
                    {track.album.name}
                  </div>
                )}
              </div>

              {/* TRACK METADATA */}
              <div className="flex items-center gap-4 text-soft-brown/60">
                {track.duration_ms && (
                  <span className="text-xs font-mono">
                    {formatDuration(track.duration_ms)}
                  </span>
                )}

                {track.external_urls?.spotify && (
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Open in Spotify"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SAVE TO PLAYLIST BUTTON - FIXED AT BOTTOM */}
      {tracks.length > 0 && (
        <div className="flex-shrink-0 p-6 border-t border-white/10">
          <button
            onClick={onSavePlaylist}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <FaSpotify className="w-5 h-5" />
            Save to Spotify Playlist
          </button>
        </div>
      )}
    </div>
  );
}
