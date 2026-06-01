import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { ROUTES } from "@/lib/constants/routes";
import {
  getProductBySlug,
  parseProductImages,
} from "@/lib/services/catalog.service";
import type { AttributeField, ProductMetadata } from "@/types/catalog";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description:
      product.description?.slice(0, 160) ?? `${product.name} at ${siteConfig.brand.name}`,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const images = parseProductImages(product.images);
  const schema = product.category.attributeSchema as AttributeField[];
  const metadata = product.metadata as ProductMetadata;
  const price = Number(product.price);
  const compareAt = product.compareAtPrice
    ? Number(product.compareAtPrice)
    : null;
  const outOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href={ROUTES.products} className="hover:text-primary">
          Products
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`${ROUTES.categories}/${product.category.slug}`}
          className="hover:text-primary"
        >
          {product.category.name}
        </Link>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
            {images[0] ? (
              <Image
                src={images[0].url}
                alt={images[0].alt ?? product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((img) => (
                <div
                  key={img.publicId}
                  className="relative aspect-square overflow-hidden rounded-xl border border-border"
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? ""}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            <Badge>{product.category.name}</Badge>
            {product.isFeatured && <Badge variant="accent">Featured</Badge>}
            {outOfStock && <Badge variant="danger">Out of stock</Badge>}
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(price)}
            </span>
            {compareAt && compareAt > price && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(compareAt)}
              </span>
            )}
          </div>

          {product.sku && (
            <p className="mt-2 text-sm text-muted-foreground">
              SKU: {product.sku}
            </p>
          )}

          {!outOfStock && (
            <p className="mt-2 text-sm text-muted-foreground">
              {product.stock} in stock
            </p>
          )}

          {product.description && (
            <p className="mt-6 leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {schema.length > 0 && Object.keys(metadata).length > 0 && (
            <dl className="mt-8 space-y-3 rounded-2xl border border-border bg-card p-6">
              <dt className="text-sm font-semibold text-foreground">Details</dt>
              {schema.map((field) => {
                const value = metadata[field.key];
                if (value === undefined || value === "") return null;
                return (
                  <div
                    key={field.key}
                    className="flex justify-between gap-4 border-t border-border pt-3 text-sm"
                  >
                    <dt className="text-muted-foreground">{field.label}</dt>
                    <dd className="font-medium">{String(value)}</dd>
                  </div>
                );
              })}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
