// src/utils/spotifyGenres.ts
interface SpotifyGenreResponse {
  genres: string[];
}

// Cache for Spotify genres to avoid frequent API calls
let cachedGenres: string[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export const getSpotifyGenres = async (
  accessToken: string
): Promise<string[]> => {
  try {
    // Check cache first
    const now = Date.now();
    if (cachedGenres && now - lastFetchTime < CACHE_DURATION) {
      console.log("Using cached Spotify genres");
      return cachedGenres;
    }

    console.log("Fetching Spotify genres directly...");
    // Try a different approach - get from the top-level API endpoint
    const response = await fetch(
      "https://api.spotify.com/v1/browse/categories",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Spotify API error:", {
        status: response.status,
        statusText: response.statusText,
      });
      // Don't throw, fallback to default genres
      return getDefaultGenres();
    }

    const data = await response.json();
    // Extract category names as genres
    const categories = data.categories?.items || [];
    const extractedGenres = categories.map((cat: any) => cat.id);

    // Update cache
    cachedGenres = extractedGenres;
    lastFetchTime = now;

    console.log(`Retrieved ${extractedGenres.length} available Spotify genres`);
    return extractedGenres;
  } catch (error) {
    console.error("Error fetching Spotify genres:", error);
    return getDefaultGenres();
  }
};

// Helper function to validate genres against Spotify's available genres
export const validateGenres = (
  genres: string[],
  availableGenres: string[]
): string[] => {
  // Make sure both arrays are lowercase for comparison
  const normalizedAvailable = availableGenres.map(g => g.toLowerCase());
  const validGenres = genres.filter((genre) =>
    normalizedAvailable.includes(genre.toLowerCase())
  );

  if (validGenres.length === 0) {
    console.warn("No valid genres found, using default genres");
    return ["pop", "electronic"];
  }

  return validGenres;
};

// Reliable default genres that we know work with Spotify
function getDefaultGenres(): string[] {
  return [
    "pop",
    "rock",
    "hip-hop",
    "electronic",
    "classical",
    "jazz",
    "indie",
    "r-n-b",
    "country",
    "metal"
  ];
}