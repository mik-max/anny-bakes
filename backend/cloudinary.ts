import "server-only";
import { createHash } from "node:crypto";
import type { UploadSignature } from "@/types";

// Admin photo uploads go straight from the browser to Cloudinary. The server
// only signs each upload, so the API secret never leaves the server.

const PRODUCT_FOLDER = "anny-bakes/products";
const ALLOWED_FORMATS = "jpg,jpeg,png,webp,avif";

function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

/** Signs a one-off upload into the product folder, or null if Cloudinary isn't set up. */
export function signProductUpload(): UploadSignature | null {
  const cfg = config();
  if (!cfg) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  // Cloudinary signs the upload params sorted by name, joined with "&", plus the secret.
  const params = { allowed_formats: ALLOWED_FORMATS, folder: PRODUCT_FOLDER, timestamp };
  const toSign = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const signature = createHash("sha1").update(toSign + cfg.apiSecret).digest("hex");

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`,
    apiKey: cfg.apiKey,
    timestamp,
    signature,
    folder: PRODUCT_FOLDER,
    allowedFormats: ALLOWED_FORMATS,
  };
}

/**
 * Product images may only be our own files or photos uploaded to our Cloudinary
 * account — anything else would fail to load through next/image.
 */
export function isAllowedProductImage(url: string): boolean {
  if (url === "" || url.startsWith("/images/")) return true;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  return !!cloudName && url.startsWith(`https://res.cloudinary.com/${cloudName}/image/upload/`);
}
