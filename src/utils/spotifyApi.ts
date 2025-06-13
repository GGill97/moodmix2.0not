// // src/utils/spotifyApi.ts

// import type { SpotifyTrack, SpotifyPlaylist } from "@/types/spotify";

// interface SpotifyGenreResponse {
//   genres: string[];
// }

// // --- 1. Enhanced TypeScript Types ---

// interface SpotifyError extends Error {
//   status?: number;
//   retryable: boolean;
//   details?: unknown;
// }

// interface SpotifyRequestConfig {
//   endpoint: string;
//   method?: "GET" | "POST" | "PUT" | "DELETE";
//   body?: object;
//   accessToken: string;
//   timeout?: number;
//   retries?: number;
// }

// interface SpotifyRecommendationParams {
//   genres?: string[];
//   artitst?: string[];
//   valence?: number;
//   energy?: number;
//   tempo?: number;
//   danceability?: number;
//   limit?: number;
//   market?: string;
// }

// interface CacheEntry<T> {
//   data: T;
//   timestamp: number;
//   expiresAt: number;
// }

// // --- 2. Constants and Configuration ---

// const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
// const DEFAULT_TIMEOUT = 10000; // 10 seconds
// const MAX_RETRIES = 3;
// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
// const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
// const MAX_REQUESTS_PER_WINDOW = 50;

// const REQUEST_HEADERS = {
//   "Content-Type": "application/json",
// };

// // --- 3. Cache Implementation ---

// class SpotifyCache {
//   private cache = new Map<string, CacheEntry<any>>();
//   private requests: { timestamp: number }[] = [];

//   isCached(key: string): boolean {
//     const entry = this.cache.get(key);
//     return entry !== undefined && entry.expiresAt > Date.now();
//   }

//   get<T>(key: string): T | null {
//     const entry = this.cache.get(key);
//     if (entry && entry.expiresAt > Date.now()) {
//       return entry.data;
//     }
//     this.cache.delete(key);
//     return null;
//   }

//   set<T>(key: string, data: T, duration: number = CACHE_DURATION): void {
//     const now = Date.now();
//     this.cache.set(key, {
//       data,
//       timestamp: now,
//       expiresAt: now + duration,
//     });
//   }

//   clearExpired(): void {
//     const now = Date.now();
//     for (const [key, entry] of this.cache.entries()) {
//       if (entry.expiresAt <= now) {
//         this.cache.delete(key);
//       }
//     }
//   }

//   // Rate limiting
//   canMakeRequest(): boolean {
//     const now = Date.now();
//     this.requests = this.requests.filter(
//       (req) => req.timestamp > now - RATE_LIMIT_WINDOW
//     );
//     return this.requests.length < MAX_REQUESTS_PER_WINDOW;
//   }

//   trackRequest(): void {
//     this.requests.push({ timestamp: Date.now() });
//   }
// }

// const cache = new SpotifyCache();

// // --- 4. Error Handling ---

// class SpotifyAPIError extends Error implements SpotifyError {
//   constructor(
//     message: string,
//     public status?: number,
//     public retryable: boolean = false,
//     public details?: unknown
//   ) {
//     super(message);
//     this.name = "SpotifyAPIError";
//   }
// }

// function isRetryableError(error: SpotifyError): boolean {
//   if (error.status) {
//     return [408, 429, 500, 502, 503, 504].includes(error.status);
//   }
//   return error.retryable;
// }

// // --- 5. Core API Client ---

// async function makeRequest<T>({
//   endpoint,
//   method = "GET",
//   body,
//   accessToken,
//   timeout = DEFAULT_TIMEOUT,
//   retries = MAX_RETRIES,
// }: SpotifyRequestConfig): Promise<T> {
//   if (!cache.canMakeRequest()) {
//     throw new SpotifyAPIError("Rate limit exceeded", 429, true);
//   }

//   const url = endpoint.startsWith("http")
//     ? endpoint
//     : `${SPOTIFY_API_BASE}${endpoint}`;
//   let attempt = 0;

//   while (attempt <= retries) {
//     try {
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), timeout);

