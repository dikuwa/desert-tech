import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/receipts/generate": [
      "./public/fonts/*.ttf",
      "./public/images/deserttech-logo-pdf.png",
    ],
    "/api/documents/share/[token]": [
      "./public/fonts/*.ttf",
      "./public/images/deserttech-logo-pdf.png",
    ],
    "/d/[code]/pdf": [
      "./public/fonts/*.ttf",
      "./public/images/deserttech-logo-pdf.png",
    ],
    "/d/[code]/download": [
      "./public/fonts/*.ttf",
      "./public/images/deserttech-logo-pdf.png",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
