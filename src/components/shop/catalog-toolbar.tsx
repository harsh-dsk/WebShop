"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
      className="surface-card p-4 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        updateParams({ q: String(form.get("q") || "") });
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Search" htmlFor="q" className="sm:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Search products..."
              disabled={isPending}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
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
        </FormField>

        {showCategoryFilter && (
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
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
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="sort">Sort by</Label>
          <Select
            id="sort"
            name="sort"
            defaultValue={sort}
            disabled={isPending}
            onChange={(e) => updateParams({ sort: e.target.value })}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
            <option value="name">Name</option>
          </Select>
        </div>
      </div>
      {isPending && (
        <p className="mt-3 text-xs text-muted-foreground" role="status">
          Updating results…
        </p>
      )}
    </form>
  );
}
