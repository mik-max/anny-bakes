import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (smallest at the same quality), WebP as the fallback.
    formats: ["image/avif", "image/webp"],
    // 75 is the default; 90 is used for the full-screen hero where detail shows.
    qualities: [75, 90],
  },
};

export default nextConfig;
