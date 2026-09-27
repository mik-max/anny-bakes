import type { StaticImageData } from "next/image";
import { CATEGORY_IMAGES } from "@/constants/images";
import type { Product } from "@/types";

/** The product's own photo, or its category's photo if it doesn't have one yet. */
export function productImage(product: Pick<Product, "image_url" | "category">): string | StaticImageData {
  return product.image_url || CATEGORY_IMAGES[product.category];
}
