// src/types/index.ts
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
}

export interface MoodAnalysis {
  genres: string[];
  weatherMood: string;
  response: string;
  moodAnalysis: string;
  displayTitle: string;
  shouldRefreshPlaylist?: boolean;
  recommendations?: SpotifyTrack[];
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
}
