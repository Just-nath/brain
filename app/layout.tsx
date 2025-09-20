import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://brains.vercel.app'),
  title: "Brains - Farcaster Profile IQ Quiz",
  description: "Test your knowledge of Farcaster community members. Identify profiles from their pictures and compete with friends!",
  keywords: ["Farcaster", "Quiz", "IQ Test", "Community", "Profile Pictures", "Social Media"],
  authors: [{ name: "Brains Quiz Team" }],
  openGraph: {
    title: "Brains - Farcaster Profile IQ Quiz",
    description: "Test your knowledge of Farcaster community members",
    type: "website",
    url: "https://brains.quiz",
    siteName: "Brains Quiz",
    images: [
      {
        url: "/api/frame-image?score=15&total=20&percentage=75&category=Active%20Community%20Member",
        width: 1200,
        height: 630,
        alt: "Brains Quiz Results",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brains - Farcaster Profile IQ Quiz",
    description: "Test your knowledge of Farcaster community members",
    images: ["/api/frame-image?score=15&total=20&percentage=75&category=Active%20Community%20Member"],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "/api/frame-image?score=15&total=20&percentage=75&category=Active%20Community%20Member",
    "fc:frame:button:1": "Take Quiz",
    "fc:frame:button:2": "View Results",
    "fc:frame:post_url": "/api/frame",
    "fc:frame:aspect_ratio": "1.91:1",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
