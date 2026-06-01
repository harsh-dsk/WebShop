import { ProductForm } from "@/components/admin/product-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { db } from "@/lib/db";

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, attributeSchema: true },
  });

  if (categories.length === 0) {
    return (
      <AdminPageHeader
        title="New product"
        description="Create a category first, then add products."
      />
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="New product"
        description="Add images, variants, attributes, tags, and SEO metadata."
      />
      <ProductForm categories={categories} />
    </div>
  );
}
