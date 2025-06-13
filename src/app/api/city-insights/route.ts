// src/app/api/city-insights/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { city , weather } = await req.json();

    if (!city) {
      return NextResponse.json(
        { error: "city is required" },
        { status: 400 }
      );
    }

    // Create a prompt for OpenAI to generate city insights
    const prompt = `For the city "${city}", provide:
    1. A fun fact about its history or culture (2 sentences max)
    2. A famous landmark or attraction (2 sentences max)
    3. A unique local tradition or cultural aspect (2 sentences max)
    
    Format the response as JSON with these keys:
    {
      "funFact": "🏛️ [fun historical fact]",
      "knownFor": "🗺️ [landmark/attraction]",
      "tradition": "🎉 [local tradition]"
    }
    
    Make the insights interesting and engaging. Add relevant emojis at the start of each fact.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error("Invalid response from OpenAI");
    }

    // Parse and return the insights
    const insights = JSON.parse(completion.choices[0].message.content);
    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error in city insights API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch city insights",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
