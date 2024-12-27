import React, { useState, useCallback, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import debounce from "lodash/debounce";

interface LocationSearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const MAJOR_CITIES = ["New York", "Los Angeles", "Chicago", "Seattle", "Miami"];

export default function LocationSearch({
  onSearch,
  isLoading,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery?.trim() || searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/citysuggestions?q=${encodeURIComponent(searchQuery)}`
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query && query.length >= 2) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query, fetchSuggestions]);

  const handleSelectLocation = useCallback(
    (location: string) => {
      if (!location) return;

      setQuery(location);
      setShowSuggestions(false);
      onSearch(location);
    },
    [onSearch]
  );

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLoadingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 0,
            enableHighAccuracy: true,
          });
        }
      );

      const response = await fetch(
        `/api/citysuggestions?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }

      const locations = await response.json();
      if (Array.isArray(locations) && locations.length > 0) {
        handleSelectLocation(locations[0]);
      } else {
        throw new Error("No location found");
      }
    } catch (error) {
      console.error("Geolocation error:", error);
      // You might want to show this error to the user
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soft-brown/40 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for a city..."
          className="w-full px-10 py-3 rounded-xl search-input"
        />

        {showSuggestions && suggestions.length > 0 && (
          <ul
            className="absolute z-10 w-full mt-1 bg-white/20 backdrop-blur-sm 
                       rounded-xl shadow-lg overflow-hidden border border-white/10"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion}-${index}`}
                onClick={() => handleSelectLocation(suggestion)}
                className="px-4 py-3 hover:bg-white/10 cursor-pointer 
                         text-soft-brown/80 transition-colors"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {MAJOR_CITIES.map((city) => (
          <button
            key={city}
            onClick={() => handleSelectLocation(city)}
            className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm
                     text-soft-brown/80 hover:bg-white/30 transition-colors
                     text-sm border border-white/10"
          >
            {city}
          </button>
        ))}
      </div>

      <button
        onClick={handleUseMyLocation}
        disabled={isLoadingLocation}
        className="mt-4 flex items-center gap-2 px-6 py-2 rounded-full
                 bg-white/20 backdrop-blur-sm text-soft-brown/80
                 hover:bg-white/30 transition-colors border border-white/10
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MapPin className="w-4 h-4" />
        {isLoadingLocation ? "Getting location..." : "Use My Location"}
      </button>
    </div>
  );
}
//do not change anyhting