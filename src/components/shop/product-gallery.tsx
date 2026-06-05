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
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(() => new Set());

  const visibleImages = useMemo(
    () => safeImages.filter((img) => !brokenUrls.has(img.url)),
    [safeImages, brokenUrls],
  );

  const current = visibleImages[active];

  function markBroken(url: string) {
    setBrokenUrls((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-xl border border-border bg-muted shadow-card",
          zoomOpen && "ring-2 ring-primary/20",
        )}
      >
        {current ? (
          <>
            <Image
              src={current.url}
              alt={current.alt ?? productName}
              fill
              className={cn(
                "object-cover transition-transform duration-500 ease-smooth",
                zoomOpen && "scale-110 cursor-zoom-out",
              )}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              onError={() => markBroken(current.url)}
            />
            <div className="absolute right-3 top-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-card/95 backdrop-blur-sm"
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

      {visibleImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
          {visibleImages.slice(0, 12).map((img, idx) => (
            <button
              key={img.publicId}
              type="button"
              onClick={() => {
                setActive(idx);
                setZoomOpen(false);
              }}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-all duration-200",
                idx === active
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-primary/30",
              )}
              aria-label={`View image ${idx + 1}`}
              aria-current={idx === active}
            >
              <Image
                src={img.url}
                alt={img.alt ?? ""}
                fill
                className="object-cover"
                sizes="96px"
                onError={() => markBroken(img.url)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
