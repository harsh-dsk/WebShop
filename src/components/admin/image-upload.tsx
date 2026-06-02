"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Upload, X } from "lucide-react";

import type { ProductImage } from "@/types/catalog";

type ImageUploadProps = {
  value: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  productId?: string;
  label?: string;
};

export function ImageUpload({
  value,
  onChange,
  productId,
  label = "Product images",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    if (productId) formData.append("productId", productId);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange([...value, data.image]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...value];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-foreground">{label}</p>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((img, index) => (
            <div
              key={img.publicId}
              className="relative overflow-hidden rounded-xl border border-border bg-muted"
            >
              <div className="relative h-28 w-28">
                <Image
                  src={img.url}
                  alt={img.alt ?? ""}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    Main
                  </span>
                )}
              </div>
              <div className="flex border-t border-border bg-card">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="flex flex-1 items-center justify-center py-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                  aria-label="Move left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  className="flex flex-1 items-center justify-center py-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                  aria-label="Move right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange(value.filter((i) => i.publicId !== img.publicId))
                  }
                  className="flex flex-1 items-center justify-center py-1 text-red-600 hover:bg-red-50"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 transition hover:border-primary/40 hover:bg-muted/40">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <span className="mt-2 text-sm font-medium">
          {uploading ? "Uploading…" : "Upload image"}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          JPEG, PNG, WebP — max 5MB. First image is the main thumbnail.
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
