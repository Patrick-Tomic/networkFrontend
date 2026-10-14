import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Wesley Chapel Network: Local businesses & events",
    template: "%s · Wesley Chapel Network",
  },
  description:
    "Find local pros in Wesley Chapel, FL, and see what's happening this weekend. Free to browse, no account needed.",
  openGraph: {
    siteName: site.name,
    images: "/brand/og.jpg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
