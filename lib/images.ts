import type { StaticImageData } from "next/image";
import { CATEGORY_IMAGES } from "@/constants/images";
import type { Product } from "@/types";

const CLOUDINARY_UPLOAD = /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//;

export function isCloudinaryUrl(url: string): boolean {
  return CLOUDINARY_UPLOAD.test(url);
}

/**
 * Asks Cloudinary for the photo already cropped to this size, in the best format
 * for the browser (f_auto) at good-enough quality (q_auto). Uploaded originals
 * can be several MB, so this is much faster than resizing them ourselves.
 */
export function cloudinarySized(url: string, width: number, height: number): string {
  return url.replace(
    "/image/upload/",
    `/image/upload/c_fill,w_${width},h_${height},f_auto,q_auto/`
  );
}

/**
 * src + unoptimized for next/image. Cloudinary photos are resized by Cloudinary
 * (so Next's optimizer is skipped); local photos go through Next as usual.
 * Products without their own photo show their category photo.
 */
export function productImageProps(
  product: Pick<Product, "image_url" | "category">,
  size: { width: number; height: number }
): { src: string | StaticImageData; unoptimized: boolean } {
  const url = product.image_url;
  if (url && isCloudinaryUrl(url)) {
    return { src: cloudinarySized(url, size.width, size.height), unoptimized: true };
  }
  return { src: url || CATEGORY_IMAGES[product.category], unoptimized: false };
}
