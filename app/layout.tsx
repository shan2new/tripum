import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { LanguageProvider } from "@/hooks/use-language";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rameshwaram Yatra",
  description: "Family trip coordinator — Feb 28 to Mar 2, 2026",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FAF9F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </head>
        <body style={{ margin: 0, padding: 0 }}>
          <LanguageProvider>{children}</LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
