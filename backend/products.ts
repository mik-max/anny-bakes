import "server-only";
import { ObjectId, type WithId } from "mongodb";
import { getDb } from "@/backend/db";
import type { Product, ProductInput } from "@/types";

interface ProductDoc extends ProductInput {
  created_at: Date;
}

async function collection() {
  return (await getDb()).collection<ProductDoc>("products");
}

function toProduct({ _id, created_at, ...rest }: WithId<ProductDoc>): Product {
  return {
    ...rest,
    // Older documents predate these fields
    featured: rest.featured ?? false,
    ingredients: rest.ingredients ?? "",
    id: _id.toString(),
    created_at: created_at.toISOString(),
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const docs = await (await collection()).find().sort({ _id: 1 }).toArray();
  return docs.map(toProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!ObjectId.isValid(id)) return null;
  const doc = await (await collection()).findOne({ _id: new ObjectId(id) });
  return doc ? toProduct(doc) : null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const objectIds = [...new Set(ids)].filter(ObjectId.isValid).map((id) => new ObjectId(id));
  if (objectIds.length === 0) return [];
  const docs = await (await collection()).find({ _id: { $in: objectIds } }).toArray();
  return docs.map(toProduct);
}

export async function createProduct(data: ProductInput): Promise<Product> {
  const doc: ProductDoc = { ...data, created_at: new Date() };
  const { insertedId } = await (await collection()).insertOne(doc);
  return toProduct({ ...doc, _id: insertedId });
}

export async function updateProduct(
  id: string,
  data: Partial<ProductInput>
): Promise<Product | null> {
  if (!ObjectId.isValid(id)) return null;
  const doc = await (await collection()).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: data },
    { returnDocument: "after" }
  );
  return doc ? toProduct(doc) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const { deletedCount } = await (await collection()).deleteOne({
    _id: new ObjectId(id),
  });
  return deletedCount === 1;
}
