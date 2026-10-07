import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Award } from "lucide-react";

import { ProductGrid } from "@/components/shop/product-grid";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import {
  getActiveCategories,
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
  const { hero, brand } = config;

  // We load categories, featured, and new arrivals
  const [{ items: featured }, categories, { items: newArrivals }] = await Promise.all([
    queryProducts({ featuredOnly: true, pageSize: 4 }),
    getActiveCategories(),
    queryProducts({ sort: "newest", pageSize: 4 }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="page-container relative z-10 py-20 sm:py-32">
          <div className="max-w-3xl">
            <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-foreground text-balance sm:text-6xl lg:text-7xl">
              {hero.title || "Discover products you'll love"}
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-muted-foreground max-w-2xl">
              {hero.subtitle || "Shop the best selection of curated goods. Premium quality, modern design, and everyday essentials."}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href={ROUTES.products}>
                <Button size="lg" className="h-12 px-8 text-base">Shop All Products</Button>
              </Link>
              <Link href={ROUTES.categories}>
                <Button variant="outline" size="lg" className="h-12 px-8 text-base bg-background/50 backdrop-blur">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="page-container py-16 sm:py-24 border-t border-border/50">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Featured Products</h2>
              <p className="mt-2 text-muted-foreground">Handpicked selections for you.</p>
            </div>
            <Link href={ROUTES.products} className="text-sm font-semibold text-primary hover:underline underline-offset-4 hidden sm:block">
              Shop all &rarr;
            </Link>
          </div>
          <ProductGrid products={featured} />
          <div className="mt-8 text-center sm:hidden">
            <Link href={ROUTES.products}>
              <Button variant="outline" className="w-full">Shop all</Button>
            </Link>
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="bg-muted/30 border-y border-border/50 py-16 sm:py-24">
          <div className="page-container">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Shop by Category</h2>
                <p className="mt-2 text-muted-foreground">Explore our wide range of collections.</p>
              </div>
              <Link href={ROUTES.categories} className="text-sm font-semibold text-primary hover:underline underline-offset-4 hidden sm:block">
                View all &rarr;
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`${ROUTES.categories}/${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/20"
                >
                  <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                    {cat.imageUrl ? (
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-bold">{cat.name}</h3>
                      <p className="mt-1 text-sm text-white/80">
                        {cat._count.products} {cat._count.products === 1 ? 'product' : 'products'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="page-container py-16 sm:py-24">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">New Arrivals</h2>
              <p className="mt-2 text-muted-foreground">The latest additions to our store.</p>
            </div>
            <Link href={ROUTES.products} className="text-sm font-semibold text-primary hover:underline underline-offset-4 hidden sm:block">
              View all &rarr;
            </Link>
          </div>
          <ProductGrid products={newArrivals} />
        </section>
      )}

      <section className="border-t border-border/50 bg-background py-16 sm:py-24">
        <div className="page-container">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Secure Checkout</h3>
              <p className="mt-2 text-sm text-muted-foreground">Your payment information is processed securely with industry-standard encryption.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Fast Delivery</h3>
              <p className="mt-2 text-sm text-muted-foreground">Get your orders delivered to your doorstep quickly and reliably.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <RotateCcw className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Easy Returns</h3>
              <p className="mt-2 text-sm text-muted-foreground">Not satisfied? Return your items within 30 days for a full refund.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Quality Products</h3>
              <p className="mt-2 text-sm text-muted-foreground">We source only the best quality products for our customers.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
