import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adihansyahproduction — Creative Studio",
  description: "Creative partner untuk desain Instagram, social media management, dan visual branding yang bikin brand lebih menonjol.",
  applicationName: "Adihansyahproduction",
  openGraph: {
    title: "Adihansyahproduction — Creative Studio",
    description: "Make your brand impossible to ignore.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
