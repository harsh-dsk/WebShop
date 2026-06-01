import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";

export default async function AdminOverviewPage() {
  const [productCount, categoryCount, products] = await Promise.all([
    db.product.count(),
    db.category.count(),
    db.product.findMany({
      select: { stock: true, lowStockThreshold: true },
    }),
  ]);

  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold,
  ).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Overview</h1>
      <p className="mt-1 text-muted-foreground">
        Manage your store catalog and inventory
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{productCount}</p>
            <Link
              href={ROUTES.adminProducts}
              className="mt-2 inline-block text-sm text-accent hover:underline"
            >
              Manage →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{categoryCount}</p>
            <Link
              href={ROUTES.adminCategories}
              className="mt-2 inline-block text-sm text-accent hover:underline"
            >
              Manage →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{lowStockCount}</p>
            <Link
              href={ROUTES.adminInventory}
              className="mt-2 inline-block text-sm text-accent hover:underline"
            >
              Inventory →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
