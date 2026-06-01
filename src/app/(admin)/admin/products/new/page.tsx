import { ProductForm } from "@/components/admin/product-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, attributeSchema: true },
  });

  if (categories.length === 0) {
    return (
      <p className="text-muted-foreground">
        Create a category before adding products.
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">New product</h1>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Product details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
