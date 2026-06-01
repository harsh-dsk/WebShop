"use client";

import Image from "next/image";
import { useState } from "react";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProductImage } from "@/types/catalog";

type ImageUploadProps = {
  value: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  productId?: string;
};

export function ImageUpload({ value, onChange, productId }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    if (productId) formData.append("productId", productId);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange([...value, data.image]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {value.map((img) => (
          <div
            key={img.publicId}
            className="relative h-24 w-24 overflow-hidden rounded-xl border border-border"
          >
            <Image
              src={img.url}
              alt={img.alt ?? ""}
              fill
              className="object-cover"
              sizes="96px"
            />
            <button
              type="button"
              onClick={() =>
                onChange(value.filter((i) => i.publicId !== img.publicId))
              }
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-8 transition hover:bg-muted/50">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <span className="mt-2 text-sm font-medium">
          {uploading ? "Uploading…" : "Upload product image"}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          JPEG, PNG, WebP — max 5MB
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
      <input type="hidden" name="images" value={JSON.stringify(value)} readOnly />
    </div>
  );
}
