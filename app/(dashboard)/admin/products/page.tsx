import { getAllProducts } from "@/data/products";
import ProductsManager from "@/components/admin/ProductsManager";

export default function AdminProductsPage() {
  const products = getAllProducts();
  return <ProductsManager products={products} />;
}
