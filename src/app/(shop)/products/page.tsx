import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogToolbar } from "@/components/shop/catalog-toolbar";
import { Pagination } from "@/components/shop/pagination";
import { ProductGrid } from "@/components/shop/product-grid";
import { siteConfig } from "@/config/site";
import { buildOpenGraphMetadata } from "@/lib/seo";
import type { ProductSort } from "@/lib/services/catalog.service";
import {
  getActiveCategories,
  queryProducts,
} from "@/lib/services/catalog.service";

export const metadata: Metadata = {
  title: `Products | ${siteConfig.brand.name}`,
  description: `Browse all products at ${siteConfig.brand.name}`,
  ...buildOpenGraphMetadata({
    title: `Products | ${siteConfig.brand.name}`,
    description: `Browse all products at ${siteConfig.brand.name}`,
    urlPath: "/products",
  }),
};

type SearchParams = Promise<{
  page?: string;
  q?: string;
  category?: string;
  sort?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const sort = (params.sort as ProductSort) || siteConfig.catalog.defaultSort;

  const [result, categories] = await Promise.all([
    queryProducts({
      page,
      q: params.q,
      categorySlug: params.category,
      sort,
    }),
    getActiveCategories(),
  ]);

  const filterParams = {
    q: params.q,
    category: params.category,
    sort: params.sort,
  };

  return (
    <div className="page-container py-10 sm:py-12">
      <header className="page-header">
        <h1 className="page-title">All products</h1>
        <p className="page-description">
          {result.total} product{result.total !== 1 ? "s" : ""} found
        </p>
      </header>

      <div className="mt-8">
        <Suspense fallback={<div className="skeleton h-36 w-full" />}>
          <CatalogToolbar
            categories={categories.map((c) => ({
              slug: c.slug,
              name: c.name,
            }))}
            basePath="/products"
          />
        </Suspense>
      </div>

      <div className="mt-8">
        {result.items.length === 0 ? (
          <div className="empty-state">
            <p className="font-medium text-foreground">No products found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <ProductGrid products={result.items} />
        )}
      </div>

      {result.totalPages > 1 && (
        <div className="mt-10">
          <Pagination
            basePath="/products"
            page={result.page}
            totalPages={result.totalPages}
            searchParams={filterParams}
          />
        </div>
      )}
    </div>
  );
}
