"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2 } from "lucide-react";
import { getProductUploadSignature } from "@/app/(dashboard)/admin/actions";
import { cloudinarySized, isCloudinaryUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

interface ImageUploadProps {
  /** Form field the uploaded image URL is submitted under. */
  name: string;
  defaultValue: string;
  /** Lets the form block saving while an upload is in progress. */
  onUploadingChange?: (uploading: boolean) => void;
}

/** Product photo picker: click or drop a photo; it uploads straight to Cloudinary. */
export default function ImageUpload({ name, defaultValue, onUploadingChange }: ImageUploadProps) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setBusy(busy: boolean) {
    setUploading(busy);
    onUploadingChange?.(busy);
  }

  async function upload(file: File) {
    setError(null);
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Please choose a JPG, PNG, WebP or AVIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That photo is over 10 MB. Please choose a smaller one.");
      return;
    }

    setBusy(true);
    try {
      const result = await getProductUploadSignature();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      const { uploadUrl, apiKey, timestamp, signature, folder, allowedFormats } = result.signature;

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", apiKey);
      body.append("timestamp", String(timestamp));
      body.append("signature", signature);
      body.append("folder", folder);
      body.append("allowed_formats", allowedFormats);

      const res = await fetch(uploadUrl, { method: "POST", body });
      const data: { secure_url?: string; error?: { message?: string } } = await res.json();
      if (!res.ok || !data.secure_url) {
        setError(data.error?.message ?? "Upload failed. Please try again.");
        return;
      }
      setUrl(data.secure_url);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again after an error
    if (file) void upload(file);
  }

  function handleDrop(e: React.DragEvent<HTMLElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && !uploading) void upload(file);
  }

  const dropProps = {
    onDragOver: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: handleDrop,
  };

  // Same 4:3 shape as the storefront cards, so the preview matches what customers see.
  const preview = url && isCloudinaryUrl(url) ? cloudinarySized(url, 800, 600) : url;

  return (
    <div className="space-y-1.5">
      <span className="block font-sans text-xs font-semibold uppercase tracking-wide text-stone-500">
        Photo
      </span>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div
          {...dropProps}
          className={cn(
            "relative aspect-4/3 w-full overflow-hidden rounded-xl bg-stone-100",
            dragging && "ring-2 ring-stone-900"
          )}
        >
          <Image
            src={preview}
            alt="Product photo"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 448px"
            unoptimized={isCloudinaryUrl(url)}
          />
          {!uploading && (
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-linear-to-t from-black/50 to-transparent p-3">
              <label className="cursor-pointer rounded-lg bg-white/95 px-3 py-1.5 font-sans text-xs font-semibold text-stone-800 shadow-sm transition-colors hover:bg-white">
                Replace
                <input type="file" accept={ACCEPT} onChange={handleFile} className="sr-only" />
              </label>
              <button
                type="button"
                onClick={() => setUrl("")}
                className="rounded-lg bg-white/95 px-3 py-1.5 font-sans text-xs font-semibold text-red-600 shadow-sm transition-colors hover:bg-white"
              >
                Remove
              </button>
            </div>
          )}
          {uploading && <UploadingOverlay />}
        </div>
      ) : (
        <label
          {...dropProps}
          className={cn(
            "relative flex aspect-4/3 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 text-center transition-colors",
            dragging ? "border-stone-900 bg-stone-50" : "border-stone-200 hover:border-stone-400",
            uploading ? "pointer-events-none" : "cursor-pointer"
          )}
        >
          <ImagePlus size={28} strokeWidth={1.5} className="text-stone-400" />
          <span className="font-sans text-sm font-semibold text-stone-700">
            Click to upload or drag a photo here
          </span>
          <span className="font-sans text-xs text-stone-400">JPG, PNG, WebP or AVIF · up to 10 MB</span>
          <input type="file" accept={ACCEPT} onChange={handleFile} className="sr-only" />
          {uploading && <UploadingOverlay />}
        </label>
      )}

      {error ? (
        <p className="font-sans text-xs text-red-500">{error}</p>
      ) : (
        !url && (
          <p className="font-sans text-xs text-stone-400">
            Without a photo, the product shows its category photo.
          </p>
        )
      )}
    </div>
  );
}

function UploadingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 font-sans text-sm font-semibold text-stone-700">
      <Loader2 size={24} className="animate-spin" />
      Uploading…
    </div>
  );
}
