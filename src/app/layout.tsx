import { Providers } from "@/components/Providers";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-sandy-beige to-terracotta">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