//       const response = await fetch(url, {
//         method,
//         headers: {
//           ...REQUEST_HEADERS,
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: body ? JSON.stringify(body) : undefined,
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);
//       cache.trackRequest();

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new SpotifyAPIError(
//           errorData.error?.message || `HTTP ${response.status}`,
//           response.status,
//           isRetryableError({ status: response.status } as SpotifyError),
//           errorData
//         );
//       }

//       const data = await response.json();
//       return data as T;
//     } catch (error) {
//       const isRetryable = error instanceof SpotifyAPIError && error.retryable;

//       if (attempt === retries || !isRetryable) {
//         throw error;
//       }

//       const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
//       await new Promise((resolve) => setTimeout(resolve, delay));
//       attempt++;
//     }
//   }

//   throw new SpotifyAPIError("Max retries exceeded", undefined, false);
// }

// // --- 6. Public API Functions ---

// // export async function getRecommendations(
// //   accessToken: string,
// //   params: SpotifyRecommendationParams
// // ): Promise<SpotifyTrack[]> {
// //   const queryParams = new URLSearchParams({
// //     limit: String(params.limit || 20),
// //     market: params.market || "US",
// //     ...(params.genres && { seed_genres: params.genres.join(",") }),
// //     ...(params.valence && { target_valence: String(params.valence) }),
// //     ...(params.energy && { target_energy: String(params.energy) }),
// //     ...(params.tempo && { target_tempo: String(params.tempo) }),
// //     ...(params.danceability && {
// //       target_danceability: String(params.danceability),
// //     }),
// //   });

// //   const cacheKey = `recommendations:${queryParams.toString()}`;
// //   const cachedData = cache.get<SpotifyTrack[]>(cacheKey);

// //   if (cachedData) {
// //     return cachedData;
// //   }

// //   const data = await makeRequest<{ tracks: SpotifyTrack[] }>({
// //     endpoint: `/recommendations?${queryParams}`,
// //     accessToken,
// //   });

// //   cache.set(cacheKey, data.tracks);
// //   return data.tracks;
// // }

// export async function getRecommendations(
//   accessToken: string,
//   params: SpotifyRecommendationParams
// ): Promise<SpotifyTrack[]> {
//   // Add validation for required parameters
//   if (!params.genres || params.genres.length === 0) {
//     console.error("No genres provided for recommendations");
//     throw new SpotifyAPIError("At least one genre is required", 400);
//   }

//   // Ensure we only use valid genre values
//   const validatedGenres = params.genres.filter(
//     (genre) => genre && typeof genre === "string" && genre.trim().length > 0
//   );

//   if (validatedGenres.length === 0) {
//     console.error("No valid genres provided");
//     throw new SpotifyAPIError("No valid genres provided", 400);
//   }

//   const queryParams = new URLSearchParams({
//     limit: String(params.limit || 20),
//     market: params.market || "US",
//     seed_genres: validatedGenres.join(","),
//     ...(params.valence && { target_valence: String(params.valence) }),
//     ...(params.energy && { target_energy: String(params.energy) }),
//     ...(params.tempo && { target_tempo: String(params.tempo) }),
//     ...(params.danceability && {
//       target_danceability: String(params.danceability),
//     }),
//   });

//   // Log the exact request URL (remove token for security)
//   const requestUrl = `${SPOTIFY_API_BASE}/recommendations?${queryParams.toString()}`;
//   console.log("Spotify recommendations request URL:", requestUrl);

//   const cacheKey = `recommendations:${queryParams.toString()}`;
//   const cachedData = cache.get<SpotifyTrack[]>(cacheKey);

//   if (cachedData) {
//     return cachedData;
//   }

//   try {
//     const data = await makeRequest<{ tracks: SpotifyTrack[] }>({
//       endpoint: `/recommendations?${queryParams}`,
//       accessToken,
//     });

//     cache.set(cacheKey, data.tracks);
//     return data.tracks;
//   } catch (error) {
//     // Enhanced error logging
//     console.error("Recommendations request failed:", {
//       url: requestUrl,
//       error:
//         error instanceof SpotifyAPIError
//           ? { message: error.message, status: error.status }
//           : error,
//     });
//     throw error;
//   }
// }
// export async function createPlaylist(
//   accessToken: string,
//   userId: string,
//   name: string,
//   description: string,
//   trackUris: string[]
// ): Promise<SpotifyPlaylist> {
//   // Create playlist
//   const playlist = await makeRequest<SpotifyPlaylist>({
//     endpoint: `/users/${userId}/playlists`,
//     method: "POST",
//     accessToken,
//     body: {
//       name,
//       description,
//       public: false,
//     },
//   });

//   // Add tracks to playlist
//   if (trackUris.length > 0) {
//     await makeRequest({
//       endpoint: `/playlists/${playlist.id}/tracks`,
//       method: "POST",
//       accessToken,
//       body: {
//         uris: trackUris,
//       },
//     });
//   }

//   return playlist;
// }

// export async function updatePlaylist(
//   accessToken: string,
//   playlistId: string,
//   trackUris: string[]
// ): Promise<void> {
//   await makeRequest({
//     endpoint: `/playlists/${playlistId}/tracks`,
//     method: "PUT",
//     accessToken,
//     body: {
//       uris: trackUris,
//     },
//   });
// }

// export async function getUserProfile(
//   accessToken: string
// ): Promise<{ id: string; display_name: string }> {
//   const cacheKey = `profile:${accessToken.slice(-10)}`;
//   const cachedData = cache.get<{ id: string; display_name: string }>(cacheKey);

//   if (cachedData) {
//     return cachedData;
//   }

//   const data = await makeRequest<{ id: string; display_name: string }>({
//     endpoint: "/me",
//     accessToken,
//   });

//   cache.set(cacheKey, data);
//   return data;
// }

// export async function getSpotifyGenres(accessToken: string): Promise<string[]> {
//   const cacheKey = "spotify:available-genres";
//   const cachedData = cache.get<string[]>(cacheKey);

//   if (cachedData) {
//     return cachedData;
//   }

//   try {
//     const data = await makeRequest<SpotifyGenreResponse>({
//       endpoint: "/recommendations/available-genre-seeds",
//       accessToken,
//     });

//     cache.set(cacheKey, data.genres, CACHE_DURATION * 24); // Cache for longer since these rarely change
//     return data.genres;
//   } catch (error) {
//     console.error("Failed to fetch Spotify genres:", error);
//     throw new SpotifyAPIError(
//       "Failed to fetch available genres",
//       error instanceof SpotifyAPIError ? error.status : undefined
//     );
//   }
// }

// // --- 7. Error Handling Utilities ---

// export function handleSpotifyError(error: unknown): string {
//   if (error instanceof SpotifyAPIError) {
//     switch (error.status) {
//       case 401:
//         return "Please reconnect your Spotify account";
//       case 403:
//         return "Insufficient permissions for this action";
//       case 429:
//         return "Too many requests. Please try again later";
//       default:
//         return error.message;
//     }
//   }

//   return "An unexpected error occurred";
// }

// // Clean up expired cache entries periodically
// setInterval(() => cache.clearExpired(), CACHE_DURATION);

// src/utils/spotifyApi.ts

import type { SpotifyTrack, SpotifyPlaylist } from "@/types/spotify";

interface SpotifyGenreResponse {
  genres: string[];
}

// --- 1. Enhanced TypeScript Types ---

interface SpotifyError extends Error {
  status?: number;
  retryable: boolean;
  details?: unknown;
}

interface SpotifyRequestConfig {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: object;
  accessToken: string;
  timeout?: number;
  retries?: number;
}

interface SpotifyRecommendationParams {
  genres?: string[];
  artists?: string[];  // Fixed the typo from "artitst" to "artists"
  valence?: number;
  energy?: number;
  tempo?: number;
  danceability?: number;
  limit?: number;
  market?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// --- 2. Constants and Configuration ---

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 50;

const REQUEST_HEADERS = {
  "Content-Type": "application/json",
};

// --- 3. Cache Implementation ---

class SpotifyCache {
  private cache = new Map<string, CacheEntry<any>>();
  private requests: { timestamp: number }[] = [];

  isCached(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && entry.expiresAt > Date.now();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }
    this.cache.delete(key);
    return null;
  }

  set<T>(key: string, data: T, duration: number = CACHE_DURATION): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration,
    });
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  // Rate limiting
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(
      (req) => req.timestamp > now - RATE_LIMIT_WINDOW
    );
    return this.requests.length < MAX_REQUESTS_PER_WINDOW;
  }

  trackRequest(): void {
    this.requests.push({ timestamp: Date.now() });
  }
}

