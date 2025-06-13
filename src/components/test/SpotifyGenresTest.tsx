// // "use client";

// // import React, { useState, useEffect } from "react";
// // import { useSession } from "next-auth/react";
// // import { getSpotifyGenres } from "@/utils/spotifyApi"; // Changed this line

// // export default function SpotifyGenresTest() {
// //   const { data: session } = useSession();
// //   const [genres, setGenres] = useState<string[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState<string | null>(null);

// //   useEffect(() => {
// //     async function fetchGenres() {
// //       if (!session?.accessToken) {
// //         console.log("No access token available");
// //         return;
// //       }

// //       console.log(
// //         "Fetching genres with token:",
// //         session.accessToken.substring(0, 10) + "..."
// //       );
// //       setLoading(true);
// //       setError(null);

// //       try {
// //         const availableGenres = await getSpotifyGenres(session.accessToken);
// //         setGenres(availableGenres);
// //       } catch (err) {
// //         setError(err instanceof Error ? err.message : "Failed to fetch genres");
// //         console.error("Error fetching genres:", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     }

// //     fetchGenres();
// //   }, [session?.accessToken]);

// //   if (loading) {
// //     return <div className="p-4">Loading available Spotify genres...</div>;
// //   }

// //   if (error) {
// //     return <div className="p-4 text-red-500">Error: {error}</div>;
// //   }

// //   return (
// //     <div className="p-4">
// //       <h2 className="text-xl font-bold mb-4">Available Spotify Genres</h2>
// //       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
// //         {genres.map((genre) => (
// //           <div key={genre} className="p-2 bg-gray-100 rounded">
// //             {genre}
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }
// // src/components/test/SpotifyGenresTest.tsx
// // "use client";

// // import React, { useState, useEffect } from "react";
// // import { useSession } from "next-auth/react";

// // export default function SpotifyGenresTest() {
// //   const { data: session } = useSession();
// //   const [genres, setGenres] = useState<string[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState<string | null>(null);
// //   const [apiResponse, setApiResponse] = useState<any>(null);

// //   // Function to directly test the Spotify API
// //   const testSpotifyAPI = async () => {
// //     if (!session?.accessToken) {
// //       setError("No access token available");
// //       return;
// //     }

// //     setLoading(true);
// //     setError(null);

// //     try {
// //       // First, try the recommendations endpoint
// //       const response = await fetch(
// //         "https://api.spotify.com/v1/recommendations?seed_genres=pop&limit=1",
// //         {
// //           method: "GET",
// //           headers: {
// //             Authorization: `Bearer ${session.accessToken}`,
// //             "Content-Type": "application/json",
// //           },
// //         }
// //       );

// //       const data = await response.json();
// //       setApiResponse(data);

// //       if (!response.ok) {
// //         throw new Error(
// //           `API error: ${response.status} - ${
// //             data.error?.message || "Unknown error"
// //           }`
// //         );
// //       }

// //       // If successful, try the genres endpoint
// //       const genresResponse = await fetch(
// //         "https://api.spotify.com/v1/recommendations/available-genre-seeds",
// //         {
// //           method: "GET",
// //           headers: {
// //             Authorization: `Bearer ${session.accessToken}`,
// //             "Content-Type": "application/json",
// //           },
// //         }
// //       );

// //       if (!genresResponse.ok) {
// //         const genresData = await genresResponse.json();
// //         throw new Error(
// //           `Genres API error: ${genresResponse.status} - ${
// //             genresData.error?.message || "Unknown error"
// //           }`
// //         );
// //       }

// //       const genresData = await genresResponse.json();
// //       setGenres(genresData.genres || []);
// //     } catch (err) {
// //       setError(err instanceof Error ? err.message : "Failed to test API");
// //       console.error("API test error:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="p-4">
// //       <h2 className="text-xl font-bold mb-4">Spotify API Test</h2>

// //       <button
// //         onClick={testSpotifyAPI}
// //         className="bg-green-500 text-white px-4 py-2 rounded mb-4"
// //       >
// //         {loading ? "Testing..." : "Test Spotify API"}
// //       </button>

// //       {error && (
// //         <div className="p-4 bg-red-100 border border-red-500 text-red-700 rounded mb-4">
// //           <strong>Error:</strong> {error}
// //         </div>
// //       )}

// //       {apiResponse && (
// //         <div className="p-4 bg-gray-100 rounded mb-4 overflow-auto max-h-60">
// //           <strong>API Response:</strong>
// //           <pre className="text-xs">{JSON.stringify(apiResponse, null, 2)}</pre>
// //         </div>
// //       )}

// //       {genres.length > 0 && (
// //         <div>
// //           <h3 className="text-lg font-semibold mb-2">
// //             Available Genres ({genres.length})
// //           </h3>
// //           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
// //             {genres.map((genre) => (
// //               <div key={genre} className="p-2 bg-gray-100 rounded">
// //                 {genre}
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // src/components/test/SpotifyGenresTest.tsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";

// export default function SpotifyGenresTest() {
//   const { data: session } = useSession();
//   const [genres, setGenres] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);

//   async function testDirectSpotifyAPI() {
//     if (!session?.accessToken) {
//       setError("No access token available");
//       return;
//     }

//     setLoading(true);
//     try {
//       // First test a simple endpoint to verify auth works
//       console.log("Testing user profile endpoint...");
//       const profileResponse = await fetch("https://api.spotify.com/v1/me", {
//         headers: {
//           Authorization: `Bearer ${session.accessToken}`,
//         },
//       });

//       if (!profileResponse.ok) {
//         throw new Error(`Profile API failed: ${profileResponse.status}`);
//       }

