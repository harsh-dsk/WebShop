"use client";

import { useActionState, useMemo, useState } from "react";

import { createProduct, updateProduct, type ActionState } from "@/actions/products";
import { FormSection } from "@/components/admin/form-section";
import { ImageUpload } from "@/components/admin/image-upload";
import { VariantsEditor } from "@/components/admin/variants-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { parseProductImages } from "@/lib/services/catalog.service";
import type { AttributeField, ProductImage, ProductVariantInput } from "@/types/catalog";

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
    shortDescription: string | null;
    description: string | null;
    descriptionHtml: string | null;
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
    tags: string[];
    metaTitle: string | null;
    metaDescription: string | null;
    variants?: Array<{
      id: string;
      name: string;
      sku: string | null;
      price: { toString(): string } | null;
      stock: number;
      attributes: unknown;
      isActive: boolean;
      sortOrder: number;
    }>;
  };
};

const TABS = [
  { id: "general", label: "General" },
  { id: "media", label: "Images" },
  { id: "variants", label: "Variants" },
  { id: "attributes", label: "Attributes" },
  { id: "seo", label: "SEO" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const initialState: ActionState = {};

export function ProductForm({ categories, product }: ProductFormProps) {
  const action = product
    ? updateProduct.bind(null, product.id)
    : createProduct;

  const [state, formAction, pending] = useActionState(action, initialState);
  const [tab, setTab] = useState<TabId>("general");
  const [categoryId, setCategoryId] = useState(
    product?.categoryId ?? categories[0]?.id ?? "",
  );
  const [images, setImages] = useState<ProductImage[]>(
    product ? parseProductImages(product.images) : [],
  );
  const [variants, setVariants] = useState<ProductVariantInput[]>(
    product?.variants?.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price ? Number(v.price) : null,
      stock: v.stock,
      attributes: (v.attributes ?? {}) as Record<string, string>,
      isActive: v.isActive,
      sortOrder: v.sortOrder,
    })) ?? [],
  );

  const attributeSchema = useMemo(() => {
    const cat = categories.find((c) => c.id === categoryId);
    return (cat?.attributeSchema ?? []) as AttributeField[];
  }, [categories, categoryId]);

  const metadata = (product?.metadata ?? {}) as Record<string, unknown>;
  const tagsDefault = product?.tags?.join(", ") ?? "";

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition",
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <FormSection title="Product details">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required defaultValue={product?.name} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="slug">URL slug</Label>
              <Input id="slug" name="slug" defaultValue={product?.slug} placeholder="auto-generated" className="mt-1.5" />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="categoryId">Category *</Label>
            <select
  id="categoryId"
  required
  value={categoryId}
  onChange={(e) => setCategoryId(e.target.value)}
  className="mt-1.5 flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm"
>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <Label htmlFor="shortDescription">Short description</Label>
            <Textarea id="shortDescription" name="shortDescription" rows={2} maxLength={500} defaultValue={product?.shortDescription ?? ""} className="mt-1.5" placeholder="Shown on listing cards" />
          </div>

          <div className="mt-4">
            <Label htmlFor="description">Plain description</Label>
            <Textarea id="description" name="description" rows={4} defaultValue={product?.description ?? ""} className="mt-1.5" />
          </div>

          <div className="mt-4">
            <Label htmlFor="descriptionHtml">Rich description (HTML)</Label>
            <Textarea id="descriptionHtml" name="descriptionHtml" rows={8} defaultValue={product?.descriptionHtml ?? ""} className="mt-1.5 font-mono text-xs" placeholder="<p>Detailed product information</p>" />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="price">Base price *</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={product?.price.toString()} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="compareAtPrice">Compare at</Label>
              <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" min="0" defaultValue={product?.compareAtPrice?.toString() ?? ""} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="stock">Stock {variants.length > 0 && "(auto from variants)"}</Label>
             <Input
  id="stock"
  name="stock"
  type="number"
  min="0"
  defaultValue={product?.stock ?? 0}
  disabled={variants.length > 0}
  className="mt-1.5"
/>

{variants.length > 0 && (
  <input
    type="hidden"
    name="stock"
    value={String(product?.stock ?? 0)}
  />
)}
            </div>
            <div>
              <Label htmlFor="lowStockThreshold">Low stock alert</Label>
              <Input id="lowStockThreshold" name="lowStockThreshold" type="number" min="0" defaultValue={product?.lowStockThreshold ?? 5} className="mt-1.5" />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" defaultValue={tagsDefault} placeholder="sale, new, bestseller" className="mt-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">Comma-separated</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} className="h-4 w-4 rounded" />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured ?? false} className="h-4 w-4 rounded" />
              Featured on homepage
            </label>
          </div>
        </FormSection>
      )}

      {tab === "media" && (
        <FormSection title="Product images" description="Upload multiple images. Drag order with arrows — first image is the thumbnail.">
          <ImageUpload value={images} onChange={setImages} productId={product?.id} />
        </FormSection>
      )}

      {tab === "variants" && (
        <FormSection title="Variants" description="For fashion, electronics, furniture, or any product with options.">
          <VariantsEditor value={variants} onChange={setVariants} />
        </FormSection>
      )}

      {tab === "attributes" && (
        <FormSection
          title="Category attributes"
          description={attributeSchema.length === 0 ? "Define an attribute schema on the category to enable custom fields." : undefined}
        >
          {attributeSchema.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attribute schema for this category.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {attributeSchema.map((field) => (
                <div key={field.key}>
                  <Label htmlFor={`meta-${field.key}`}>{field.label}{field.required && " *"}</Label>
                  {field.type === "select" && field.options ? (
                    <select id={`meta-${field.key}`} name={`metadata.${field.key}`} defaultValue={String(metadata[field.key] ?? "")} required={field.required} className="mt-1.5 flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm">
                      <option value="">—</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <Input id={`meta-${field.key}`} name={`metadata.${field.key}`} type={field.type === "number" ? "number" : "text"} defaultValue={String(metadata[field.key] ?? "")} required={field.required} className="mt-1.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </FormSection>
      )}

      {tab === "seo" && (
        <FormSection title="Search engine optimization">
          <div className="space-y-4">
            <div>
              <Label htmlFor="metaTitle">Meta title</Label>
              <Input id="metaTitle" name="metaTitle" maxLength={70} defaultValue={product?.metaTitle ?? ""} className="mt-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">Max 70 characters</p>
            </div>
            <div>
              <Label htmlFor="metaDescription">Meta description</Label>
              <Textarea id="metaDescription" name="metaDescription" maxLength={160} rows={3} defaultValue={product?.metaDescription ?? ""} className="mt-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">Max 160 characters</p>
            </div>
          </div>
        </FormSection>
      )}

      <input
  type="hidden"
  name="categoryId"
  value={categoryId}
/>

<input
  type="hidden"
  name="images"
  value={JSON.stringify(images)}
  readOnly
/>

<input
  type="hidden"
  name="variants"
  value={JSON.stringify(variants)}
  readOnly
/>

      <div className="flex gap-3 border-t border-border pt-6">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : product ? "Save product" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
