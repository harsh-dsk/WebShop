import Link from "next/link";

import { deleteCategory } from "@/actions/categories";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Categories"
        description="Organize your catalog. Each category can define custom product attribute fields for any industry."
        actions={
          <Link href={`${ROUTES.adminCategories}/new`}>
            <Button>Add category</Button>
          </Link>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{cat.slug}</td>
                <td className="px-4 py-3">{cat._count.products}</td>
                <td className="px-4 py-3">
                  {cat.isActive ? "Published" : "Hidden"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`${ROUTES.adminCategories}/${cat.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <DeleteButton onDelete={deleteCategory.bind(null, cat.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <p className="p-10 text-center text-muted-foreground">
            No categories yet. Create one to start adding products.
          </p>
        )}
      </div>
    </div>
  );
}
