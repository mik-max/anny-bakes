import { getAllProducts } from "@/backend/products";
import ProductsManager from "@/components/admin/ProductsManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProducts();
  return <ProductsManager products={products} />;
}
