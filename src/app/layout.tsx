import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { LayoutContent } from "./LayoutContent";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "MYRO | Leading Affordable Ladies Shoes Brand in Bangladesh",
  description: "Shop from MYRO, the leading affordable ladies' shoes brand in Bangladesh. Stylish heels, sandals & clogs from 900 BDT – 3000 BDT. Cash on delivery available.",
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
