//src/app/api/citysuggestions/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

interface OpenWeatherLocation {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

interface NominatimLocation {
  address: {
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    municipality?: string;
    state?: string;
    country: string;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    const OPENWEATHER_API_KEY = process.env.NEXT_OPENWEATHER_API_KEY;

    // Handle reverse geocoding (coordinates to location)
    if (lat && lon) {
      try {
        const reverseGeocodingResults = await Promise.allSettled([
          // OpenWeather reverse geocoding
          fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`,
            { signal: AbortSignal.timeout(5000) }
          ).then((res) => res.json()),

          // Nominatim reverse geocoding
          fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
            {
              headers: { "User-Agent": "MoodMix Weather App" },
              signal: AbortSignal.timeout(5000),
            }
          ).then((res) => res.json()),
        ]);

        const locations = new Set<string>();

        // Handle OpenWeather results
        if (reverseGeocodingResults[0].status === "fulfilled") {
          const weatherResults = Array.isArray(reverseGeocodingResults[0].value)
            ? reverseGeocodingResults[0].value
            : [reverseGeocodingResults[0].value];

          weatherResults?.forEach((result: OpenWeatherLocation) => {
            const formatted = formatLocation(
              result.name,
              result.state,
              result.country
            );
            locations.add(formatted);
          });
        }

        // Handle Nominatim results
        if (reverseGeocodingResults[1].status === "fulfilled") {
          const result = reverseGeocodingResults[1].value;
          if (result?.address) {
            const formatted = formatLocation(
              result.address.city ??
                result.address.town ??
                result.address.municipality ??
                "",
              result.address.state ?? "",
              result.address.country
            );
            locations.add(formatted);
          }
        }

        const locationArray = Array.from(locations).filter(Boolean);
        return NextResponse.json(locationArray);
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        return NextResponse.json([]);
      }
    }

    // Handle query-based search
    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const results = await Promise.allSettled([
      // OpenWeather API request
      fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          query
        )}&limit=3&appid=${OPENWEATHER_API_KEY}`,
        { signal: AbortSignal.timeout(5000) }
      ).then((res) => res.json()),

      // Nominatim request
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=5`,
        {
          headers: { "User-Agent": "MoodMix Weather App" },
          signal: AbortSignal.timeout(5000),
        }
      ).then((res) => res.json()),
    ]);

    const combinedResults = new Set<string>();

    // Handle OpenWeather results
    if (results[0].status === "fulfilled") {
      const weatherResults = results[0].value as OpenWeatherLocation[];
      weatherResults?.forEach((result) => {
        const formatted = formatLocation(
          result.name,
          result.state,
          result.country
        );
        combinedResults.add(formatted);
      });
    }

    // Handle Nominatim results
    if (results[1].status === "fulfilled") {
      const nominatimResults = results[1].value as NominatimLocation[];
      nominatimResults?.forEach((result) => {
        const address = result.address;
        const formatted = formatLocation(
          address.city ?? address.town ?? address.municipality ?? "",
          address.state ?? "",
          address.country
        );
        combinedResults.add(formatted);
      });
    }

    // Filter and sort results
    const suggestions = Array.from(combinedResults)
      .filter(Boolean)
      .filter((location) =>
        location.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => {
        const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
        const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 6);

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("City suggestions error:", error);
    return NextResponse.json([]);
  }
}

function formatLocation(
  city: string,
  state: string | undefined,
  country: string | undefined
): string {
  if (!city) return "";
  const parts = [city];
  if (state?.trim()) parts.push(state);
  if (country === "United States of America") parts.push("USA");
  else if (country?.trim()) parts.push(country);
  return parts.join(", ");
}
