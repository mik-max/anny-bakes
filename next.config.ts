import type { NextConfig } from "next";

const cloudinaryCloud = process.env.CLOUDINARY_CLOUD_NAME;

const nextConfig: NextConfig = {
  images: {
    // AVIF first (smallest at the same quality), WebP as the fallback.
    formats: ["image/avif", "image/webp"],
    // 75 is the default; 90 is used for the full-screen hero where detail shows.
    qualities: [75, 90],
    // Product photos uploaded from the admin live in our Cloudinary account.
    remotePatterns: cloudinaryCloud
      ? [{ protocol: "https", hostname: "res.cloudinary.com", pathname: `/${cloudinaryCloud}/**` }]
      : [],
  },
};

export default nextConfig;
