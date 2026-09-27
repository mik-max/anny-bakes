import { PRODUCT_CATEGORIES } from "@/constants";

export type FulfilmentMethod = "pickup" | "delivery";

export type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "ready"
  | "fulfilled"
  | "cancelled"
  | "refunded";

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number; // cents (USD)
  image_url: string;
  in_stock: boolean;
  created_at: string;
}

/** Fields an admin can set when creating or editing a product. */
export type ProductInput = Omit<Product, "id" | "created_at">;

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string; // snapshot
  unit_price: number; // snapshot, cents
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  email: string;
  phone: string;
  fulfilment_method: FulfilmentMethod;
  delivery_address: string | null;
  note: string | null;
  subtotal: number; // cents
  delivery_fee: number; // cents
  total: number; // cents
  currency: "usd";
  status: OrderStatus;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}
