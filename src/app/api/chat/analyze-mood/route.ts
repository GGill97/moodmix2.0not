// src/app/api/chat/analyze-mood/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getRecommendations } from "@/utils/spotifyApi";
import type { MoodAnalysis, SpotifyTrack } from "@/types/chat";

// Simplified type definitions
type SpotifyGenre =
  | "pop"
  | "dance"
  | "hip-hop"
  | "party"
  | "electronic"
  | "happy"
  | "energetic"
  | "upbeat"
  | "summer"
  | "chill"
  | "acoustic"
  | "sad"
  | "ambient"
  | "melancholic"
  | "jazz"
  | "indie";

const SPOTIFY_GENRES: SpotifyGenre[] = [
  "pop",
  "dance",
  "hip-hop",
  "party",
  "electronic",
  "happy",
  "energetic",
  "upbeat",
  "summer",
  "chill",
  "acoustic",
  "sad",
  "ambient",
  "melancholic",
  "jazz",
  "indie",
];

const WEATHER_GENRES: Record<string, SpotifyGenre[]> = {
  "clear sky": ["pop", "happy", "summer"],
  "few clouds": ["indie", "pop", "upbeat"],
  "scattered clouds": ["chill", "electronic", "indie"],
  "broken clouds": ["indie", "electronic", "ambient"],
  "light rain": ["acoustic", "jazz", "melancholic"],
  "moderate rain": ["ambient", "jazz", "melancholic"],
  "heavy rain": ["electronic", "ambient", "melancholic"],
  "overcast clouds": ["indie", "ambient", "electronic"],
};

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, weatherDescription, location, spotifyAccessToken } =
      await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const prompt = `As a music expert, analyze this message: "${message}"
Current context: Weather is ${weatherDescription} in ${location}.

Your task is to understand if the user wants to:
1. Keep the weather-based playlist
2. Get a new playlist based on their mood

Available genres: ${SPOTIFY_GENRES.join(", ")}

Provide an empathetic response and music recommendations that match their preference.

Return in this JSON format:
{
  "keepWeatherPlaylist": boolean,
  "genres": string[],
  "response": string,
  "moodAnalysis": string,
  "displayTitle": string
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error("Invalid response from OpenAI");
    }

    const analysis = JSON.parse(completion.choices[0].message.content);

    // Determine which genres to use based on user preference
    const selectedGenres = analysis.keepWeatherPlaylist
      ? WEATHER_GENRES[weatherDescription] || WEATHER_GENRES["clear sky"]
      : analysis.genres.filter((genre: string) =>
          SPOTIFY_GENRES.includes(genre as SpotifyGenre)
        );

    // Get Spotify recommendations if we have access token
    if (spotifyAccessToken) {
      try {
        const recommendations = await getRecommendations(
          spotifyAccessToken,
          selectedGenres
        );

        return NextResponse.json({
          ...analysis,
          genres: selectedGenres,
          recommendations,
        });
      } catch (error) {
        console.error("Spotify API error:", error);
        return NextResponse.json({
          ...analysis,
          genres: selectedGenres,
          error: "Failed to get Spotify recommendations",
        });
      }
    }

    return NextResponse.json({
      ...analysis,
      genres: selectedGenres,
    });
  } catch (error) {
    console.error("Error in mood analysis:", error);
    return NextResponse.json(
      { error: "Failed to analyze mood" },
      { status: 500 }
    );
  }
}
