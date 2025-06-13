// src/types/chat.ts
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
  type?: "text" | "music_info" | "playlist_created";
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  uri: string;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  album?: {
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms?: number;
}

export interface MoodAnalysis {
  genres: string[];
  response: string;
  shouldRefreshPlaylist: boolean;
  keepCurrentGenre: boolean;
  weatherMood?: string;
  moodAnalysis?: string;
  displayTitle?: string;
  recommendations?: SpotifyTrack[];
  // Enhanced properties for Phase 1
  requestType:
    | "playlist_request"
    | "song_info"
    | "playlist_modify"
    | "general_chat";
  activityContext?: string; // e.g., "cookies", "study", "workout"
  suggestedActions?: string[]; // Quick action buttons to show
  songInfo?: SongInformation; // For song-specific queries
}

export interface SongInformation {
  trackId: string;
  artistInfo?: string;
  albumInfo?: string;
  songMeaning?: string;
  similarArtists?: string[];
  genre?: string;
  year?: number;
}

export interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
    main: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
  name: string;
}

export interface ChatHistoryItem {
  id: string;
  message: string;
  timestamp: number;
  weatherDescription?: string;
  location?: string;
  response?: MoodAnalysis;
}

// New interfaces for enhanced functionality
export interface PlaylistCreationRequest {
  name: string;
  description?: string;
  tracks: string[]; // Track URIs
  isPublic?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  action: "mood_change" | "genre_add" | "playlist_modify" | "song_info";
  value: string;
}

export interface MusicPlayerState {
  currentTrack?: SpotifyTrack;
  isPlaying: boolean;
  position: number; // 0-30 seconds for preview
  volume: number;
  queue: SpotifyTrack[];
}
