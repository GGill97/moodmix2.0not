// src/app/api/music/route.ts - FIXED VERSION
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { RateLimit } from "@/lib/rateLimit";

export async function GET(request: Request) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || "unknown";
    const isAllowed = await RateLimit.check(clientIp);

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session || !session?.accessToken) {
      return NextResponse.json(
        { error: "Spotify authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const weatherDescription = searchParams.get("weatherDescription");
    const source = searchParams.get("source") || "weather";

    if (!weatherDescription) {
      return NextResponse.json(
        { error: "Weather description required" },
        { status: 400 }
      );
    }

    console.log("🎵 Starting music search for:", weatherDescription);

    // Skip the broken recommendations API and go straight to search
    return await enhancedWeatherSearch(
      session.accessToken,
      weatherDescription,
      source
    );
  } catch (error) {
    console.error("Music recommendations error:", error);
    return NextResponse.json(
      {
        error: "Failed to get music recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Enhanced search strategy - FIXED to not filter by preview_url
async function enhancedWeatherSearch(
  accessToken: string,
  weatherDescription: string,
  source: string
) {
  try {
    const searchQueries = getWeatherSearchQueries(weatherDescription, source);
    console.log("🔍 Enhanced search queries:", searchQueries);

    let allTracks: any[] = [];

    // Perform only 2-3 searches to avoid rate limits
    for (const query of searchQueries.slice(0, 3)) {
      try {
        const searchURL = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=track&limit=20&market=US`;

        const response = await fetch(searchURL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const tracks = data.tracks?.items || [];
          allTracks.push(...tracks);
          console.log(`📋 Search "${query}" returned ${tracks.length} tracks`);
        } else {
          console.error(`❌ Search failed for "${query}": ${response.status}`);
        }
      } catch (searchError) {
        console.error(`❌ Search failed for "${query}":`, searchError);
      }
    }

    console.log(`🎧 Found ${allTracks.length} total tracks`);

    // Remove duplicates by track ID and name combination
    const uniqueTracks = allTracks
      .filter((track, index, self) => {
        const trackKey = `${track.name.toLowerCase()}-${track.artists?.[0]?.name?.toLowerCase()}`;
        return (
          index ===
          self.findIndex(
            (t) =>
              t.id === track.id ||
              `${t.name.toLowerCase()}-${t.artists?.[0]?.name?.toLowerCase()}` ===
                trackKey
          )
        );
      })
      .slice(0, 25); // Get 25 tracks for variety

    console.log(`✅ Returning ${uniqueTracks.length} unique tracks`);

    if (uniqueTracks.length === 0) {
      // Fallback search with simpler terms
      return await fallbackSearch(accessToken, weatherDescription);
    }

    return NextResponse.json(uniqueTracks);
  } catch (error) {
    console.error("❌ Enhanced search failed:", error);
    return await fallbackSearch(accessToken, weatherDescription);
  }
}

// Simplified fallback search
async function fallbackSearch(accessToken: string, weatherDescription: string) {
  try {
    const searchTerm = getFallbackSearchTerm(weatherDescription);
    const searchURL = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      searchTerm
    )}&type=track&limit=25&market=US`;

    console.log("🔍 Fallback search:", searchTerm);

    const response = await fetch(searchURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const tracks = data.tracks?.items || [];
      console.log(`📋 Fallback found ${tracks.length} tracks`);
      return NextResponse.json(tracks.slice(0, 20));
    }

    throw new Error("Fallback search also failed");
  } catch (error) {
    console.error("❌ Fallback search failed:", error);
    return NextResponse.json(
      { error: "Could not load any music recommendations" },
      { status: 500 }
    );
  }
}

// Updated search queries for better relevance
// REPLACE the getWeatherSearchQueries function in your route.ts with this:

function getWeatherSearchQueries(weather: string, source: string): string[] {
  if (source === "mood") {
    const mood = weather.toLowerCase();
    return [`${mood} music 2024`, `${mood} songs`, `${mood} indie`];
  }

  const weatherLower = weather.toLowerCase();

  // EXPANDED search pools for randomization
  const weatherSearchMap: Record<string, string[]> = {
    rain: [
      "indie acoustic 2024",
      "chill alternative",
      "mellow indie rock",
      "acoustic indie folk",
      "rainy day indie",
      "soft alternative rock",
      "indie ballads",
      "mellow acoustic music",
      "chill indie songs",
    ],
    drizzle: [
      "soft indie pop",
      "acoustic indie music",
      "mellow indie songs",
      "chill indie folk",
      "gentle alternative",
      "soft acoustic rock",
      "indie chill music",
      "mellow indie rock",
      "peaceful indie",
    ],
    cloud: [
      "indie alternative rock",
      "modern indie music",
      "alternative pop 2024",
      "atmospheric indie rock",
      "moody alternative",
      "indie rock 2024",
      "alternative indie music",
      "modern alternative rock",
      "atmospheric pop",
    ],
    overcast: [
      "moody indie rock",
      "alternative music",
      "atmospheric indie",
      "dark indie alternative",
      "brooding indie rock",
      "melancholic alternative",
      "indie rock atmospheric",
      "moody alternative rock",
      "introspective indie",
    ],
    clear: [
      "upbeat indie pop",
      "feel good indie",
      "modern pop rock",
      "energetic indie music",
      "happy indie songs",
      "uplifting alternative",
      "bright indie pop",
      "positive indie rock",
      "cheerful alternative",
    ],
    sunny: [
      "summer indie hits",
      "upbeat alternative",
      "feel good music 2024",
      "sunny indie pop",
      "energetic indie rock",
      "happy alternative music",
      "uplifting indie songs",
      "bright alternative rock",
      "positive indie",
    ],
    storm: [
      "intense indie rock",
      "powerful alternative",
      "energetic music",
      "dramatic indie rock",
      "intense alternative rock",
      "powerful indie music",
      "epic indie songs",
      "high energy alternative",
      "driving indie rock",
    ],
    snow: [
      "peaceful indie folk",
      "acoustic alternative music",
      "calm indie songs",
      "winter indie music",
      "serene acoustic",
      "peaceful alternative",
      "gentle indie folk",
      "tranquil indie music",
      "soft indie acoustic",
    ],
  };

  // Find matching weather condition and randomize selection
  for (const [condition, queries] of Object.entries(weatherSearchMap)) {
    if (weatherLower.includes(condition)) {
      // Shuffle the array and pick 3 random queries
      const shuffled = queries.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    }
  }

  // Default randomized searches
  const defaultQueries = [
    "indie alternative 2024",
    "modern indie rock",
    "popular alternative music",
    "indie pop 2024",
    "alternative rock music",
    "contemporary indie",
    "indie music 2024",
    "modern alternative",
    "popular indie songs",
  ];

  const shuffled = defaultQueries.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

// Improved fallback search terms
function getFallbackSearchTerm(weather: string): string {
  const weatherLower = weather.toLowerCase();

  if (weatherLower.includes("rain")) return "indie acoustic 2024";
  if (weatherLower.includes("clear")) return "upbeat indie pop";
  if (weatherLower.includes("sunny")) return "summer indie hits";
  if (weatherLower.includes("storm")) return "intense alternative rock";
  if (weatherLower.includes("snow")) return "peaceful indie folk";
  if (weatherLower.includes("cloud") || weatherLower.includes("overcast"))
    return "modern indie alternative";

  return "indie alternative 2024";
}
