import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { ROUTES } from "@/lib/constants/routes";
import { getActiveCategories } from "@/lib/services/catalog.service";

export const metadata: Metadata = {
  title: "Categories",
  description: `Shop by category at ${siteConfig.brand.name}`,
};

export default async function CategoriesPage() {
  const categories = await getActiveCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-primary">
        Categories
      </h1>
      <p className="mt-2 text-muted-foreground">
        Browse products by category
      </p>

      {categories.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">
          No categories yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`${ROUTES.categories}/${cat.slug}`}
              className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-foreground group-hover:text-primary">
                {cat.name}
              </h2>
              {cat.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {cat.description}
                </p>
              )}
              <p className="mt-4 text-sm font-medium text-accent">
                {cat._count.products} products →
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
