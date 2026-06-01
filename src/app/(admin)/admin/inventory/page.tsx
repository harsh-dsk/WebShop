import { InventoryRow } from "@/components/admin/inventory-row";
import { db } from "@/lib/db";

export default async function AdminInventoryPage() {
  const products = await db.product.findMany({
    orderBy: { name: "asc" },
    include: { category: { select: { name: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Inventory</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Track and update stock levels
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">SKU</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <InventoryRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">
            No products to track.
          </p>
        )}
      </div>
    </div>
  );
}
