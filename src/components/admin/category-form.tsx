"use client";

import { useActionState } from "react";

import {
  createCategory,
  updateCategory,
  type ActionState,
} from "@/actions/categories";
import { CategoryImageUpload } from "@/components/admin/category-image-upload";
import { FormSection } from "@/components/admin/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AttributeField } from "@/types/catalog";

type CategoryFormProps = {
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    sortOrder: number;
    isActive: boolean;
    attributeSchema: unknown;
  };
};

const initialState: ActionState = {};

export function CategoryForm({ category }: CategoryFormProps) {
  const action = category
    ? updateCategory.bind(null, category.id)
    : createCategory;

  const [state, formAction, pending] = useActionState(action, initialState);
  const schema = (category?.attributeSchema ?? []) as AttributeField[];

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <FormSection
        title="Basic information"
        description="Categories organize your catalog. Define optional attribute fields for products in this category."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={category?.name}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={category?.slug}
              placeholder="auto-generated if empty"
              className="mt-1.5"
            />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={category?.description ?? ""}
            className="mt-1.5"
            rows={4}
          />
        </div>

        <div className="mt-4">
          <CategoryImageUpload defaultUrl={category?.imageUrl} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={category?.sortOrder ?? 0}
              className="mt-1.5"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={category?.isActive ?? true}
                className="h-4 w-4 rounded border-border"
              />
              Visible on storefront
            </label>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Product attribute schema"
        description="JSON array defining custom fields for products (size, material, capacity, etc.). Industry-agnostic."
      >
        <Textarea
          id="attributeSchema"
          name="attributeSchema"
          className="font-mono text-xs"
          rows={10}
          defaultValue={JSON.stringify(schema, null, 2)}
        />
      </FormSection>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : category ? "Update category" : "Create category"}
      </Button>
    </form>
  );
}
