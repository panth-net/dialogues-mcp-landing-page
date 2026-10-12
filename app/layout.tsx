import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { SITE, asset } from "@/lib/site-config";
import "./globals.css";

// Downloaded at build time and served from this site; visitors' browsers never contact Google.
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", display: "swap" });

const TITLE = "Dialogues MCP: talk with historical diaries and letters";
const OG_ALT =
  "Dialogues MCP: a painting of two groups in conversation on a shoreline, with the title over it.";

export const viewport: Viewport = {
  themeColor: "#0b0c10",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.domain),
  applicationName: SITE.name,
  title: { default: TITLE, template: `%s · ${SITE.name}` },
  description: SITE.description,
  keywords: [
    "Dialogues MCP",
    "historical letters",
    "historical diaries",
    "primary sources",
    "Claude",
    "MCP server",
    "local-first",
    "open source",
  ],
  category: "education",
  authors: [{ name: SITE.publisher.name, url: SITE.publisher.url }],
  creator: SITE.publisher.name,
  publisher: SITE.publisher.name,
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: asset("/favicon.ico"), sizes: "32x32" },
      { url: asset("/icon.svg"), type: "image/svg+xml" },
    ],
    apple: [{ url: asset("/apple-touch-icon.png"), sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE.name,
    title: TITLE,
    description: SITE.tagline,
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: OG_ALT, type: "image/jpeg" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE.tagline,
    images: [{ url: "/og-image.jpg", alt: OG_ALT }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${openSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
