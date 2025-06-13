// src/components/layout/InsightsTab.tsx - CLEAN SCROLL VERSION
import React from "react";
import { FaMapMarkerAlt, FaInfo, FaHeart } from "react-icons/fa";

interface InsightsTabProps {
  city: string;
  weather: string;
  insights: any;
}

export default function InsightsTab({
  city,
  weather,
  insights,
}: InsightsTabProps) {
  if (!insights) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-soft-brown/70 text-center text-xs">
          No insights available for {city} at this time.
        </p>
      </div>
    );
  }

  const { funFact, knownFor, tradition } = insights;


return (
  <div className="h-full overflow-y-auto">
    <div className="space-y-3 pr-2">
      {/* Fun Fact */}
      {funFact && (
        <div className="bg-white/20 p-3 rounded-lg border border-white/10">
          <h4 className="flex items-center gap-2 text-soft-brown font-medium mb-2 text-xs">
            <FaInfo className="w-3 h-3 text-terracotta" />
            Fun Fact
          </h4>
          <p className="text-soft-brown/80 text-xs leading-relaxed">
            {funFact}
          </p>
        </div>
      )}

      {/* Known For */}
      {knownFor && (
        <div className="bg-white/20 p-3 rounded-lg border border-white/10">
          <h4 className="flex items-center gap-2 text-soft-brown font-medium mb-2 text-xs">
            <FaMapMarkerAlt className="w-3 h-3 text-terracotta" />
            Famous For
          </h4>
          <p className="text-soft-brown/80 text-xs leading-relaxed">
            {knownFor}
          </p>
        </div>
      )}

      {/* Local Tradition */}
      {tradition && (
        <div className="bg-white/20 p-3 rounded-lg border border-white/10">
          <h4 className="flex items-center gap-2 text-soft-brown font-medium mb-2 text-xs">
            <FaHeart className="w-3 h-3 text-terracotta" />
            Local Culture
          </h4>
          <p className="text-soft-brown/80 text-xs leading-relaxed">
            {tradition}
          </p>
        </div>
      )}

      {/* Weather Context */}
      <div className="bg-white/20 p-3 rounded-lg border border-white/10">
        <h4 className="flex items-center gap-2 text-soft-brown font-medium mb-2 text-xs">
          <span className="text-terracotta text-xs">🌤️</span>
          Current Weather
        </h4>
        <p className="text-soft-brown/80 text-xs leading-relaxed">
          {city} is currently experiencing{" "}
          <span className="font-medium">{weather}</span> conditions.
        </p>
      </div>
    </div>
  </div>
);}