import type { Metadata } from "next";
import { Geist, Geist_Mono, Antonio } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const antonio = Antonio({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Keino Campbell - Full Stack Developer",
  description: "Interactive skill tree portfolio showcasing my development journey, technical expertise, and professional achievements in web development, AI, and cloud technologies.",
  keywords: ["Full Stack Developer", "React", "Next.js", "TypeScript", "Node.js", "AI", "Portfolio"],
  authors: [{ name: "Keino Campbell" }],
  openGraph: {
    title: "Keino Campbell - Full Stack Developer",
    description: "Interactive skill tree portfolio showcasing my development journey",
    url: "https://keino.dev",
    siteName: "Keino Campbell Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Keino Campbell - Full Stack Developer",
    description: "Interactive skill tree portfolio showcasing my development journey",
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
        className={`${geistSans.variable} ${geistMono.variable} ${antonio.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
