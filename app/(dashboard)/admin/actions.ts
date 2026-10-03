"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus, ProductInput, UploadSignature } from "@/types";
import { PRODUCT_CATEGORIES } from "@/constants";
import {
  updateProduct,
  createProduct,
  deleteProduct,
} from "@/backend/products";
import { requireAdmin } from "@/backend/auth";
import { isAllowedProductImage, signProductUpload } from "@/backend/cloudinary";
import { isProductInUpcomingDrop } from "@/backend/drops";
import { getOrderById, updateOrderStatus as setOrderStatus } from "@/backend/orders";
import { confirmEtransferReceived } from "@/backend/checkout";
import { adminStatusTransitions } from "@/lib/orders";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();
  const order = await getOrderById(orderId);
  // Ignore stale buttons (e.g. two admins acting on the same order).
  if (!order || !adminStatusTransitions(order).includes(status)) return;
  if (order.status === "pending" && status === "paid") {
    await confirmEtransferReceived(orderId); // also emails the customer their confirmation
  } else {
    await setOrderStatus(orderId, status);
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function toggleProductStock(productId: string, inStock: boolean) {
  await requireAdmin();
  await updateProduct(productId, { in_stock: Boolean(inStock) });
  revalidatePath("/admin/products");
}

// Server actions receive whatever the client sends, so copy only known fields.
// Description is optional until the client supplies copy for every item.
function parseProduct(
  data: ProductInput
): { product: ProductInput } | { error: string } {
  const product: ProductInput = {
    name: String(data.name ?? "").trim(),
    description: String(data.description ?? "").trim(),
    ingredients: String(data.ingredients ?? "").trim(),
    category: data.category,
    price: Number(data.price),
    image_url: String(data.image_url ?? "").trim(),
    in_stock: Boolean(data.in_stock),
    featured: Boolean(data.featured),
  };
  if (!product.name) return { error: "Name is required." };
  if (!PRODUCT_CATEGORIES.includes(product.category)) {
    return { error: "Choose a category." };
  }
  if (!Number.isInteger(product.price) || product.price <= 0) {
    return { error: "Price must be greater than zero." };
  }
  if (!isAllowedProductImage(product.image_url)) {
    return { error: "That photo couldn't be used. Please upload it again." };
  }
  return { product };
}

export async function getProductUploadSignature(): Promise<
  { signature: UploadSignature } | { error: string }
> {
  await requireAdmin();
  const signature = signProductUpload();
  if (!signature) return { error: "Photo uploads aren't set up yet (Cloudinary keys missing)." };
  return { signature };
}

export async function createProductAction(data: ProductInput): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = parseProduct(data);
  if ("error" in parsed) return { error: parsed.error };
  await createProduct(parsed.product);
  revalidatePath("/admin/products");
  revalidatePath("/");
  return {};
}

export async function updateProductAction(
  id: string,
  data: ProductInput
): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = parseProduct(data);
  if ("error" in parsed) return { error: parsed.error };
  const result = await updateProduct(id, parsed.product);
  if (!result) return { error: "Product not found." };
  revalidatePath("/admin/products");
  revalidatePath("/");
  return {};
}

export async function deleteProductAction(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (await isProductInUpcomingDrop(id)) {
    return { error: "This product is in an open or upcoming drop. Remove it from the drop first." };
  }
  const ok = await deleteProduct(id);
  if (!ok) return { error: "Product not found." };
  revalidatePath("/admin/products");
  revalidatePath("/");
  return {};
}
