import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { ROUTES } from "@/lib/constants/routes";
import {
  getEffectiveStock,
  getPrimaryImage,
  parseProductImages,
} from "@/lib/catalog.utils";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: { toString(): string } | number;
    compareAtPrice?: { toString(): string } | number | null;
    stock: number;
    lowStockThreshold?: number;
    isFeatured: boolean;
    images: unknown;
    category: { name: string };
    variants?: { stock: number; isActive: boolean }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const images = parseProductImages(product.images);
  const primary = getPrimaryImage(images) ?? images[0];
  const price = Number(product.price);
  const compareAt = product.compareAtPrice
    ? Number(product.compareAtPrice)
    : null;
  const effectiveStock = getEffectiveStock(product);
  const outOfStock = effectiveStock <= 0;
  const isLowStock =
    product.lowStockThreshold != null &&
    effectiveStock > 0 &&
    effectiveStock <= product.lowStockThreshold;

  return (
    <Link
      href={`${ROUTES.products}/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {primary ? (
          <Image
            src={primary.url}
            alt={primary.alt ?? product.name}
            fill
            className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          {product.isFeatured && (
            <Badge variant="accent">Featured</Badge>
          )}
          <div className="ml-auto flex flex-col gap-1.5">
            {outOfStock && <Badge variant="danger">Out of stock</Badge>}
            {!outOfStock && isLowStock && (
              <Badge variant="warning">Low stock</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {product.category.name}
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-base">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-4">
          <span className="text-lg font-bold tracking-tight text-foreground">
            {formatPrice(price)}
          </span>
          {compareAt && compareAt > price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(compareAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
