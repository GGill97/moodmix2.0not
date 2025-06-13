// src/app/api/chat/analyze-mood/route.ts - FIXED VERSION
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getRecommendations } from "@/utils/spotifyApi";
import type { MoodAnalysis } from "@/types/chat";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is missing in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  console.log("🎭 Starting enhanced mood analysis");

  try {
    const {
      message,
      weatherDescription,
      location,
      currentGenre,
      spotifyAccessToken,
      currentTracks,
    } = await req.json().catch(() => ({}));

    if (!message || !weatherDescription || !location) {
      console.error("❌ Missing required fields");
      return NextResponse.json(
        { error: "Please provide all required information" },
        { status: 400 }
      );
    }

    // IMPROVED PROMPT - More explicit about when to refresh playlist
    const prompt = `You are MoodMix AI, a music expert assistant. Analyze this user message and respond appropriately.

User message: "${message}"
Context: Weather is ${weatherDescription} in ${location}
Current genre: ${currentGenre || "none"}

CRITICAL RULES FOR shouldRefreshPlaylist:

SET shouldRefreshPlaylist: true FOR:
- ANY request for new music ("play some rock", "I want happy music", "cookies playlist")
- ANY mood requests ("upbeat music", "sad songs", "chill vibes")  
- ANY activity requests ("study music", "workout playlist", "cooking music")
- ANY genre requests ("indie rock", "jazz music", "electronic")
- ANY artist-style requests ("music like Taylor Swift", "90s rock")

SET shouldRefreshPlaylist: false FOR:
- Questions about current music ("who is this artist?", "what's this song about?")
- General chat ("hello", "how are you?", "tell me about weather")
- Requests for information only

ACTIVITY TO GENRE MAPPING:
- "cookies" = cozy indie, folk, acoustic
- "study" = lo-fi, ambient, instrumental  
- "workout" = electronic, pop, high energy
- "cooking" = upbeat pop, indie rock
- "cleaning" = dance, pop, energetic
- "coffee" = chill indie, acoustic, jazz
- "happy" = upbeat pop, indie pop
- "sad" = indie folk, alternative, acoustic
- "chill" = lo-fi, ambient, indie

EXAMPLES:
- "play some upbeat music" → shouldRefreshPlaylist: true, genres: ["upbeat pop", "indie pop"]
- "I want indie rock" → shouldRefreshPlaylist: true, genres: ["indie rock"]
- "who is this artist?" → shouldRefreshPlaylist: false, genres: []

Return JSON format:
{
  "response": "Your conversational response with emoji",
  "genres": ["genre1", "genre2"], // MUST include genres if shouldRefreshPlaylist is true
  "shouldRefreshPlaylist": boolean, // TRUE for music requests, FALSE for info requests
  "keepCurrentGenre": boolean,
  "requestType": "playlist_request" | "song_info" | "playlist_modify" | "general_chat",
  "activityContext": "activity name if applicable",
  "suggestedActions": ["action1", "action2"]
}`;

    console.log("🤖 Requesting enhanced OpenAI analysis");
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7, // Slightly lower for more consistent responses
        response_format: { type: "json_object" },
      });
    } catch (error) {
      console.error("❌ OpenAI API error:", error);
      return NextResponse.json(
        {
          error:
            "Sorry, having trouble analyzing your request. Please try again.",
        },
        { status: 503 }
      );
    }

    if (!completion.choices[0]?.message?.content) {
      throw new Error("Invalid response from OpenAI");
    }

    let analysis: MoodAnalysis;
    try {
      analysis = JSON.parse(completion.choices[0].message.content);
      console.log("🎯 Analysis result:", analysis);
    } catch (error) {
      console.error("❌ JSON parsing error:", error);
      return NextResponse.json(
        { error: "Error processing the response. Please try again." },
        { status: 500 }
      );
    }

    // FORCE REFRESH FOR MUSIC REQUESTS - Safety check
    if (analysis.genres && analysis.genres.length > 0) {
      analysis.shouldRefreshPlaylist = true;
      console.log("🔄 Forcing playlist refresh due to genres present");
    }

    console.log("✅ Enhanced analysis complete");
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("❌ Unhandled error in mood analysis:", error);
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