const cache = new SpotifyCache();

// --- 4. Error Handling ---

class SpotifyAPIError extends Error implements SpotifyError {
  constructor(
    message: string,
    public status?: number,
    public retryable: boolean = false,
    public details?: unknown
  ) {
    super(message);
    this.name = "SpotifyAPIError";
  }
}

function isRetryableError(error: SpotifyError): boolean {
  if (error.status) {
    return [408, 429, 500, 502, 503, 504].includes(error.status);
  }
  return error.retryable;
}

// --- 5. Core API Client ---

async function makeRequest<T>({
  endpoint,
  method = "GET",
  body,
  accessToken,
  timeout = DEFAULT_TIMEOUT,
  retries = MAX_RETRIES,
}: SpotifyRequestConfig): Promise<T> {
  if (!cache.canMakeRequest()) {
    throw new SpotifyAPIError("Rate limit exceeded", 429, true);
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${SPOTIFY_API_BASE}${endpoint}`;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: {
          ...REQUEST_HEADERS,
          Authorization: `Bearer ${accessToken}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      cache.trackRequest();

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new SpotifyAPIError(
          errorData.error?.message || `HTTP ${response.status}`,
          response.status,
          isRetryableError({ status: response.status } as SpotifyError),
          errorData
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      const isRetryable = error instanceof SpotifyAPIError && error.retryable;

      if (attempt === retries || !isRetryable) {
        throw error;
      }

      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
    }
  }

  throw new SpotifyAPIError("Max retries exceeded", undefined, false);
}

// --- 6. Public API Functions ---

