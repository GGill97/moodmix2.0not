//src/components/music/MusicInsights.tsx
"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import type { MusicInsightsProps, CityInsight } from "../../types/insights";

const InsightCard = ({ icon, text }: { icon: string; text: string }) => (
  <div className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-all duration-300">
    <div className="flex items-start gap-3">
      <span className="text-xl">{icon}</span>
      <p className="text-soft-brown/90 text-lg leading-relaxed">{text}</p>
    </div>
  </div>
);

export default function MusicInsights({
  location,
  weatherDescription,
}: MusicInsightsProps) {
  const [insights, setInsights] = useState<CityInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cityName = location.split(",")[0];

  useEffect(() => {
    const fetchInsights = async () => {
      if (!location) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/city-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location }),
        });

        if (!response.ok) throw new Error("Failed to fetch insights");

        const data = await response.json();
        setInsights(data);
      } catch (err) {
        console.error("Error fetching insights:", err);
        setError("Failed to load city insights");
      } finally {
        setLoading(false);
      }
    };

    void fetchInsights();
  }, [location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-soft-brown">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p>Loading city insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-soft-brown">
        <p>Unable to load insights right now. Try again later!</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-6 h-6 text-terracotta" />
        <h2 className="text-2xl font-medium text-soft-brown">{cityName}</h2>
      </div>

      <div className="space-y-4">
        {insights?.funFact && <InsightCard icon="🌟" text={insights.funFact} />}

        {insights?.knownFor && (
          <InsightCard icon="🏛️" text={insights.knownFor} />
        )}

        {insights?.tradition && (
          <InsightCard icon="🎭" text={insights.tradition} />
        )}
      </div>
    </div>
  );
}
