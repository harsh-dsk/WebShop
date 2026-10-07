import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { siteConfig } from "@/config/site";
import { ROUTES } from "@/lib/constants/routes";
import { buildOpenGraphMetadata } from "@/lib/seo";
import { getActiveCategories } from "@/lib/services/catalog.service";

export const metadata: Metadata = {
  title: `Categories | ${siteConfig.brand.name}`,
  description: `Shop by category at ${siteConfig.brand.name}`,
  ...buildOpenGraphMetadata({
    title: `Categories | ${siteConfig.brand.name}`,
    description: `Shop by category at ${siteConfig.brand.name}`,
    urlPath: "/categories",
  }),
};

export default async function CategoriesPage() {
  const categories = await getActiveCategories();

  return (
    <div className="page-container py-10 sm:py-16">
      <header className="page-header mb-12">
        <h1 className="page-title text-4xl sm:text-5xl font-extrabold tracking-tight">
          All Categories
        </h1>
        <p className="page-description text-lg mt-4">
          Browse our collection of premium products by category.
        </p>
      </header>

      {categories.length === 0 ? (
        <div className="empty-state">
          <p className="font-medium text-foreground">No categories yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">{cat.name}</h3>
                      {cat.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-white/80">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-primary-foreground/90 flex items-center gap-2">
                    {cat._count.products} {cat._count.products === 1 ? 'product' : 'products'}
                    <span className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                      &rarr;
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
