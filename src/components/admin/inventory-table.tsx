"use client";

import { useState, useTransition } from "react";
import { Package } from "lucide-react";
import { toast } from "sonner";

import { updateProductStock, updateVariantStock } from "@/actions/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type InventoryProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  stock: number;
  lowStockThreshold: number;
  price: { toString(): string };
  isActive: boolean;
  category: { name: string };
  variants: Array<{
    id: string;
    name: string;
    sku: string | null;
    stock: number;
    isActive: boolean;
  }>;
};

type InventoryTableProps = {
  products: InventoryProduct[];
};

export function InventoryTable({ products }: InventoryTableProps) {
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  const filtered = products.filter((p) => {
    const effective = getEffectiveStock(p);
    if (filter === "out") return effective === 0;
    if (filter === "low")
      return effective > 0 && effective <= p.lowStockThreshold;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Stock filters">
        {(["all", "low", "out"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "filter-pill",
              filter === f && "filter-pill-active",
            )}
          >
            {f === "all" ? "All" : f === "low" ? "Low stock" : "Out of stock"}
          </button>
        ))}
      </div>

      <div className="data-table-wrap">
        <div className="data-table-scroll">
          <table className="data-table min-w-[720px]">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Status</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <ProductInventoryRows key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="p-10 text-center text-muted-foreground">
            No products match this filter.
          </p>
        )}
      </div>
    </div>
  );
}

function getEffectiveStock(product: InventoryProduct) {
  if (product.variants.length > 0) {
    return product.variants
      .filter((v) => v.isActive)
      .reduce((sum, v) => sum + v.stock, 0);
  }
  return product.stock;
}

function ProductInventoryRows({ product }: { product: InventoryProduct }) {
  const effective = getEffectiveStock(product);
  const low =
    effective > 0 && effective <= product.lowStockThreshold;
  const out = effective === 0;
  const rowClass =
    out
      ? "bg-red-50/60"
      : low
        ? "bg-amber-50/60"
        : "";

  if (product.variants.length > 0) {
    return (
      <>
        <tr className="border-b border-border bg-muted/20">
          <td className="px-4 py-3" colSpan={5}>
            <div className="flex items-center gap-2 font-medium">
              <Package className="h-4 w-4 text-primary" />
              {product.name}
              <span className="text-xs font-normal text-muted-foreground">
                ({product.category.name})
              </span>
              <StockBadge low={low} out={out} />
            </div>
          </td>
        </tr>
        {product.variants.map((variant) => (
          <VariantRow
            key={variant.id}
            productName={product.name}
            variant={variant}
            price={product.price}
          />
        ))}
      </>
    );
  }

  return (
    <ProductRow
      product={product}
      low={low}
      out={out}
      rowClassName={rowClass}
    />
  );
}

function StockBadge({ low, out }: { low: boolean; out: boolean }) {
  if (out) return <Badge variant="danger">Out of stock</Badge>;
  if (low) return <Badge variant="warning">Low stock</Badge>;
  return <Badge variant="muted">In stock</Badge>;
}

function ProductRow({
  product,
  low,
  out,
  rowClassName,
}: {
  product: InventoryProduct;
  low: boolean;
  out: boolean;
  rowClassName: string;
}) {
  const [stock, setStock] = useState(String(product.stock));
  const [pending, startTransition] = useTransition();

  return (
    <tr className={cn("border-b border-border last:border-0", rowClassName)}>
      <td className="px-4 py-3">
        <p className="font-medium">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.category.name}</p>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{product.sku ?? "—"}</td>
      <td className="px-4 py-3">{formatPrice(Number(product.price))}</td>
      <td className="px-4 py-3">
        <StockBadge low={low} out={out} />
      </td>
      <td className="px-4 py-3">
        <StockEditor
          value={stock}
          onChange={setStock}
          pending={pending}
          onSave={() => {
            startTransition(async () => {
              const r = await updateProductStock(
                product.id,
                parseInt(stock, 10) || 0,
              );
              if (r.error) toast.error(r.error);
              else toast.success("Stock updated");
            });
          }}
        />
        {(low || out) && (
          <p className="mt-1 text-xs text-muted-foreground">
            {out
              ? "Out of stock — consider restocking"
              : `Low stock — threshold ${product.lowStockThreshold}`}
          </p>
        )}
      </td>
    </tr>
  );
}

function VariantRow({
  variant,
  price,
}: {
  productName: string;
  variant: InventoryProduct["variants"][0];
  price: InventoryProduct["price"];
}) {
  const [stock, setStock] = useState(String(variant.stock));
  const [pending, startTransition] = useTransition();
  const out = variant.stock === 0;

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 pl-10 text-muted-foreground">{variant.name}</td>
      <td className="px-4 py-3 text-muted-foreground">{variant.sku ?? "—"}</td>
      <td className="px-4 py-3">{formatPrice(Number(price))}</td>
      <td className="px-4 py-3">
        {out ? (
          <Badge variant="danger">Out</Badge>
        ) : (
          <Badge variant="muted">OK</Badge>
        )}
      </td>
      <td className="px-4 py-3">
        <StockEditor
          value={stock}
          onChange={setStock}
          pending={pending}
          onSave={() => {
            startTransition(async () => {
              const r = await updateVariantStock(
                variant.id,
                parseInt(stock, 10) || 0,
              );
              if (r.error) toast.error(r.error);
              else toast.success("Stock updated");
            });
          }}
        />
      </td>
    </tr>
  );
}

function StockEditor({
  value,
  onChange,
  pending,
  onSave,
}: {
  value: string;
  onChange: (v: string) => void;
  pending: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-20"
      />
      <Button type="button" size="sm" variant="outline" loading={pending} onClick={onSave}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
