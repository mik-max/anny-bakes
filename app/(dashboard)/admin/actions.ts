"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus } from "@/types";
import {
  updateProduct,
  createProduct,
  deleteProduct,
} from "@/data/products";

// TODO: replace order mutations with real DB calls once backend is provisioned
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function toggleProductStock(productId: string, inStock: boolean) {
  updateProduct(productId, { in_stock: inStock });
  revalidatePath("/admin/products");
}

export interface ProductInput {
  name: string;
  description: string;
  price: number; // cents
  image_url: string;
  in_stock: boolean;
}

export async function createProductAction(data: ProductInput): Promise<{ error?: string }> {
  if (!data.name.trim() || !data.description.trim()) {
    return { error: "Name and description are required." };
  }
  if (data.price <= 0) {
    return { error: "Price must be greater than zero." };
  }
  createProduct(data);
  revalidatePath("/admin/products");
  revalidatePath("/");
  return {};
}

export async function updateProductAction(
  id: string,
  data: ProductInput
): Promise<{ error?: string }> {
  if (!data.name.trim() || !data.description.trim()) {
    return { error: "Name and description are required." };
  }
  if (data.price <= 0) {
    return { error: "Price must be greater than zero." };
  }
  const result = updateProduct(id, data);
  if (!result) return { error: "Product not found." };
  revalidatePath("/admin/products");
  revalidatePath("/");
  return {};
}

export async function deleteProductAction(id: string): Promise<{ error?: string }> {
  const ok = deleteProduct(id);
  if (!ok) return { error: "Product not found." };
  revalidatePath("/admin/products");
  revalidatePath("/");
  return {};
}
