import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { LanguageProvider } from "@/hooks/use-language";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rameshwaram Yatra",
  description: "Family trip coordinator — Feb 28 to Mar 2, 2026",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FAFAF8",
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
