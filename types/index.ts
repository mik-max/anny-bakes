import { CURRENCY, PRODUCT_CATEGORIES } from "@/constants";

export type FulfilmentMethod = "pickup" | "delivery";

/** Card = Stripe Checkout (incl. Apple/Google Pay); e-Transfer = Interac, confirmed by an admin. */
export type PaymentMethod = "card" | "etransfer";

export type OrderStatus =
  | "pending" // checkout started, stock held, awaiting payment
  | "expired" // checkout abandoned — stock released
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
  ingredients: string; // free text incl. allergens; empty until the client supplies it
  category: ProductCategory;
  price: number; // cents (CAD)
  image_url: string;
  in_stock: boolean;
  featured: boolean; // shown in "Featured Best Sellers" on the home page
  created_at: string;
}

/** What the browser needs to upload one product photo to Cloudinary. */
export interface UploadSignature {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
}

/** Fields an admin can set when creating or editing a product. */
export type ProductInput = Omit<Product, "id" | "created_at">;

export interface DropItem {
  product_id: string;
  quantity: number; // units available in this drop
  reserved: number; // units held by checkouts in progress + paid orders
}

export interface WeeklyDrop {
  id: string;
  name: string;
  opens_at: string; // ISO (UTC)
  closes_at: string; // ISO (UTC)
  pickup_date: string; // YYYY-MM-DD, bakery local date
  pickup_window: string; // e.g. "3–5pm"
  items: DropItem[];
  created_at: string;
}

// Derived from opens_at / closes_at — never stored.
export type DropStatus = "scheduled" | "open" | "closed";

/** The open or next scheduled drop, joined with its products, for the storefront. */
export interface StorefrontDrop {
  id: string;
  name: string;
  status: Exclude<DropStatus, "closed">;
  opens_at: string;
  closes_at: string;
  pickup_date: string;
  pickup_window: string;
  items: { product: Product; remaining: number }[];
}

/** What the admin drop form submits. Times are bakery-local "YYYY-MM-DDTHH:mm". */
export interface DropFormInput {
  name: string;
  opens_at: string;
  closes_at: string;
  pickup_date: string;
  pickup_window: string;
  items: { product_id: string; quantity: number }[];
}

export interface OrderItem {
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
  drop_id: string;
  pickup_date: string; // YYYY-MM-DD, copied from the drop
  pickup_window: string;
  subtotal: number; // cents
  delivery_fee: number; // cents
  total: number; // cents
  currency: typeof CURRENCY;
  status: OrderStatus;
  payment_method: PaymentMethod;
  /** e-Transfer orders only: unpaid orders expire (and release stock) after this. */
  payment_due_at: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}
