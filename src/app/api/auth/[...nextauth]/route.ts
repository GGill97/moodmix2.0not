// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { EventCallbacks } from "next-auth";

// Enhanced type definitions
interface SpotifyToken extends JWT {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number | null;
  error?: string;
}

interface SpotifyAccount {
  access_token: string;
  expires_at: number;
  refresh_token: string;
  token_type: string;
  provider: string;
  type: string;
}
// Environment variable validation with detailed logging
const basicAuth = Buffer.from(
  `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
).toString("base64");

// Environment variable validation with detailed logging
function validateEnvVariables() {
  console.log("🔍 Starting environment variable validation");
  const required = [
    "SPOTIFY_CLIENT_ID",
    "SPOTIFY_CLIENT_SECRET",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(
      ", "
    )}`;
    console.error("❌ Validation failed:", error);
    throw new Error(error);
  }

  console.log("✅ Environment validation successful");
}

validateEnvVariables();

async function refreshAccessToken(token: SpotifyToken): Promise<SpotifyToken> {
  try {
    // Add request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken!,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Token refresh failed: ${errorData.error}`);
    }

    const data = await response.json();
    console.log("Token refresh successful:", {
      expires_in: data.expires_in,
      token_type: data.token_type,
    });

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
      error: undefined,
    };
  } catch (error) {
    // More detailed error logging
    console.error("Token refresh failed:", {
      error: error instanceof Error ? error.message : "Unknown error",
      token: { hasRefreshToken: !!token.refreshToken },
    });
    return {
      ...token,
      error: "RefreshAccessTokenError",
      accessToken: undefined,
      expiresAt: null,
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "user-read-email",
            "playlist-modify-public",
            "playlist-modify-private",
            "user-library-read",
            "streaming",
            "user-read-private",
            "user-top-read",
            "playlist-read-private",
            "playlist-read-collaborative",
            "user-read-playback-state",
            "user-modify-playback-state",
            "user-read-currently-playing",
            "user-read-recently-played",
            "user-follow-read",
            "user-follow-modify",
          ].join(" "),
          show_dialog: true,
        },
      },
    }),
  ],

  debug: process.env.NODE_ENV === "development",

  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },

  callbacks: {
    async jwt({ token, account }): Promise<JWT> {
      try {
        // Initial sign in
        if (account && account.access_token) {
          console.log("🔑 Initial token setup");
          const spotifyAccount = account as SpotifyAccount;
          return {
            ...token,
            accessToken: spotifyAccount.access_token,
            refreshToken: spotifyAccount.refresh_token,
            expiresAt: spotifyAccount.expires_at * 1000,
          };
        }

        // Check token expiration
        const expiresAt = (token as SpotifyToken).expiresAt;
        if (
          expiresAt &&
          typeof expiresAt === "number" &&
          Date.now() < expiresAt - 5000
        ) {
          return token;
        }

        // Refresh expired token
        console.log("🔄 Token expired, refreshing...");
        return await refreshAccessToken(token as SpotifyToken);
      } catch (error) {
        console.error("❌ JWT callback error:", error);
        return {
          ...token,
          error: error instanceof Error ? error.message : "TokenError",
        };
      }
    },

    async session({ session, token }) {
      try {
        const spotifyToken = token as SpotifyToken;

        return {
          ...session,
          accessToken: spotifyToken.accessToken,
          refreshToken: spotifyToken.refreshToken,
          error: spotifyToken.error,
        };
      } catch (error) {
        console.error("❌ Session callback error:", error);
        return {
          ...session,
          error: error instanceof Error ? error.message : "SessionError",
        };
      }
    },

    async redirect({ url, baseUrl }) {
      try {
        console.log("↪️ Processing redirect", { url, baseUrl });

        const currentUrl = new URL(url);
        const city = currentUrl.searchParams.get("city");

        if (city) {
          const redirectUrl = `${baseUrl}/?city=${encodeURIComponent(city)}`;
          console.log("🌍 Redirecting with city param:", city);
          return redirectUrl;
        }

        if (url.startsWith(baseUrl)) {
          return url;
        }

        return baseUrl;
      } catch (error) {
        console.error("❌ Redirect error:", error);
        return baseUrl;
      }
    },
  },

  events: {
    async signIn({ user, account }) {
      if (account && user) {
        console.log("🚪 Sign In Event", {
          userId: user.id,
          email: user.email,
          provider: account.provider,
        });
      }
    },

    async signOut({ token }) {
      const spotifyToken = token as SpotifyToken;
      console.log("👋 Sign Out Event", {
        hasToken: !!spotifyToken.accessToken,
      });
    },
  } as Partial<EventCallbacks>,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
