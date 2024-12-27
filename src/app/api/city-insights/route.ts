// src/app/api/city-insights/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { location } = await req.json();

    if (!location) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    const prompt = `For the location "${location}", provide:
    1. A brief interesting historical or geographical fact (2 sentences max)
    2. A notable landmark or attraction it's known for (2 sentences max)
    3. A unique cultural tradition or local custom (2 sentences max)
    
    Format the response as a JSON object with these keys: 'funFact', 'knownFor', 'tradition'
    
    Keep the tone light and interesting. Each fact should start with a relevant emoji based on the content.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error("Invalid response from OpenAI");
    }

    const response = JSON.parse(completion.choices[0].message.content);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in city insights API:", error);
    return NextResponse.json(
      { error: "Failed to fetch city insights" },
      { status: 500 }
    );
  }
}
