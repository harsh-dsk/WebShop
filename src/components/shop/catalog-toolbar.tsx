"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductSort } from "@/lib/services/catalog.service";

type CategoryOption = { slug: string; name: string };

type CatalogToolbarProps = {
  categories: CategoryOption[];
  basePath: string;
  showCategoryFilter?: boolean;
};

export function CatalogToolbar({
  categories,
  basePath,
  showCategoryFilter = true,
}: CatalogToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = (searchParams.get("sort") as ProductSort) ?? "newest";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${basePath}?${params.toString()}`);
      });
    },
    [basePath, router, searchParams],
  );

  return (
    <form
      className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        updateParams({ q: String(form.get("q") || "") });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Label htmlFor="q">Search</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Search products..."
              disabled={isPending}
            />
            <Button type="submit" disabled={isPending}>
              Search
            </Button>
            {(q || category || sort !== "newest") && (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  startTransition(() => router.push(basePath));
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {showCategoryFilter && (
          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              defaultValue={category}
              disabled={isPending}
              onChange={(e) => {
                const slug = e.target.value;
                if (slug && basePath.startsWith("/categories/")) {
                  router.push(`/categories/${slug}`);
                  return;
                }
                updateParams({ category: slug || null });
              }}
              className="mt-1.5 flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <Label htmlFor="sort">Sort by</Label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            disabled={isPending}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="mt-1.5 flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
    </form>
  );
}
