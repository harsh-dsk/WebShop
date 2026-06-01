import Link from "next/link";

import { ProductGrid } from "@/components/shop/product-grid";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/lib/constants/routes";
import { queryProducts, getActiveCategories } from "@/lib/services/catalog.service";

export default async function HomePage() {
  const { hero, brand } = siteConfig;

  const [{ items: featured }, categories] = await Promise.all([
    queryProducts({ featuredOnly: true, pageSize: 4 }),
    getActiveCategories(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">
            {hero.eyebrow}
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            {hero.title}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            {hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
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

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-primary">Categories</h2>
            <Link
              href={ROUTES.categories}
              className="text-sm font-medium text-accent hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={`${ROUTES.categories}/${cat.slug}`}
                className="rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="font-semibold text-foreground">{cat.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cat._count.products} products
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-primary">Featured</h2>
            <Link
              href={ROUTES.products}
              className="text-sm font-medium text-accent hover:underline"
            >
              Shop all
            </Link>
          </div>
          <div className="mt-6">
            <ProductGrid products={featured} />
          </div>
        </section>
      )}

      {featured.length === 0 && categories.length === 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <p className="text-muted-foreground">
            {brand.name} is ready. Add categories and products from the admin
            dashboard.
          </p>
        </section>
      )}
    </>
  );
}
