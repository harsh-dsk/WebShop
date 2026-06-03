"use client";

import Image from "next/image";
import { useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MediaUploadFieldProps = {
  label: string;
  name: string;
  value: string | null;
  folder?: string;
  hint?: string;
};

export function MediaUploadField({
  label,
  name,
  value,
  folder = "branding",
  hint,
}: MediaUploadFieldProps) {
  const [url, setUrl] = useState(value ?? "");
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setUrl(data.image.url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <input type="hidden" name={name} value={url} readOnly />

      {url ? (
        <div className="flex items-start gap-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-muted">
            <Image src={url} alt="" fill className="object-cover" sizes="96px" />
          </div>
          <div className="flex flex-col gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Image URL"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUrl("")}
            >
              <X className="mr-1 h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 transition hover:bg-muted/50">
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <span className="text-sm font-medium">
            {uploading ? "Uploading…" : "Click to upload"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </label>
      )}
    </div>
  );
}
