import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genres = searchParams.get("genres")?.split(",") || [];
  const accessToken = searchParams.get("accessToken");

  if (!accessToken) {
    return NextResponse.json(
      { error: "Access token is required" },
      { status: 400 }
    );
  }

  if (genres.length === 0) {
    return NextResponse.json(
      { error: "At least one genre is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/recommendations?seed_genres=${genres.join(
        ","
      )}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data.tracks);
  } catch (error) {
    console.error("Error fetching music recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
