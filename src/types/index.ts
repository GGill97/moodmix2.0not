// src/types/index.ts
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
    id: number;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
  name: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
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

export interface MoodAnalysis {
  genres: string[];
  weatherMood: string;
  response: string;
  moodAnalysis: string;
  displayTitle: string;
  shouldRefreshPlaylist?: boolean;
  recommendations?: SpotifyTrack[];
}

export interface MoodMixChatProps {
  onMoodAnalysis: (analysis: MoodAnalysis) => void;
  location: string;
  weatherDescription: string;
  className?: string;
  spotifyAccessToken?: string;
  isMinimized?: boolean;
  onExpand?: () => void;
}
