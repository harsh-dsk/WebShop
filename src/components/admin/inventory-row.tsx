"use client";

import { useState, useTransition } from "react";

import { updateProductStock } from "@/actions/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";

type InventoryRowProps = {
  product: {
    id: string;
    name: string;
    sku: string | null;
    stock: number;
    lowStockThreshold: number;
    price: { toString(): string };
    category: { name: string };
  };
};

export function InventoryRow({ product }: InventoryRowProps) {
  const [stock, setStock] = useState(String(product.stock));
  const [pending, startTransition] = useTransition();
  const lowStock = product.stock <= product.lowStockThreshold;

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-4">
        <p className="font-medium">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.category.name}</p>
      </td>
      <td className="hidden py-3 pr-4 text-sm text-muted-foreground sm:table-cell">
        {product.sku ?? "—"}
      </td>
      <td className="py-3 pr-4 text-sm">{formatPrice(Number(product.price))}</td>
      <td className="py-3 pr-4">
        {lowStock ? (
          <Badge variant="danger">Low</Badge>
        ) : (
          <Badge variant="muted">OK</Badge>
        )}
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="h-9 w-20"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await updateProductStock(
                  product.id,
                  parseInt(stock, 10) || 0,
                );
                if (result.error) alert(result.error);
              });
            }}
          >
            Save
          </Button>
        </div>
      </td>
    </tr>
  );
}
