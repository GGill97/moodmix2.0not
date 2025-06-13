// src/constants/chat.ts

/**
 * Generate a welcome message based on weather and location
 */
export const getWelcomeMessage = (
  weatherDescription: string | undefined,
  location: string | undefined
): string => {
  if (!weatherDescription || !location) {
    return "Hello! I'm your music assistant. How can I help you with music today?";
  }

  const weather = weatherDescription.toLowerCase();
  const city = location.split(",")[0]; // Get just the city name

  // Generate dynamic welcome messages based on weather
  if (weather.includes("rain") || weather.includes("drizzle")) {
    return `Perfect rainy day in ${city}! ☔ Want some cozy music to match the weather?`;
  } else if (weather.includes("clear") || weather.includes("sunny")) {
    return `Beautiful clear day in ${city}! ☀️ Ready for some upbeat music to match the sunshine?`;
  } else if (weather.includes("cloud")) {
    return `Nice cloudy day in ${city}! ☁️ Want to switch up the vibes or get a fresh playlist?`;
  } else if (weather.includes("snow")) {
    return `Snowy day in ${city}! ❄️ How about some peaceful winter music?`;
  } else if (weather.includes("storm") || weather.includes("thunder")) {
    return `Stormy weather in ${city}! ⛈️ Want some dramatic music to match the energy?`;
  } else {
    return `Hey there! The weather in ${city} is ${weatherDescription}. What kind of music fits your mood today? 🎵`;
  }
};

/**
 * Enhanced mood suggestions based on weather condition
 */
export const getMoodSuggestions = (
  weatherDescription: string | undefined
): string[] => {
  if (!weatherDescription) return ["happy", "chill", "energetic", "focus"];

  const weather = weatherDescription.toLowerCase();

  if (weather.includes("rain") || weather.includes("drizzle")) {
    return ["cozy", "relaxed", "jazz", "acoustic"];
  } else if (weather.includes("cloud")) {
    return ["indie", "chill", "pop", "alt"];
  } else if (weather.includes("clear") || weather.includes("sunny")) {
    return ["upbeat", "happy", "dance", "summer"];
  } else if (weather.includes("thunder") || weather.includes("storm")) {
    return ["epic", "rock", "intense", "dramatic"];
  } else if (weather.includes("snow")) {
    return ["peaceful", "gentle", "ambient", "classical"];
  } else if (weather.includes("fog") || weather.includes("mist")) {
    return ["mysterious", "ethereal", "atmospheric", "ambient"];
  } else {
    return ["chill", "focus", "upbeat", "relax"];
  }
};

/**
 * Enhanced activity-to-genre mapping for better context understanding
 */
export const mapActivityToGenres = (activity: string): string[] => {
  const activityMap: Record<string, string[]> = {
    // Food/Cooking
    cookies: ["indie", "folk", "acoustic", "cozy"],
    baking: ["indie", "folk", "acoustic", "warm"],
    cooking: ["upbeat", "pop", "funk", "energetic"],
    coffee: ["indie", "acoustic", "chill", "morning"],
    wine: ["jazz", "lounge", "sophisticated", "evening"],

    // Activities
    study: ["lo-fi", "instrumental", "focus", "ambient"],
    workout: ["electronic", "pop", "high-energy", "motivational"],
    cleaning: ["upbeat", "pop", "dance", "energetic"],
    driving: ["rock", "pop", "road-trip", "classic"],
    walking: ["indie", "pop", "moderate", "peaceful"],
    running: ["electronic", "pop", "high-energy", "motivational"],

    // Moods/Emotions
    happy: ["pop", "dance", "upbeat", "cheerful"],
    sad: ["acoustic", "indie", "melancholic", "emotional"],
    angry: ["rock", "metal", "intense", "aggressive"],
    calm: ["ambient", "classical", "peaceful", "relaxing"],
    excited: ["electronic", "pop", "dance", "high-energy"],
    romantic: ["r&b", "soul", "love", "intimate"],

    // Time/Settings
    morning: ["acoustic", "indie", "gentle", "awakening"],
    evening: ["jazz", "lounge", "chill", "sophisticated"],
    night: ["ambient", "electronic", "mysterious", "late-night"],
    party: ["dance", "pop", "electronic", "party"],
    dinner: ["jazz", "acoustic", "sophisticated", "elegant"],

    // Work/Focus
    focus: ["instrumental", "ambient", "concentration", "minimal"],
    creative: ["instrumental", "electronic", "inspiring", "artistic"],
    meditation: ["ambient", "new-age", "peaceful", "spiritual"],
    sleep: ["ambient", "classical", "peaceful", "lullaby"],
  };

  const normalizedActivity = activity.toLowerCase();

  // Direct match
  if (activityMap[normalizedActivity]) {
    return activityMap[normalizedActivity];
  }

  // Partial match
  for (const [key, genres] of Object.entries(activityMap)) {
    if (normalizedActivity.includes(key) || key.includes(normalizedActivity)) {
      return genres;
    }
  }

  // Default fallback
  return ["pop", "indie", "chill"];
};

