import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Space_Grotesk,
  DM_Sans,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Keino Chichester — Product Engineer",
  description:
    "Product engineer based in Brooklyn, NY. I build full-stack web apps that solve real business problems — 3+ years shipping software, 8 years in finance.",
  keywords: [
    "Product Engineer",
    "Full Stack Developer",
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "AI",
    "Portfolio",
  ],
  authors: [{ name: "Keino Chichester" }],
  openGraph: {
    title: "Keino Chichester — Product Engineer",
    description:
      "Product engineer based in Brooklyn, NY. I build full-stack web apps that solve real business problems — 3+ years shipping software, 8 years in finance.",
    url: "https://keino.dev",
    siteName: "Keino Chichester",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Keino Chichester — Product Engineer",
    description:
      "Product engineer based in Brooklyn, NY. I build full-stack web apps that solve real business problems.",
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
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${dmSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
