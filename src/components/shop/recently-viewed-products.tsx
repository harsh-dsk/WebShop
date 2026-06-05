"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants/routes";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getRecentlyViewed } from "@/components/shop/recently-viewed";

type RecentlyViewedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  lowStockThreshold: number;
  isFeatured: boolean;
  images: unknown;
  category: { name: string };
  variants?: { stock: number; isActive: boolean }[];
};

function parsePrimaryImage(images: unknown): string | null {
  if (!Array.isArray(images) || images.length === 0) return null;
  const first = images[0] as any;
  return typeof first?.url === "string" ? first.url : null;
}

function effectiveStock(p: RecentlyViewedProduct): number {
  if (p.variants && p.variants.length > 0) {
    return p.variants.filter((v) => v.isActive).reduce((sum, v) => sum + v.stock, 0);
  }
  return p.stock;
}

type Props = {
  className?: string;
  title?: string;
  excludeSlug?: string;
};

export function RecentlyViewedProducts({ className, title = "Recently viewed", excludeSlug }: Props) {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const slugs = useMemo(() => {
    const list = getRecentlyViewed();
    return excludeSlug ? list.filter((s) => s !== excludeSlug) : list;
  }, [excludeSlug]);

  useEffect(() => {
    const list = slugs.slice(0, 8);
    if (list.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(
          `/api/recently-viewed?slugs=${encodeURIComponent(list.join(","))}`,
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { products: RecentlyViewedProduct[] };
        setProducts(data.products ?? []);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [slugs]);

  if (!loading && products.length === 0) return null;

  return (
    <section className={cn("mt-14", className)}>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
        <Link href={ROUTES.products} className="text-sm font-medium text-accent hover:underline">
          Shop all
        </Link>
      </div>
      {loading ? (
        <div className="mt-6">
          <ProductGridSkeleton count={4} />
        </div>
      ) : (
      <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => {
          const stock = effectiveStock(p);
          const out = stock <= 0;
          const low = stock > 0 && stock <= p.lowStockThreshold;
          const img = parsePrimaryImage(p.images);
          const compareAt = p.compareAtPrice;

          return (
            <Link
              key={p.id}
              href={`${ROUTES.products}/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                {img ? (
                  <Image
                    src={img}
                    alt={p.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
                )}
                {out && (
                  <Badge variant="danger" className="absolute right-3 top-3">
                    Out of stock
                  </Badge>
                )}
                {!out && low && (
                  <Badge variant="warning" className="absolute right-3 top-3">
                    Low stock
                  </Badge>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {p.category.name}
                </p>
                <h3 className="mt-1 line-clamp-2 font-semibold text-foreground group-hover:text-primary">
                  {p.name}
                </h3>
                <div className="mt-auto flex items-baseline gap-2 pt-3">
                  <span className="text-lg font-bold text-primary">{formatPrice(p.price)}</span>
                  {compareAt && compareAt > p.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(compareAt)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      )}
    </section>
  );
}

