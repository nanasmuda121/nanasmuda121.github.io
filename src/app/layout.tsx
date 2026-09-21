import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Adnan Ferdiansyah — Creative Technologist & 3D Web Architect",
  description:
    "Official portfolio of Adnan Ferdiansyah. Engineering tactile 3D WebGL interfaces, real-time digital signal processing, and high-performance client architectures.",
  keywords: [
    "Adnan Ferdiansyah",
    "Creative Technologist",
    "3D Web Architect",
    "Three.js Portfolio",
    "WebGL Developer",
    "Next.js Developer Indonesia",
    "Frontend Architect Jakarta",
  ],
  authors: [{ name: "Adnan Ferdiansyah" }],
  creator: "Adnan Ferdiansyah",
  openGraph: {
    title: "Adnan Ferdiansyah — Creative Technologist & 3D Web Architect",
    description:
      "Engineering tactile 3D WebGL interfaces, real-time audio DSP, and resilient client architectures.",
    url: "https://adnanferdiansyah.dev",
    siteName: "Adnan Ferdiansyah Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adnan Ferdiansyah — Creative Technologist & 3D Web Architect",
    description:
      "Engineering tactile 3D WebGL interfaces, real-time audio DSP, and resilient client architectures.",
    creator: "@adnan_ferdi",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
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
