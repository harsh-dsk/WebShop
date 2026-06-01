"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductVariantInput } from "@/types/catalog";

type VariantsEditorProps = {
  value: ProductVariantInput[];
  onChange: (variants: ProductVariantInput[]) => void;
};

const emptyVariant = (): ProductVariantInput => ({
  name: "",
  sku: "",
  price: null,
  stock: 0,
  attributes: {},
  isActive: true,
  sortOrder: 0,
});

export function VariantsEditor({ value, onChange }: VariantsEditorProps) {
  function update(index: number, patch: Partial<ProductVariantInput>) {
    const next = [...value];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Optional size, color, or other options. Stock is tracked per variant when
        variants are added.
      </p>

      {value.map((variant, index) => (
        <div
          key={index}
          className="rounded-xl border border-border bg-background/50 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium">Variant {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Name *</Label>
              <Input
                value={variant.name}
                onChange={(e) => update(index, { name: e.target.value })}
                placeholder="e.g. Black / Large"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>SKU</Label>
              <Input
                value={variant.sku ?? ""}
                onChange={(e) => update(index, { sku: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Price override</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={variant.price ?? ""}
                onChange={(e) =>
                  update(index, {
                    price: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="Uses base price if empty"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Stock *</Label>
              <Input
                type="number"
                min="0"
                value={variant.stock}
                onChange={(e) =>
                  update(index, { stock: parseInt(e.target.value, 10) || 0 })
                }
                className="mt-1"
                required
              />
            </div>
          </div>

          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={variant.isActive !== false}
              onChange={(e) => update(index, { isActive: e.target.checked })}
              className="h-4 w-4 rounded"
            />
            Active
          </label>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...value, emptyVariant()])}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add variant
      </Button>

    </div>
  );
}
