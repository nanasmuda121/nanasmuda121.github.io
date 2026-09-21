import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Adnan Ferdiansyah — Jual Source Code Aplikasi Android & Website",
  description:
    "Katalog Full Source Code resmi dari Adnan Ferdiansyah. Aplikasi Android (NanzTube, Beatles Music) & Website (NanzMusify, QuickRepos, Qur'an Digital, ModKite). WhatsApp: +62 831-8656-1414.",
  keywords: [
    "Adnan Ferdiansyah",
    "Source Code Aplikasi Android",
    "Jual Source Code Web",
    "NanzTube APK Source Code",
    "Beatles Music Player Kotlin",
    "NanzMusify",
    "QuickRepos",
    "Quran Digital",
    "ModKite",
  ],
  authors: [{ name: "Adnan Ferdiansyah" }],
  creator: "Adnan Ferdiansyah",
  openGraph: {
    title: "Adnan Ferdiansyah — Jual Source Code Aplikasi Android & Website",
    description:
      "Katalog Full Source Code resmi: NanzTube, Beatles Music, NanzMusify, QuickRepos, Qur'an Digital, ModKite. WhatsApp: +62 831-8656-1414.",
    url: "https://nanasmuda121.github.io",
    siteName: "Adnan Ferdiansyah Source Code Store",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adnan Ferdiansyah — Jual Source Code Aplikasi Android & Website",
    description:
      "Katalog Full Source Code resmi: NanzTube, Beatles Music, NanzMusify, QuickRepos, Qur'an Digital, ModKite. WhatsApp: +62 831-8656-1414.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark scroll-smooth">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>"
        />
      </head>
      <body className="bg-[#050507] text-[#ededed] min-h-screen antialiased selection:bg-[#00f0ff] selection:text-[#050507]">
        {children}
      </body>
    </html>
  );
}
