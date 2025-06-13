// src/app/layout.tsx
import "./globals.css";
import AuthProvider from "@/providers/AuthProviders";
import SpotifyAuth from "@/components/spotifyAuth/spotifyAuth";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>  
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
