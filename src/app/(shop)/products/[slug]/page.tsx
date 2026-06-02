import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { ProductGallery } from "@/components/shop/product-gallery";
import { RecentlyViewed } from "@/components/shop/recently-viewed";
import { RecentlyViewedProducts } from "@/components/shop/recently-viewed-products";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { ROUTES } from "@/lib/constants/routes";
import { buildOpenGraphMetadata } from "@/lib/seo";
import {
  getEffectiveStock,
  getRelatedProducts,
  getProductBySlug,
  parseProductImages,
} from "@/lib/services/catalog.service";
import { getCurrentUser } from "@/lib/auth";
import { getCartItemByProduct } from "@/lib/services/cart.service";
import { isInWishlist } from "@/lib/services/wishlist.service";
import type { AttributeField, ProductMetadata } from "@/types/catalog";
import { ProductGrid } from "@/components/shop/product-grid";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  const images = parseProductImages(product.images);
  const primaryImage = images[0]?.url ?? null;
  const title = product.metaTitle ?? `${product.name} | ${siteConfig.brand.name}`;
  const description =
    product.metaDescription ??
    product.shortDescription ??
    product.description?.slice(0, 160) ??
    `${product.name} at ${siteConfig.brand.name}`;

  return {
    title,
    description,
    ...buildOpenGraphMetadata({
      title,
      description,
      urlPath: `/products/${product.slug}`,
      imageUrl: primaryImage,
    }),
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
  const effectiveStock = getEffectiveStock(product);
  const outOfStock = effectiveStock <= 0;
  const tags = product.tags ?? [];
  const isLowStock =
    effectiveStock > 0 && effectiveStock <= product.lowStockThreshold;

  const user = await getCurrentUser();
  const cartItem = user
    ? await getCartItemByProduct(user.id, product.id)
    : null;
  const cartQuantity = cartItem?.quantity ?? 0;
  const isWishlisted = user
    ? await isInWishlist(user.id, product.id)
    : false;

  const related = await getRelatedProducts({
    productId: product.id,
    categoryId: product.categoryId,
    limit: 8,
  });

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
        <ProductGallery images={images} productName={product.name} />

        <div>
          <div className="flex flex-wrap gap-2">
            <Badge>{product.category.name}</Badge>
            {product.isFeatured && <Badge variant="accent">Featured</Badge>}
            {outOfStock && <Badge variant="danger">Out of stock</Badge>}
            {!outOfStock && isLowStock && <Badge variant="warning">Low stock</Badge>}
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {product.name}
          </h1>

          {product.shortDescription && (
            <p className="mt-2 text-lg text-muted-foreground">
              {product.shortDescription}
            </p>
          )}

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="muted">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

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

          <p className="mt-2 text-sm text-muted-foreground">
            {outOfStock
              ? "Currently unavailable"
              : isLowStock
                ? `Hurry — only ${effectiveStock} left`
                : `${effectiveStock} in stock`}
          </p>

          <div className="mt-4 flex flex-wrap items-start gap-3">
            <AddToCartButton
              productId={product.id}
              disabled={outOfStock}
              initialQuantity={cartQuantity}
              availableStock={effectiveStock}
            />
            <WishlistButton productId={product.id} initialActive={isWishlisted} />
          </div>

          {product.variants.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-foreground">Options</p>
              <ul className="mt-2 space-y-2">
                {product.variants.map((v) => (
                  <li
                    key={v.id}
                    className="flex justify-between rounded-xl border border-border bg-card px-4 py-2 text-sm"
                  >
                    <span>{v.name}</span>
                    <span className="text-muted-foreground">
                      {v.stock > 0 ? `${v.stock} available` : "Out of stock"}
                      {v.price && ` · ${formatPrice(Number(v.price))}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.descriptionHtml ? (
            <div
              className="prose prose-sm mt-6 max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          ) : product.description ? (
            <p className="mt-6 leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          ) : null}

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

      {related.length > 0 && (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-primary">Related products</h2>
            <Link
              href={`${ROUTES.categories}/${product.category.slug}`}
              className="text-sm font-medium text-accent hover:underline"
            >
              View category
            </Link>
          </div>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      )}

      <div className="mt-10">
        <RecentlyViewed currentSlug={product.slug} />
      </div>

      <RecentlyViewedProducts excludeSlug={product.slug} />
    </div>
  );
}
