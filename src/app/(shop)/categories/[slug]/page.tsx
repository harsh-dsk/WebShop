import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CatalogToolbar } from "@/components/shop/catalog-toolbar";
import { Pagination } from "@/components/shop/pagination";
import { ProductGrid } from "@/components/shop/product-grid";
import { siteConfig } from "@/config/site";
import { buildOpenGraphMetadata } from "@/lib/seo";
import type { ProductSort } from "@/lib/services/catalog.service";
import {
  getActiveCategories,
  getCategoryBySlug,
  queryProducts,
} from "@/lib/services/catalog.service";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
    sort?: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };

  const title = `${category.name} | ${siteConfig.brand.name}`;
  const description =
    category.description ??
    `Browse ${category.name} products at ${siteConfig.brand.name}`;

  return {
    title,
    description,
    ...buildOpenGraphMetadata({
      title,
      description,
      urlPath: `/categories/${category.slug}`,
      imageUrl: category.imageUrl ?? null,
    }),
  };
}

export default async function CategoryProductsPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const sort = (sp.sort as ProductSort) || siteConfig.catalog.defaultSort;

  const [result, categories] = await Promise.all([
    queryProducts({
      page,
      categorySlug: slug,
      q: sp.q,
      sort,
    }),
    getActiveCategories(),
  ]);

  const basePath = `/categories/${slug}`;
  const filterParams = { q: sp.q, sort: sp.sort };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-primary">
        {category.name}
      </h1>
      {category.description && (
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {category.description}
        </p>
      )}
      <p className="mt-2 text-sm text-muted-foreground">
        {result.total} product{result.total !== 1 ? "s" : ""}
        {" · "}
        {category._count.products} in category
      </p>

      <div className="mt-8">
        <Suspense fallback={<div className="h-32 animate-pulse rounded-2xl bg-muted" />}>
          <CatalogToolbar
            categories={categories.map((c) => ({
              slug: c.slug,
              name: c.name,
            }))}
            basePath={basePath}
            showCategoryFilter={false}
          />
        </Suspense>
      </div>

      <div className="mt-8">
        <ProductGrid products={result.items} />
      </div>

      <div className="mt-10">
        <Pagination
          basePath={basePath}
          page={result.page}
          totalPages={result.totalPages}
          searchParams={filterParams}
        />
      </div>
    </div>
  );
}