/**
 * Map weather conditions to music genres (enhanced)
 */
export const mapWeatherToGenres = (
  weatherDescription: string | undefined
): string[] => {
  if (!weatherDescription) return ["pop", "rock"];

  const weather = weatherDescription.toLowerCase();

  if (weather.includes("rain") || weather.includes("drizzle")) {
    return ["ambient", "jazz", "piano", "acoustic", "cozy"];
  } else if (weather.includes("cloud")) {
    return ["indie", "chill", "lofi", "indie-pop", "mellow"];
  } else if (weather.includes("clear") || weather.includes("sunny")) {
    return ["pop", "dance", "upbeat", "happy", "summer"];
  } else if (weather.includes("thunder") || weather.includes("storm")) {
    return ["rock", "electronic", "epic", "intense", "dramatic"];
  } else if (weather.includes("snow")) {
    return ["classical", "ambient", "piano", "peaceful", "winter"];
  } else if (weather.includes("fog") || weather.includes("mist")) {
    return ["ambient", "atmospheric", "ethereal", "cinematic", "mysterious"];
  } else {
    return ["pop", "indie", "electronic", "chill"];
  }
};

/**
 * Generate contextual quick actions based on current state
 */
export const generateQuickActions = (
  currentGenres: string[],
  weatherDescription: string,
  hasCurrentMusic: boolean
): string[] => {
  const actions: string[] = [];

  if (hasCurrentMusic) {
    actions.push("Make it more upbeat", "Add some jazz", "More chill vibes");
  }

  // Weather-specific suggestions
  const weather = weatherDescription?.toLowerCase() || "";
  if (weather.includes("rain")) {
    actions.push("Cozy rain music", "Jazz for rainy days");
  } else if (weather.includes("sunny") || weather.includes("clear")) {
    actions.push("Summer vibes", "Feel-good music");
  }

  // Activity suggestions
  actions.push("Study playlist", "Workout music", "Cooking tunes");

  return actions.slice(0, 4); // Limit to 4 actions
};

/**
 * Enhanced follow-up message generation
 */
export const getFollowUpMessage = (
  mood: string | undefined,
  weatherDescription: string | undefined,
  location: string | undefined,
  activityContext?: string
): string => {
  if (!mood || !weatherDescription) {
    return "Would you like to try a different genre of music?";
  }

  const weather = weatherDescription.toLowerCase();

  // Activity-based responses
  if (activityContext) {
    const activityResponses: Record<string, string> = {
      cookies:
        "Here's your cozy baking playlist! Perfect for making cookies 🍪",
      study: "Here's a focus-friendly playlist to help you concentrate 📚",
      workout: "Let's get that energy up! Here's your workout playlist 💪",
      cooking:
        "Time to cook up something delicious with these upbeat tunes! 👨‍🍳",
      cleaning: "Here's some energetic music to make cleaning fun! 🧹",
    };

    if (activityResponses[activityContext]) {
      return activityResponses[activityContext];
    }
  }

  // Mood-based responses
  if (
    mood.toLowerCase().includes("happy") ||
    mood.toLowerCase().includes("upbeat")
  ) {
    return `Here's your upbeat playlist for ${location || "today"}! 🎵`;
  } else if (
    mood.toLowerCase().includes("chill") ||
    mood.toLowerCase().includes("relax")
  ) {
    return `Perfect! Here's some chill music to match your mood 🎵`;
  } else if (
    mood.toLowerCase().includes("focus") ||
    mood.toLowerCase().includes("work")
  ) {
    return `Here's a focus-friendly playlist to help you concentrate 🎵`;
  }

  return `Here's a ${mood} playlist that should match the current ${weather} weather! 🎵`;
};

/**
 * Detect if user is asking about song/artist information
 */
export const detectSongInfoRequest = (message: string): boolean => {
  const infoKeywords = [
    "who is",
    "tell me about",
    "what's this song",
    "artist info",
    "song meaning",
    "album info",
    "when was this",
    "genre of",
    "similar to",
    "more like this",
    "about this track",
  ];

  return infoKeywords.some((keyword) =>
    message.toLowerCase().includes(keyword)
  );
};

/**
 * Detect playlist modification requests
 */
export const detectPlaylistModification = (message: string): boolean => {
  const modificationKeywords = [
    "make it more",
    "add some",
    "less",
    "remove",
    "change to",
    "switch to",
    "more upbeat",
    "more chill",
    "faster",
    "slower",
  ];

  return modificationKeywords.some((keyword) =>
    message.toLowerCase().includes(keyword)
  );
};
