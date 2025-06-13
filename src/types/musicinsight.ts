// src/types/musicinsight.ts
export interface CityInsight {
  funFact: string;
  knownFor: string;
  tradition?: string;
}

export interface MusicInsightsProps {
  location: string;
  weatherDescription: string;
  genres: string[];
}