export async function getRecommendations(
  accessToken: string,
  params: SpotifyRecommendationParams
): Promise<SpotifyTrack[]> {
  // Check if at least one seed parameter is provided
  const hasGenres = params.genres && params.genres.length > 0;
  const hasArtists = params.artists && params.artists.length > 0;
  
  if (!hasGenres && !hasArtists) {
    // Default to a popular artist if no seeds are provided
    console.log("No seeds provided, using default artist seed");
    params.artists = ["4dpARuHxo51G3z768sgnrY"]; // Adele
  }

  // Construct query parameters
  const queryParams = new URLSearchParams({
    limit: String(params.limit || 20),
    market: params.market || "US",
  });

  // Add genre seeds if available
  if (hasGenres) {
    const validatedGenres = params.genres!.filter(
      (genre) => genre && typeof genre === "string" && genre.trim().length > 0
    );
    
    if (validatedGenres.length > 0) {
      queryParams.append("seed_genres", validatedGenres.join(","));
    }
  }

  // Add artist seeds if available
  if (hasArtists) {
    queryParams.append("seed_artists", params.artists!.join(","));
  }

  // Add target parameters if available
  if (params.valence !== undefined) queryParams.append("target_valence", String(params.valence));
  if (params.energy !== undefined) queryParams.append("target_energy", String(params.energy));
  if (params.tempo !== undefined) queryParams.append("target_tempo", String(params.tempo));
  if (params.danceability !== undefined) queryParams.append("target_danceability", String(params.danceability));

  // Log the exact request URL (remove token for security)
  const requestUrl = `${SPOTIFY_API_BASE}/recommendations?${queryParams.toString()}`;
  console.log("Spotify recommendations request URL:", requestUrl);

  const cacheKey = `recommendations:${queryParams.toString()}`;
  const cachedData = cache.get<SpotifyTrack[]>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  try {
    const data = await makeRequest<{ tracks: SpotifyTrack[] }>({
      endpoint: `/recommendations?${queryParams}`,
      accessToken,
    });

    cache.set(cacheKey, data.tracks);
    return data.tracks;
  } catch (error) {
    // Enhanced error logging
    console.error("Recommendations request failed:", {
      url: requestUrl,
      error:
        error instanceof SpotifyAPIError
          ? { message: error.message, status: error.status }
          : error,
    });
    throw error;
  }
}

export async function createPlaylist(
  accessToken: string,
  userId: string,
  name: string,
  description: string,
  trackUris: string[]
): Promise<SpotifyPlaylist> {
  // Create playlist
  const playlist = await makeRequest<SpotifyPlaylist>({
    endpoint: `/users/${userId}/playlists`,
    method: "POST",
    accessToken,
    body: {
      name,
      description,
      public: false,
    },
  });

  // Add tracks to playlist
  if (trackUris.length > 0) {
    await makeRequest({
      endpoint: `/playlists/${playlist.id}/tracks`,
      method: "POST",
      accessToken,
      body: {
        uris: trackUris,
      },
    });
  }

  return playlist;
}

export async function updatePlaylist(
  accessToken: string,
  playlistId: string,
  trackUris: string[]
): Promise<void> {
  await makeRequest({
    endpoint: `/playlists/${playlistId}/tracks`,
    method: "PUT",
    accessToken,
    body: {
      uris: trackUris,
    },
  });
}

export async function getUserProfile(
  accessToken: string
): Promise<{ id: string; display_name: string }> {
  const cacheKey = `profile:${accessToken.slice(-10)}`;
  const cachedData = cache.get<{ id: string; display_name: string }>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const data = await makeRequest<{ id: string; display_name: string }>({
    endpoint: "/me",
    accessToken,
  });

  cache.set(cacheKey, data);
  return data;
}

export async function getSpotifyGenres(accessToken: string): Promise<string[]> {
  const cacheKey = "spotify:available-genres";
  const cachedData = cache.get<string[]>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  try {
    const data = await makeRequest<SpotifyGenreResponse>({
      endpoint: "/recommendations/available-genre-seeds",
      accessToken,
    });

    cache.set(cacheKey, data.genres, CACHE_DURATION * 24); // Cache for longer since these rarely change
    return data.genres;
  } catch (error) {
    console.error("Failed to fetch Spotify genres:", error);
    throw new SpotifyAPIError(
      "Failed to fetch available genres",
      error instanceof SpotifyAPIError ? error.status : undefined
    );
  }
}

// --- 7. Error Handling Utilities ---

export function handleSpotifyError(error: unknown): string {
  if (error instanceof SpotifyAPIError) {
    switch (error.status) {
      case 401:
        return "Please reconnect your Spotify account";
      case 403:
        return "Insufficient permissions for this action";
      case 429:
        return "Too many requests. Please try again later";
      default:
        return error.message;
    }
  }

  return "An unexpected error occurred";
}

// Clean up expired cache entries periodically
setInterval(() => cache.clearExpired(), CACHE_DURATION);