"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/catalog";

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
  className?: string;
};

export function ProductGallery({ images, productName, className }: ProductGalleryProps) {
  const safeImages = useMemo(() => images.filter((i) => i?.url), [images]);
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const current = safeImages[active];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
        {current ? (
          <>
            <Image
              src={current.url}
              alt={current.alt ?? productName}
              fill
              className={cn("object-cover", zoomOpen && "scale-110")}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute right-3 top-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setZoomOpen((v) => !v)}
                aria-pressed={zoomOpen}
              >
                <ZoomIn className="mr-2 h-4 w-4" aria-hidden />
                {zoomOpen ? "Reset" : "Zoom"}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {safeImages.slice(0, 12).map((img, idx) => (
            <button
              key={img.publicId}
              type="button"
              onClick={() => {
                setActive(idx);
                setZoomOpen(false);
              }}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border bg-muted",
                idx === active ? "border-primary" : "border-border hover:border-primary/40",
              )}
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? ""}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

