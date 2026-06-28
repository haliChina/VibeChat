import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vibe-chat.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "vibe-chat — minimal local & remote LLM chat",
    template: "%s · vibe-chat",
  },
  description:
    "A sleek hybrid chat UI for llama.cpp and any OpenAI-compatible endpoint. Conversations stay on your machine.",
  applicationName: "vibe-chat",
  keywords: [
    "vibe-chat",
    "llama.cpp",
    "ollama",
    "OpenAI",
    "OpenRouter",
    "DeepSeek",
    "local LLM",
    "private chat",
  ],
  authors: [{ name: "vibe-chat" }],
  creator: "vibe-chat",
  publisher: "vibe-chat",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "vibe-chat",
    title: "vibe-chat — minimal local & remote LLM chat",
    description:
      "A sleek hybrid chat UI for llama.cpp and any OpenAI-compatible endpoint.",
  },
  twitter: {
    card: "summary_large_image",
    title: "vibe-chat — minimal local & remote LLM chat",
    description:
      "A sleek hybrid chat UI for llama.cpp and any OpenAI-compatible endpoint.",
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#000000" },
  ],
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
