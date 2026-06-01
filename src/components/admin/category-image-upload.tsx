"use client";

import Image from "next/image";
import { useState } from "react";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CategoryImageUploadProps = {
  defaultUrl?: string | null;
};

export function CategoryImageUpload({ defaultUrl }: CategoryImageUploadProps) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "categories");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setUrl(data.image.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Label>Category image</Label>
      {url && (
        <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-border">
          <Image src={url} alt="" fill className="object-cover" sizes="128px" />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-muted">
        <Upload className="h-4 w-4" />
        {uploading ? "Uploading…" : "Upload image"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </label>
      <Input
        name="imageUrl"
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Or paste image URL"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
