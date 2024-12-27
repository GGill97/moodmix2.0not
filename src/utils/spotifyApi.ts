// src/utils/spotifyApi.ts
import type { SpotifyTrack } from "@/types/chat";

export const getRecommendations = async (
  accessToken: string,
  genres: string[]
): Promise<SpotifyTrack[]> => {
  if (!accessToken || !genres.length) return [];

  try {
    const response = await fetch(
      `/api/music?genres=${encodeURIComponent(
        genres.join(",")
      )}&accessToken=${encodeURIComponent(accessToken)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to get recommendations: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
};
