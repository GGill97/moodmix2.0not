// src/types/chat.ts
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
  location: string; // Added this
  weatherDescription: string; // Added this
  className?: string;
  spotifyAccessToken?: string;
  isMinimized?: boolean;
  onExpand?: () => void;
}
