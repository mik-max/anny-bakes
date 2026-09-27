import { notFound } from "next/navigation";
import { getDropById } from "@/backend/drops";
import { getAllProducts } from "@/backend/products";
import DropForm from "@/components/admin/DropForm";
import { getDropStatus } from "@/lib/drops";
import { utcToBakeryLocal } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function EditDropPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [drop, products] = await Promise.all([getDropById(id), getAllProducts()]);
  if (!drop) notFound();

  return (
    <DropForm
      products={products}
      drop={drop}
      status={getDropStatus(drop)}
      initial={{
        name: drop.name,
        opens_at: utcToBakeryLocal(new Date(drop.opens_at)),
        closes_at: utcToBakeryLocal(new Date(drop.closes_at)),
        pickup_date: drop.pickup_date,
        pickup_window: drop.pickup_window,
        items: drop.items.map(({ product_id, quantity }) => ({ product_id, quantity })),
      }}
    />
  );
}
