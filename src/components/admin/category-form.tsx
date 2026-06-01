"use client";

import { useActionState } from "react";

import { createCategory, updateCategory, type ActionState } from "@/actions/categories";
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

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={category?.description ?? ""}
          className="mt-1.5"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          defaultValue={category?.imageUrl ?? ""}
          className="mt-1.5"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
            Active
          </label>
        </div>
      </div>

      <div>
        <Label htmlFor="attributeSchema">
          Attribute schema (JSON)
        </Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Define optional product fields for this category. Example:{" "}
          {`[{"key":"size","label":"Size","type":"text"}]`}
        </p>
        <Textarea
          id="attributeSchema"
          name="attributeSchema"
          className="mt-1.5 font-mono text-xs"
          rows={8}
          defaultValue={JSON.stringify(schema, null, 2)}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : category ? "Update category" : "Create category"}
      </Button>
    </form>
  );
}
