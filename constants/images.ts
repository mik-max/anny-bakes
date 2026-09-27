import type { StaticImageData } from "next/image";
import type { ProductCategory } from "@/types";

import heroDesktop from "../public/images/hero/hero-desktop.jpg";
import heroMobile from "../public/images/hero/hero-mobile.jpg";

import sourdough from "../public/images/categories/sourdough.jpg";
import focaccia from "../public/images/categories/focaccia.jpg";
import babka from "../public/images/categories/babka.jpg";
import muffins from "../public/images/categories/muffins.jpg";
import bread from "../public/images/categories/bread.jpg";
import buns from "../public/images/categories/buns.jpg";
import croissants from "../public/images/categories/croissants.jpg";
import donuts from "../public/images/categories/donuts.jpg";
import cakes from "../public/images/categories/cakes.jpg";
import cookies from "../public/images/categories/cookies.jpg";

// Licensed stock photos until the client's own photos are ready — see IMAGE_CREDITS.md.
export const IMAGES = {
  heroDesktop, // 3840×2363 landscape
  heroMobile, // 1440×2560 portrait crop of the same photo
} as const;

/** Shown for any product that doesn't have its own photo yet. */
export const CATEGORY_IMAGES: Record<ProductCategory, StaticImageData> = {
  Sourdough: sourdough,
  Focaccia: focaccia,
  Babka: babka,
  Muffins: muffins,
  Bread: bread,
  Buns: buns,
  Croissants: croissants,
  Donuts: donuts,
  Cakes: cakes,
  Cookies: cookies,
};
