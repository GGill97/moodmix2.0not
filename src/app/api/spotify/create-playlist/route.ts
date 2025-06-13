// src/app/api/spotify/create-playlist/route.ts - UPDATED VERSION
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { createPlaylist, getUserProfile, getRecommendations } from "@/utils/spotifyApi";
import type { SpotifyTrack } from "@/types/spotify";

/* 
Enhanced to handle TWO use cases:
1. Generate new recommendations and create playlist (original functionality)
2. Save existing tracks to a new playlist (new functionality)
*/

export async function POST(req: Request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Parse request body
    const {
      // For saving existing tracks (NEW)
      trackUris,
      
      // For generating new recommendations (EXISTING)
      genres,
      weatherDescription,
      
      // Common fields
      name = "Your Weather, Your Beats Playlist",
      description = "Created by Your Weather, Your Beats",
    } = await req.json();

    console.log("🎵 Create playlist request:", {
      hasTrackUris: !!trackUris,
      trackCount: trackUris?.length || 0,
      hasGenres: !!genres,
      weatherDescription,
    });

    let tracks: SpotifyTrack[] = [];

    // CASE 1: Save existing tracks (NEW FUNCTIONALITY)
    if (trackUris && Array.isArray(trackUris) && trackUris.length > 0) {
      console.log("💾 Saving existing tracks to playlist");
      
      // We already have the track URIs, no need to fetch tracks
      // Just validate that they're valid URIs
      const validUris = trackUris.filter(uri => 
        typeof uri === "string" && uri.startsWith("spotify:track:")
      );
      
      if (validUris.length === 0) {
        return NextResponse.json(
          { error: "No valid Spotify track URIs provided" },
          { status: 400 }
        );
      }

      console.log(`✅ Using ${validUris.length} existing track URIs`);
      
      try {
        // Get user profile
        const userData = await getUserProfile(session.accessToken);
        
        // Create playlist with existing tracks
        const playlist = await createPlaylist(
          session.accessToken,
          userData.id,
          name,
          `${description} - ${new Date().toLocaleDateString()}`,
          validUris
        );

        return NextResponse.json({
          success: true,
          playlistId: playlist.id,
          playlistUrl: playlist.external_urls.spotify,
          tracksAdded: validUris.length,
          message: `Successfully created playlist "${name}" with ${validUris.length} tracks`,
        });

      } catch (error) {
        console.error("❌ Error creating playlist with existing tracks:", error);
        return NextResponse.json(
          { error: "Failed to create playlist with provided tracks" },
          { status: 500 }
        );
      }
    }

    // CASE 2: Generate new recommendations (EXISTING FUNCTIONALITY)
    else if (genres && Array.isArray(genres) && genres.length > 0) {
      console.log("🎲 Generating new recommendations for playlist");

      try {
        // Get track recommendations using your existing function
        tracks = await getRecommendations(session.accessToken, {
          genres: genres,
          limit: 20,
          market: "US",
          // Add weather-based audio features if needed
          ...(weatherDescription && getAudioFeaturesForWeather(weatherDescription)),
        });

        if (!tracks.length) {
          return NextResponse.json(
            { error: "No tracks found for given parameters" },
            { status: 404 }
          );
        }

        console.log(`✅ Generated ${tracks.length} recommendations`);

        // Get user profile
        const userData = await getUserProfile(session.accessToken);

        // Create playlist with recommended tracks
        const playlist = await createPlaylist(
          session.accessToken,
          userData.id,
          name,
          `${description} - ${weatherDescription} - ${new Date().toLocaleDateString()}`,
          tracks.map((track: SpotifyTrack) => track.uri)
        );

        return NextResponse.json({
          success: true,
          playlistId: playlist.id,
          playlistUrl: playlist.external_urls.spotify,
          tracks,
          tracksAdded: tracks.length,
          message: `Successfully created playlist "${name}" with ${tracks.length} recommendations`,
        });

      } catch (error) {
        console.error("❌ Error generating recommendations:", error);
        return NextResponse.json(
          { error: "Failed to generate recommendations and create playlist" },
          { status: 500 }
        );
      }
    }

    // CASE 3: Invalid request
    else {
      return NextResponse.json(
        { 
          error: "Invalid request: provide either 'trackUris' to save existing tracks or 'genres' to generate recommendations" 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("❌ Create playlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to get audio features based on weather (for recommendations)
function getAudioFeaturesForWeather(weather: string): Record<string, number> {
  const weatherLower = weather.toLowerCase();

  if (weatherLower.includes("rain") || weatherLower.includes("drizzle")) {
    return {
      valence: 0.3,  // Lower happiness
      energy: 0.4,   // Lower energy
      tempo: 100,    // Slower tempo
    };
  } else if (weatherLower.includes("clear") || weatherLower.includes("sunny")) {
    return {
      valence: 0.8,  // High happiness
      energy: 0.7,   // High energy
      tempo: 120,    // Upbeat tempo
    };
  } else if (weatherLower.includes("storm")) {
    return {
      valence: 0.5,  // Neutral happiness
      energy: 0.9,   // Very high energy
      tempo: 140,    // Fast tempo
    };
  } else if (weatherLower.includes("snow")) {
    return {
      valence: 0.6,  // Peaceful
      energy: 0.3,   // Very low energy
      tempo: 80,     // Slow tempo
    };
  }

  // Default balanced features
  return {
    valence: 0.6,
    energy: 0.6,
    tempo: 110,
  };
}