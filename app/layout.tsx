import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
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
    <html lang="en" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
