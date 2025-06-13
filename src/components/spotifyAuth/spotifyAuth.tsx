// src/components/spotifyAuth/SpotifyAuth.tsx - Updated version
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Music, Loader2, LogOut } from "lucide-react";

interface SpotifyAuthProps {
  className?: string; // Add flexibility for positioning
  variant?: "default" | "large"; // For different button sizes/styles
}

export default function SpotifyAuth({
  className = "",
  variant = "default",
}: SpotifyAuthProps) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (session) {
        await signOut({ redirect: false });
      } else {
        // Keep the current URL as callbackUrl
        await signIn("spotify", {
          redirect: false,
          callbackUrl: window.location.href,
        });
      }
    } catch (err) {
      console.error("Spotify auth error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <button
        disabled
        className={`inline-flex items-center gap-2 ${className}`}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading...</span>
      </button>
    );
  }

  const buttonClass =
    variant === "large" ? "px-6 py-3 text-base" : "px-4 py-2 text-sm";

  return (
    <>
      <button
        onClick={handleAuth}
        disabled={isLoading}
        className={`
          ${buttonClass}
          ${className}
          inline-flex items-center gap-2 rounded-full
          ${
            session
              ? "bg-terracotta/10 text-terracotta hover:bg-terracotta/20"
              : "bg-[#1DB954] text-white hover:bg-[#1ed760]"
          }
          transition-all duration-300 font-medium
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : session ? (
          <LogOut className="w-4 h-4" />
        ) : (
          <Music className="w-4 h-4" />
        )}
        <span>{session ? "Disconnect" : "Connect Spotify"}</span>
      </button>

      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center">
          {error}
        </div>
      )}
    </>
  );
}
