// src/app/api/weather/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get("location");

    if (!location) {
      return NextResponse.json(
        { error: "Location parameter is required" },
        { status: 400 }
      );
    }

    const OPENWEATHER_API_KEY = process.env.NEXT_OPENWEATHER_API_KEY;
    if (!OPENWEATHER_API_KEY) {
      console.error("OpenWeather API key is missing");
      return NextResponse.json(
        { error: "Weather service configuration error" },
        { status: 500 }
      );
    }

    const cleanLocation = location.trim().replace(/\s+/g, " ");
    const encodedLocation = encodeURIComponent(cleanLocation);

    // Changed to https
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodedLocation}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      throw new Error(`Geocoding failed: ${geoResponse.status}`);
    }

    const geoData = await geoResponse.json();

    if (!geoData || geoData.length === 0) {
      return NextResponse.json(
        { error: "Location not found. Please try a different search term." },
        { status: 404 }
      );
    }

    const { lat, lon } = geoData[0];
    // Changed to https
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${OPENWEATHER_API_KEY}`;

    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      throw new Error(`Weather API failed: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to fetch weather data. Please try again or check the location name.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
