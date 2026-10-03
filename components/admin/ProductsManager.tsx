"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageIcon, X } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import { productImageProps } from "@/lib/images";
import { Product } from "@/types";
import { CURRENCY_SYMBOL, PRODUCT_CATEGORIES } from "@/constants";
import type { ProductCategory, ProductInput } from "@/types";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/app/(dashboard)/admin/actions";

function formatCents(cents: number) {
  return `${CURRENCY_SYMBOL}${(cents / 100).toFixed(2)}`;
}

interface ModalState {
  open: boolean;
  product: Product | null;
}

export default function ProductsManager({ products }: { products: Product[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>({ open: false, product: null });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function openAdd() {
    setModal({ open: true, product: null });
    setActionError(null);
  }

  function openEdit(product: Product) {
    setModal({ open: true, product });
    setActionError(null);
  }

  function closeModal() {
    setModal({ open: false, product: null });
    setActionError(null);
  }

  async function handleSave(input: ProductInput) {
    const result = modal.product
      ? await updateProductAction(modal.product.id, input)
      : await createProductAction(input);

    if (result.error) {
      setActionError(result.error);
      return;
    }
    closeModal();
    router.refresh();
  }

  async function handleDelete(id: string) {
    const result = await deleteProductAction(id);
    if (result.error) {
      setActionError(result.error);
      return;
    }
    setDeleteConfirmId(null);
    router.refresh();
  }

  return (
    <>
      {/* Page header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-semibold text-stone-900">Products</h1>
          <p className="mt-0.5 font-sans text-sm text-stone-500">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-lg bg-stone-900 px-4 py-2 font-sans text-sm font-semibold text-white transition-colors hover:bg-stone-700"
        >
          + Add
        </button>
      </div>

      {actionError && !modal.open && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 font-sans text-sm text-red-600">
          {actionError}
        </p>
      )}

      {/* ── Mobile: card list ── */}
      <div className="space-y-3 sm:hidden">
        {products.map((product) => (
          <div key={product.id} className="rounded-xl border border-stone-100 bg-white p-4">
            {/* Product info row */}
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                {product.image_url ? (
                  <Image
                    {...productImageProps(product, { width: 112, height: 112 })}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-stone-300">
                    <ImageIcon size={20} strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-sm font-semibold text-stone-900">
                  {product.featured && <span className="text-amber-700">★ </span>}
                  {product.name}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-sans text-sm text-stone-600">
                    {formatCents(product.price)}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 font-sans text-[11px] font-semibold ${
                      product.in_stock
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {product.in_stock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions row */}
            <div className="mt-3 flex items-center justify-end gap-4 border-t border-stone-50 pt-3">
              <button
                onClick={() => openEdit(product)}
                className="font-sans text-xs font-semibold text-stone-500 transition-colors hover:text-stone-900"
              >
                Edit
              </button>

              {deleteConfirmId === product.id ? (
                <span className="flex items-center gap-2">
                  <span className="font-sans text-xs text-stone-400">Delete?</span>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="font-sans text-xs font-semibold text-red-600 transition-colors hover:text-red-800"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="font-sans text-xs font-semibold text-stone-400 transition-colors hover:text-stone-700"
                  >
                    No
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setDeleteConfirmId(product.id)}
                  className="font-sans text-xs font-semibold text-stone-400 transition-colors hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop: table ── */}
      <div className="hidden overflow-hidden rounded-xl border border-stone-100 bg-white sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-stone-400">
                Product
              </th>
              <th className="hidden px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-stone-400 sm:table-cell">
                Price
              </th>
              <th className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wide text-stone-400">
                Stock
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {products.map((product) => (
              <tr key={product.id} className="transition-colors hover:bg-stone-50/50">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                      {product.image_url ? (
                        <Image
                          {...productImageProps(product, { width: 112, height: 112 })}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-stone-300">
                          <ImageIcon size={20} strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-sans text-sm font-medium text-stone-900">
                        {product.name}
                        {product.featured && (
                          <span className="ml-2 font-sans text-[11px] font-semibold text-amber-700">
                            ★ Featured
                          </span>
                        )}
                      </p>
                      <p className="line-clamp-1 font-sans text-xs text-stone-400">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3.5 font-sans text-sm text-stone-900 sm:table-cell">
                  {formatCents(product.price)}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-xs font-semibold ${
                      product.in_stock
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {product.in_stock ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => openEdit(product)}
                      className="font-sans text-xs font-semibold text-stone-500 transition-colors hover:text-stone-900"
                    >
                      Edit
                    </button>

                    {deleteConfirmId === product.id ? (
                      <span className="flex items-center gap-2">
                        <span className="font-sans text-xs text-stone-400">Delete?</span>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="font-sans text-xs font-semibold text-red-600 transition-colors hover:text-red-800"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="font-sans text-xs font-semibold text-stone-400 transition-colors hover:text-stone-700"
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(product.id)}
                        className="font-sans text-xs font-semibold text-stone-400 transition-colors hover:text-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit modal */}
      {modal.open && (
        <ProductModal
          product={modal.product}
          onSave={handleSave}
          onClose={closeModal}
          error={actionError}
        />
      )}
    </>
  );
}

// ── Product modal ──────────────────────────────────────────────────────────────

function ProductModal({
  product,
  onSave,
  onClose,
  error,
}: {
  product: Product | null;
  onSave: (input: ProductInput) => Promise<void>;
  onClose: () => void;
  error: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const priceRaw = parseFloat(fd.get("price") as string);
    const input: ProductInput = {
      name: (fd.get("name") as string).trim(),
      description: (fd.get("description") as string).trim(),
      ingredients: (fd.get("ingredients") as string).trim(),
      category: fd.get("category") as ProductCategory,
      price: Math.round(priceRaw * 100),
      image_url: (fd.get("image_url") as string).trim(),
      in_stock: fd.get("in_stock") === "on",
      featured: fd.get("featured") === "on",
    };

    setLoading(true);
    await onSave(input);
    setLoading(false);
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden />

      {/* Modal — max-h + overflow-y so it scrolls on short screens */}
      <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <div className="w-full max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-md sm:rounded-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-white px-5 py-4">
            <h2 className="font-sans text-base font-semibold text-stone-900">
              {product ? "Edit Product" : "Add Product"}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-stone-500">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                name="name"
                required
                defaultValue={product?.name ?? ""}
                placeholder="e.g. Carrot & Walnut Cake"
                className="w-full rounded-lg border border-stone-200 px-3 py-2.5 font-sans text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/20"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-stone-500">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                defaultValue={product?.description ?? ""}
                placeholder="Short description shown on the menu"
                className="w-full resize-none rounded-lg border border-stone-200 px-3 py-2.5 font-sans text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/20"
              />
            </div>

            {/* Ingredients */}
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-stone-500">
                Ingredients &amp; allergens
              </label>
              <textarea
                name="ingredients"
                rows={2}
                defaultValue={product?.ingredients ?? ""}
                placeholder="e.g. Flour, butter, eggs, hazelnuts. Contains: gluten, dairy, eggs, nuts."
                className="w-full resize-none rounded-lg border border-stone-200 px-3 py-2.5 font-sans text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/20"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-stone-500">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                name="category"
                required
                defaultValue={product?.category ?? ""}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 font-sans text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/20"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-stone-500">
                Price (CAD) <span className="text-red-400">*</span>
              </label>
              <div className="relative w-1/2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-sans text-sm text-stone-400">
                  $
                </span>
                <input
                  name="price"
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  defaultValue={product ? (product.price / 100).toFixed(2) : ""}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-stone-200 py-2.5 pl-7 pr-3 font-sans text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/20"
                />
              </div>
            </div>

            {/* Photo */}
            <ImageUpload
              name="image_url"
              defaultValue={product?.image_url ?? ""}
              onUploadingChange={setUploading}
            />

            {/* In stock toggle */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                name="in_stock"
                type="checkbox"
                defaultChecked={product ? product.in_stock : true}
                className="h-4 w-4 rounded border-stone-300 accent-stone-900"
              />
              <span className="font-sans text-sm text-stone-700">Available for order</span>
            </label>

            {/* Featured toggle */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                name="featured"
                type="checkbox"
                defaultChecked={product?.featured ?? false}
                className="h-4 w-4 rounded border-stone-300 accent-stone-900"
              />
              <span className="font-sans text-sm text-stone-700">
                Feature in &ldquo;Best Sellers&rdquo; on the home page
              </span>
            </label>

            {error && (
              <p className="font-sans text-sm text-red-500">{error}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-stone-200 px-4 py-2.5 font-sans text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="rounded-lg bg-stone-900 px-4 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-60"
              >
                {uploading ? "Uploading photo…" : loading ? "Saving…" : product ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
