import React, { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { FaSpotify, FaPlay, FaPause } from "react-icons/fa";

interface Track {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  uri: string;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

interface MusicRecommendationsProps {
  weatherDescription?: string;
  moodGenres?: string[];
  displayTitle?: string;
}

export default function MusicRecommendations({
  weatherDescription,
  moodGenres,
  displayTitle,
}: MusicRecommendationsProps) {
  const { data: session } = useSession();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
    null
  );

  // If not signed in, show sign in button
  if (!session) {
    return (
      <div className="p-6 text-center space-y-4">
        <h3 className="text-xl font-medium text-soft-brown mb-4">
          Connect to Spotify
        </h3>
        <button
          onClick={() => signIn("spotify")}
          className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          <FaSpotify className="text-xl" />
          Sign in with Spotify
        </button>
      </div>
    );
  }

  const handlePlayPause = (trackId: string) => {
    setCurrentlyPlayingId(currentlyPlayingId === trackId ? null : trackId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">
          <p className="text-lg text-soft-brown/70">
            Loading recommendations...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // No tracks state
  if (!tracks.length) {
    return (
      <div className="p-6 text-center text-soft-brown/70">
        <p>Start chatting to get music recommendations!</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-soft-brown">
        {displayTitle || "Music Recommendations"}
      </h2>

      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto custom-scrollbar pr-2">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-soft-brown">{track.name}</h3>
                <p className="text-sm text-soft-brown/75">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {track.preview_url ? (
                  <button
                    onClick={() => handlePlayPause(track.id)}
                    className="p-2 rounded-full bg-terracotta/20 hover:bg-terracotta/30 
                             transition-colors flex items-center justify-center"
                    aria-label={
                      currentlyPlayingId === track.id ? "Pause" : "Play"
                    }
                  >
                    {currentlyPlayingId === track.id ? <FaPause /> : <FaPlay />}
                  </button>
                ) : (
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-terracotta/20 hover:bg-terracotta/30 
                             transition-colors flex items-center justify-center"
                  >
                    <FaSpotify />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
