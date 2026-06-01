"use client";

import { useActionState, useMemo, useState } from "react";

import { createProduct, updateProduct, type ActionState } from "@/actions/products";
import { ImageUpload } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AttributeField, ProductImage } from "@/types/catalog";
import { parseProductImages } from "@/lib/services/catalog.service";

type CategoryOption = {
  id: string;
  name: string;
  attributeSchema: unknown;
};

type ProductFormProps = {
  categories: CategoryOption[];
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: { toString(): string };
    compareAtPrice: { toString(): string } | null;
    sku: string | null;
    stock: number;
    lowStockThreshold: number;
    categoryId: string;
    isActive: boolean;
    isFeatured: boolean;
    images: unknown;
    metadata: unknown;
  };
};

const initialState: ActionState = {};

export function ProductForm({ categories, product }: ProductFormProps) {
  const action = product
    ? updateProduct.bind(null, product.id)
    : createProduct;

  const [state, formAction, pending] = useActionState(action, initialState);
  const [categoryId, setCategoryId] = useState(
    product?.categoryId ?? categories[0]?.id ?? "",
  );
  const [images, setImages] = useState<ProductImage[]>(
    product ? parseProductImages(product.images) : [],
  );

  const attributeSchema = useMemo(() => {
    const cat = categories.find((c) => c.id === categoryId);
    return (cat?.attributeSchema ?? []) as AttributeField[];
  }, [categories, categoryId]);

  const metadata = (product?.metadata ?? {}) as Record<string, unknown>;

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={product?.name}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={product?.slug}
            placeholder="auto-generated if empty"
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="categoryId">Category *</Label>
        <select
          id="categoryId"
          name="categoryId"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1.5 flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description ?? ""}
          className="mt-1.5"
          rows={5}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price.toString()}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="compareAtPrice">Compare at price</Label>
          <Input
            id="compareAtPrice"
            name="compareAtPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.compareAtPrice?.toString() ?? ""}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            defaultValue={product?.stock ?? 0}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="lowStockThreshold">Low stock alert</Label>
          <Input
            id="lowStockThreshold"
            name="lowStockThreshold"
            type="number"
            min="0"
            defaultValue={product?.lowStockThreshold ?? 5}
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="sku">SKU</Label>
        <Input
          id="sku"
          name="sku"
          defaultValue={product?.sku ?? ""}
          className="mt-1.5 max-w-xs"
        />
      </div>

      {attributeSchema.length > 0 && (
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm font-medium">Category attributes</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {attributeSchema.map((field) => (
              <div key={field.key}>
                <Label htmlFor={`meta-${field.key}`}>
                  {field.label}
                  {field.required && " *"}
                </Label>
                {field.type === "select" && field.options ? (
                  <select
                    id={`meta-${field.key}`}
                    name={`metadata.${field.key}`}
                    defaultValue={String(metadata[field.key] ?? "")}
                    required={field.required}
                    className="mt-1.5 flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm"
                  >
                    <option value="">—</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={`meta-${field.key}`}
                    name={`metadata.${field.key}`}
                    type={field.type === "number" ? "number" : "text"}
                    defaultValue={String(metadata[field.key] ?? "")}
                    required={field.required}
                    className="mt-1.5"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product?.isActive ?? true}
            className="h-4 w-4 rounded"
          />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={product?.isFeatured ?? false}
            className="h-4 w-4 rounded"
          />
          Featured
        </label>
      </div>

      <div>
        <Label>Images</Label>
        <div className="mt-1.5">
          <ImageUpload
            value={images}
            onChange={setImages}
            productId={product?.id}
          />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : product ? "Update product" : "Create product"}
      </Button>
    </form>
  );
}
