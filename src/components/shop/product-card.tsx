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
import { ProductCardActions } from "./product-card-actions";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription?: string | null;
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
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted/30 flex items-center justify-center p-4">
        {primary ? (
          <Image
            src={primary.url}
            alt={primary.alt ?? product.name}
            fill
            className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        
        {/* Absolute Badges */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 pointer-events-none z-10">
          <div className="flex flex-col gap-1.5">
            {product.isFeatured && (
              <Badge variant="accent" className="shadow-sm">Featured</Badge>
            )}
            {compareAt && compareAt > price && (
              <Badge variant="default" className="shadow-sm bg-background/90 text-primary ring-primary/20">Sale</Badge>
            )}
          </div>
          <div className="ml-auto flex flex-col gap-1.5">
            {outOfStock && <Badge variant="danger" className="shadow-sm">Out of stock</Badge>}
            {!outOfStock && isLowStock && (
              <Badge variant="warning" className="shadow-sm">Low stock</Badge>
            )}
          </div>
        </div>
        
        <ProductCardActions productId={product.id} availableStock={effectiveStock} />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5 bg-background">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80 mb-1">
          {product.category.name}
        </p>
        <h3 className="line-clamp-1 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        {product.shortDescription && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
            {product.shortDescription}
          </p>
        )}
        <div className="mt-auto flex items-end gap-2 pt-4">
          <span className="text-lg font-bold tracking-tight text-foreground">
            {formatPrice(price)}
          </span>
          {compareAt && compareAt > price && (
            <span className="text-sm font-medium text-muted-foreground/60 line-through mb-[2px]">
              {formatPrice(compareAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