//       const profileData = await profileResponse.json();
//       console.log("Profile fetch successful:", profileData.display_name);
      
//       // Now test recommendations with a known valid genre
//       console.log("Testing recommendations endpoint...");
//       const recoResponse = await fetch(
//         "https://api.spotify.com/v1/recommendations?limit=1&seed_artists=4NHQUGzhtTLFvgF5SZesLK", 
//         {
//           headers: {
//             Authorization: `Bearer ${session.accessToken}`,
//           },
//         }
//       );

//       if (!recoResponse.ok) {
//         throw new Error(`Recommendations API failed: ${recoResponse.status}`);
//       }

//       const recoData = await recoResponse.json();
//       console.log("Recommendations successful, got tracks:", recoData.tracks?.length);

//       // Test available-genre-seeds endpoint
//       console.log("Testing genres endpoint...");
//       const genresResponse = await fetch(
//         "https://api.spotify.com/v1/recommendations/available-genre-seeds",
//         {
//           headers: {
//             Authorization: `Bearer ${session.accessToken}`,
//           },
//         }
//       );

//       if (!genresResponse.ok) {
//         throw new Error(`Genres API failed: ${genresResponse.status}`);
//       }

//       const genresData = await genresResponse.json();
//       console.log("Genres successful, got genres:", genresData.genres?.length);
      
//       setGenres(genresData.genres || []);
//       setTestResult({
//         success: true,
//         message: "All API tests passed successfully!"
//       });
//     } catch (err) {
//       console.error("API Test error:", err);
//       setError(err instanceof Error ? err.message : "Unknown error");
//       setTestResult({
//         success: false,
//         message: err instanceof Error ? err.message : "Unknown error"
//       });
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="p-6 glass rounded-xl">
//       <h2 className="text-xl font-semibold mb-4 text-soft-brown">Spotify API Test</h2>
      
//       <button 
//         onClick={testDirectSpotifyAPI}
//         disabled={loading || !session}
//         className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 mb-4"
//       >
//         {loading ? "Testing..." : "Test Spotify API Directly"}
//       </button>
      
//       {!session && (
//         <p className="text-amber-500 mb-4">
//           Please connect your Spotify account first.
//         </p>
//       )}
      
//       {testResult && (
//         <div className={`p-4 rounded-lg mb-4 ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//           <p className="font-medium">{testResult.success ? '✅ Success!' : '❌ Error!'}</p>
//           <p>{testResult.message}</p>
//         </div>
//       )}

//       {error && (
//         <div className="p-4 bg-red-100 rounded-lg text-red-700 mb-4">
//           <p className="font-medium">Error occurred:</p>
//           <p>{error}</p>
//         </div>
//       )}

//       {genres.length > 0 && (
//         <div>
//           <h3 className="text-lg font-medium mb-2 text-soft-brown">Available Genres ({genres.length})</h3>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
//             {genres.map((genre) => (
//               <div key={genre} className="p-2 bg-white/10 rounded text-sm">
//                 {genre}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SpotifyGenresTest() {
  const { data: session } = useSession();
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  async function testSpotifyAPI() {
    if (!session?.accessToken) {
      setError("No access token available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First test a simple endpoint - user profile
      console.log("Testing profile endpoint...");
      const profileResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error(`Profile API failed: ${profileResponse.status}`);
      }

      const profileData = await profileResponse.json();
      console.log("Profile fetch successful:", profileData.display_name);
      
      // Now test recommendations with a guaranteed valid artist seed
      console.log("Testing recommendations with artist seed...");
      const recoResponse = await fetch(
        // Using Adele's artist ID as a reliable seed
        "https://api.spotify.com/v1/recommendations?limit=1&seed_artists=4dpARuHxo51G3z768sgnrY", 
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!recoResponse.ok) {
        throw new Error(`Recommendations API failed: ${recoResponse.status}`);
      }

      const recoData = await recoResponse.json();
      console.log("Recommendations successful, tracks:", recoData.tracks?.length);

      // Test available-genre-seeds endpoint
      console.log("Testing genre seeds endpoint...");
      const genresResponse = await fetch(
        "https://api.spotify.com/v1/recommendations/available-genre-seeds",
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!genresResponse.ok) {
        throw new Error(`Genre seeds API failed: ${genresResponse.status}`);
      }

      const genresData = await genresResponse.json();
      console.log("Genre seeds successful, count:", genresData.genres?.length);
      
      setGenres(genresData.genres || []);
      setTestResult({
        success: true,
        message: "All API tests passed!"
      });
    } catch (err) {
      console.error("API Test error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Unknown error"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Spotify API Test</h2>
      
      <button 
        onClick={testSpotifyAPI}
        disabled={loading || !session}
        className="px-4 py-2 bg-green-500 text-white rounded-md disabled:opacity-50 mb-4"
      >
        {loading ? "Testing..." : "Test Spotify API"}
      </button>
      
      {!session && (
        <p className="text-amber-500 mb-4">
          Please connect your Spotify account first.
        </p>
      )}
      
      {testResult && (
        <div className={`p-4 rounded-lg mb-4 ${testResult.success ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'}`}>
          <p className="font-medium">{testResult.success ? '✅ Success!' : '❌ Error!'}</p>
          <p>{testResult.message}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 rounded-lg mb-4">
          <p className="font-medium">Error occurred:</p>
          <p>{error}</p>
        </div>
      )}

      {genres.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Available Genres ({genres.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
            {genres.map((genre) => (
              <div key={genre} className="p-2 bg-gray-100 rounded text-sm">
                {genre}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}