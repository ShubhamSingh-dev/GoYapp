import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GoyApp - Video Meetings & Collaboration",
  description:
    "Connect and collaborate with your team through high-quality video calls, real-time chat, and seamless screen sharing.",
  keywords: [
    "video calls",
    "meetings",
    "collaboration",
    "webrtc",
    "chat",
    "screen sharing",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "GoyApp - Video Meetings & Collaboration",
    description:
      "Connect and collaborate with your team through high-quality video calls, real-time chat, and seamless screen sharing.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoyApp - Video Meetings & Collaboration",
    description:
      "Connect and collaborate with your team through high-quality video calls, real-time chat, and seamless screen sharing.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to main content
        </a>
        <div id="main-content">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
