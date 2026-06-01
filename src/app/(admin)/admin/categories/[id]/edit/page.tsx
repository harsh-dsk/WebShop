import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/category-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { db } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const category = await db.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div className="space-y-8">
      <AdminPageHeader title={`Edit: ${category.name}`} />
      <CategoryForm category={category} />
    </div>
  );
}
