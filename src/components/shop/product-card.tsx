import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { ROUTES } from "@/lib/constants/routes";
import {
  getPrimaryImage,
  parseProductImages,
} from "@/lib/services/catalog.service";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: { toString(): string } | number;
    compareAtPrice?: { toString(): string } | number | null;
    stock: number;
    isFeatured: boolean;
    images: unknown;
    category: { name: string };
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const images = parseProductImages(product.images);
  const primary = getPrimaryImage(images) ?? images[0];
  const price = Number(product.price);
  const compareAt = product.compareAtPrice
    ? Number(product.compareAtPrice)
    : null;
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`${ROUTES.products}/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {primary ? (
          <Image
            src={primary.url}
            alt={primary.alt ?? product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        {product.isFeatured && (
          <Badge variant="accent" className="absolute left-3 top-3">
            Featured
          </Badge>
        )}
        {outOfStock && (
          <Badge variant="danger" className="absolute right-3 top-3">
            Out of stock
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {product.category.name}
        </p>
        <h3 className="mt-1 line-clamp-2 font-semibold text-foreground group-hover:text-primary">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-lg font-bold text-primary">
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
