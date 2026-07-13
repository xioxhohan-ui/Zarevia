import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { LayoutContent } from "./LayoutContent";
import { SpeedInsights } from "@vercel/speed-insights/next";

const BASE_URL = 'https://zarevia.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "MYRO | Affordable Ladies Shoes in Bangladesh",
    template: "%s | MYRO",
  },
  description: "Shop MYRO — Bangladesh's leading affordable ladies' shoe brand. Stylish heels, sandals & comfort flats from ৳900–৳3,000. Cash on delivery. Fast nationwide shipping.",
  keywords: ["ladies shoes bangladesh", "affordable women shoes", "heels bangladesh", "MYRO shoes", "online shoe shop dhaka"],
  authors: [{ name: "MYRO" }],
  creator: "MYRO",
  publisher: "MYRO",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "MYRO",
    title: "MYRO | Affordable Ladies Shoes in Bangladesh",
    description: "Shop MYRO — Bangladesh's leading affordable ladies' shoe brand. Heels, sandals & flats from ৳900–৳3,000.",
    images: [{ url: "/images/zeen-low-heel.jpg", width: 1200, height: 630, alt: "MYRO Ladies Shoes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MYRO | Affordable Ladies Shoes in Bangladesh",
    description: "Stylish heels, sandals & flats from ৳900–৳3,000. Fast delivery across Bangladesh.",
    images: ["/images/zeen-low-heel.jpg"],
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#c9876d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <LayoutContent>{children}</LayoutContent>
        </CartProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
