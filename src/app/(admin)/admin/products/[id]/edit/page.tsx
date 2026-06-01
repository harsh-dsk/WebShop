import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { db } from "@/lib/db";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  const [rawProduct, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        variants: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    }),
    db.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        attributeSchema: true,
      },
    }),
  ]);

  if (!rawProduct) notFound();

  const product = {
    ...rawProduct,
    price: Number(rawProduct.price),
    compareAtPrice: rawProduct.compareAtPrice
      ? Number(rawProduct.compareAtPrice)
      : null,
    variants: rawProduct.variants.map((variant) => ({
  ...variant,
  price: variant.price ? Number(variant.price) : null,
})),
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader title={`Edit: ${product.name}`} />
      <ProductForm
        categories={categories}
        product={product}
      />
    </div>
  );
}