import { getAllProducts } from "@/backend/products";
import DropForm from "@/components/admin/DropForm";
import { defaultDropTimes } from "@/lib/drops";

export const dynamic = "force-dynamic";

export default async function NewDropPage() {
  const products = await getAllProducts();

  return (
    <DropForm
      products={products}
      drop={null}
      initial={{ name: "", ...defaultDropTimes(), items: [] }}
    />
  );
}
