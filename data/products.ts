import { Product } from "@/types";

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Classic Victoria Sponge",
    description: "Light vanilla sponge layered with strawberry jam and fresh cream.",
    price: 3200, // $32.00
    image_url: "/images/victoria-sponge.jpg",
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Chocolate Fudge Cake",
    description: "Rich triple-layer chocolate cake with fudge frosting.",
    price: 3800,
    image_url: "/images/chocolate-fudge.jpg",
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Lemon Drizzle Loaf",
    description: "Zingy lemon sponge with a crunchy sugar glaze.",
    price: 1800,
    image_url: "/images/lemon-drizzle.jpg",
    in_stock: false,
    created_at: new Date().toISOString(),
  },
];
