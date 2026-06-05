import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ProductGrid } from "@/components/shop/product-grid";
import { RecentlyViewedProducts } from "@/components/shop/recently-viewed-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants/routes";
import {
  getActiveCategories,
  getBestSellingProducts,
  queryProducts,
} from "@/lib/services/catalog.service";
import { buildPageMetadata } from "@/lib/seo";
import { getRuntimeSiteConfig } from "@/lib/services/site-settings.service";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getRuntimeSiteConfig();
  const { brand, hero } = config;

  return buildPageMetadata({
    title: brand.name,
    description: brand.description || hero.subtitle,
    urlPath: "/",
    imageUrl: hero.imageUrl ?? null,
  });
}

export default async function HomePage() {
  const config = await getRuntimeSiteConfig();
  const { hero, brand, homepage } = config;

  const [{ items: featured }, categories, bestSellers] = await Promise.all([
    homepage.showFeaturedProducts
      ? queryProducts({ featuredOnly: true, pageSize: 4 })
      : Promise.resolve({ items: [] }),
    homepage.showCategories ? getActiveCategories() : Promise.resolve([]),
    homepage.showBestSellers
      ? getBestSellingProducts(8)
      : Promise.resolve({ items: [] }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-card">
        {hero.imageUrl ? (
          <Image
            src={hero.imageUrl}
            alt=""
            fill
            className="object-cover opacity-[0.12]"
            priority
          />
        ) : (
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
            <div className="absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          </div>
        )}
        <div className="page-container relative py-16 sm:py-24 lg:py-28">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            {hero.eyebrow}
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {hero.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={hero.primaryCta.href}>
              <Button size="lg">{hero.primaryCta.label}</Button>
            </Link>
            <Link href={hero.secondaryCta.href}>
              <Button variant="outline" size="lg">
                {hero.secondaryCta.label}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {homepage.showCategories && categories.length > 0 && (
        <section className="page-container py-12 sm:py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="section-title">Categories</h2>
            <Link href={ROUTES.categories} className="section-link">
              View all
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={`${ROUTES.categories}/${cat.slug}`}
                className="group surface-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-hover"
              >
                <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                  {cat.name}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {cat._count.products} products
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {homepage.showBestSellers && bestSellers.items.length > 0 && (
        <section className="page-container pb-16 sm:pb-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="section-title">Best sellers</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Top products by order volume.
              </p>
            </div>
            <Link href={ROUTES.products} className="section-link">
              View all
            </Link>
          </div>
          <div className="mt-8">
            <ProductGrid products={bestSellers.items} />
          </div>
        </section>
      )}

      {homepage.showFeaturedProducts && featured.length > 0 && (
        <section className="page-container pb-16 sm:pb-20">
          <div className="flex items-end justify-between gap-4">
            <h2 className="section-title">Featured</h2>
            <Link href={ROUTES.products} className="section-link">
              Shop all
            </Link>
          </div>
          <div className="mt-8">
            <ProductGrid products={featured} />
          </div>
        </section>
      )}

      <div className="page-container pb-16 sm:pb-20">
        <RecentlyViewedProducts />
      </div>

      {homepage.showNewsletter && (
        <section className="border-t border-border bg-card">
          <div className="page-container max-w-xl py-14 text-center">
            <h2 className="text-xl font-bold text-foreground">Stay in the loop</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Get updates on new products and offers from {brand.name}.
            </p>
            <form className="mt-8 flex flex-col gap-3 sm:flex-row" action="#">
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="flex-1"
                disabled
              />
              <Button type="button" disabled className="sm:shrink-0">
                Coming soon
              </Button>
            </form>
          </div>
        </section>
      )}

      {featured.length === 0 &&
        categories.length === 0 &&
        bestSellers.items.length === 0 && (
          <section className="page-container py-20 text-center">
            <p className="text-muted-foreground">
              {brand.name} is ready. Add categories and products from the admin
              dashboard.
            </p>
          </section>
        )}
    </>
  );
}
