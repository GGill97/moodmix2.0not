// src/components/music/MiniPlayer.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaMusic,
  FaVolumeUp,
} from "react-icons/fa";
import { ExternalLink } from "lucide-react";
import type { SpotifyTrack } from "@/types/spotify";

interface MiniPlayerProps {
  currentTrack?: SpotifyTrack | null;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onVolumeChange?: (volume: number) => void;
  progress?: number; // 0-100
  duration?: number; // in seconds
  currentTime?: number; // in seconds
}

export default function MiniPlayer({
  currentTrack,
  isPlaying = false,
  onPlayPause,
  onNext,
  onPrevious,
  onVolumeChange,
  progress = 0,
  duration = 30, // Spotify preview is 30 seconds
  currentTime = 0,
}: MiniPlayerProps) {
  const [volume, setVolume] = useState(70);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <footer className="glass border-t border-white/10 px-6 py-4">
      <div className="flex items-center gap-4 max-w-7xl mx-auto">
        {/* Now Playing Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1 max-w-xs">
          {/* Album Art */}
          {currentTrack.album?.images?.[2]?.url ? (
            <img
              src={currentTrack.album.images[2].url}
              alt={currentTrack.album?.name || currentTrack.name}
              className="w-12 h-12 rounded-lg shadow-sm object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <FaMusic className="text-soft-brown/50 w-6 h-6" />
            </div>
          )}

          {/* Track Info */}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-soft-brown truncate text-sm">
              {currentTrack.name}
            </div>
            <div className="text-xs text-soft-brown/70 truncate">
              {currentTrack.artists?.map((a) => a.name).join(", ")}
            </div>
          </div>

          {/* External Link */}
          {currentTrack.external_urls?.spotify && (
            <a
              href={currentTrack.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/10 rounded-full text-soft-brown/70 hover:text-soft-brown transition-colors flex-shrink-0"
              title="Open in Spotify"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={onPrevious}
            className="p-2 hover:bg-white/10 rounded-full text-soft-brown transition-colors"
            title="Previous Track"
          >
            <FaStepBackward className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayPause}
            className="p-3 bg-terracotta hover:bg-terracotta/80 rounded-full text-white transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <FaPause className="w-5 h-5" />
            ) : (
              <FaPlay className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-2 hover:bg-white/10 rounded-full text-soft-brown transition-colors"
            title="Next Track"
          >
            <FaStepForward className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="flex items-center gap-2 text-xs text-soft-brown/70 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span className="flex-1"></span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 min-w-0">
          <FaVolumeUp className="w-4 h-4 text-soft-brown/70 flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-terracotta
                     [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full 
                     [&::-moz-range-thumb]:bg-terracotta [&::-moz-range-thumb]:border-none"
          />
          <span className="text-xs text-soft-brown/70 w-8 text-right">
            {volume}%
          </span>
        </div>
      </div>
    </footer>
  );
}
