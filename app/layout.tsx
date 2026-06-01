import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "Desert Technology Consultant",
    template: "%s | Desert Technology Consultant",
  },
  description:
    "New, pre-owned and refurbished technology products in Namibia. Apple, Windows, Gaming, CCTV, Networking, POS and more.",
  keywords: [
    "technology",
    "Namibia",
    "laptops",
    "desktops",
    "CCTV",
    "networking",
    "POS",
    "Apple",
    "gaming",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
