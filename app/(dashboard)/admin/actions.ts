"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus } from "@/types";

// TODO: replace with real DB mutations once backend is provisioned
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  // Stub — mock data cannot be mutated across requests
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function toggleProductStock(productId: string, inStock: boolean) {
  // Stub — mock data cannot be mutated across requests
  void productId;
  void inStock;
  revalidatePath("/admin/products");
}
