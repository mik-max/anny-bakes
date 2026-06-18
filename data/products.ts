import { Product } from "@/types";
import { IMAGES } from "@/constants/images";

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Classic Victoria Sponge",
    description: "Light vanilla sponge layered with strawberry jam and fresh cream.",
    price: 3200,
    image_url: IMAGES.victoriaSponge.src,
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Chocolate Fudge Cake",
    description: "Rich triple-layer chocolate cake with fudge frosting.",
    price: 3800,
    image_url: IMAGES.chocolateFudge.src,
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Lemon Drizzle Loaf",
    description: "Zingy lemon sponge with a crunchy sugar glaze.",
    price: 1800,
    image_url: IMAGES.lemonDrizzle.src,
    in_stock: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Carrot & Walnut Cake",
    description: "Warmly spiced carrot cake packed with walnuts and topped with silky cream cheese frosting.",
    price: 3400,
    image_url: IMAGES.carrotWalnut.src,
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Red Velvet Cake",
    description: "Moist crimson layers with a hint of cocoa and a generous cream cheese frosting.",
    price: 4200,
    image_url: IMAGES.redVelvet.src,
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Blueberry Muffins",
    description: "Bursting with fresh blueberries and finished with a golden sugar crumble. Sold per half-dozen.",
    price: 1400,
    image_url: IMAGES.blueberryMuffins.src,
    in_stock: true,
    created_at: new Date().toISOString(),
  },
];
