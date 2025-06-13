// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Middleware function to handle CORS and protect API routes
export async function middleware(request: NextRequest) {
  // Create a response object
  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,DELETE,PATCH,POST,PUT"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return response;
  }

  // Protect Spotify API routes
  if (request.nextUrl.pathname.startsWith("/api/spotify")) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token) {
        return new NextResponse(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401 }
        );
      }
    } catch (error) {
      console.error("Middleware auth error:", error);
      return new NextResponse(
        JSON.stringify({ error: "Authentication failed" }),
        { status: 401 }
      );
    }
  }

  return response;
}

// Configure which routes use the middleware
export const config = {
  // Match API and auth routes
  matcher: ["/api/spotify/:path*", "/api/auth/:path*", "/api/auth/session"],
};
