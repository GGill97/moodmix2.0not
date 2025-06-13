// src/types/spotify.ts
export interface SpotifyTrack {
  preview_url: any;
  external_urls: any;
  uri: string;
  id: string;
  name: string;
  artists: Array<{
    name: string;
    id?: string;
  }>;
  album: {
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms: number;
}

export interface SpotifyPlaylist {
  id: string;
  external_urls: {
    spotify: string;
  };
  name: string;
  description: string;
}

export interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
}
