import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reelpey | Performance-Based Creator Marketing Platform",
  description:
    "Turn your short-form videos into real earnings. Join 60K+ creators, explore campaigns from 200+ brands, and get paid for every verified view.",
  keywords: [
    "creator marketing",
    "UGC platform",
    "earn from content",
    "brand campaigns",
    "short form video",
  ],
  openGraph: {
    title: "Reelpey | Performance-Based Creator Marketing Platform",
    description:
      "Turn your short-form videos into real earnings. Join 60K+ creators and explore campaigns from 200+ brands.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Allow users to pinch-zoom — don't trap them at scale 1 (accessibility)
  maximumScale: 5,
  themeColor: "#06050e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
