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
  title: "Keino Chichester — Full-Stack Software Engineer",
  description:
    "Full-stack software engineer based in Brooklyn, NY. Building production web apps with 8 years of healthcare finance experience.",
  keywords: [
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
    title: "Keino Chichester — Full-Stack Software Engineer",
    description:
      "Full-stack software engineer based in Brooklyn, NY. Building production web apps with 8 years of healthcare finance experience.",
    url: "https://keino.dev",
    siteName: "Keino Chichester",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Keino Chichester — Full-Stack Software Engineer",
    description:
      "Full-stack software engineer based in Brooklyn, NY.",
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
