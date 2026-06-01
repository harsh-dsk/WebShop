import Link from "next/link";

import { deleteCategory } from "@/actions/categories";
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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize products with flexible attribute schemas
          </p>
        </div>
        <Link href={`${ROUTES.adminCategories}/new`}>
          <Button>Add category</Button>
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
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
                  {cat.isActive ? "Active" : "Inactive"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`${ROUTES.adminCategories}/${cat.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <DeleteButton
                      onDelete={deleteCategory.bind(null, cat.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">
            No categories yet.
          </p>
        )}
      </div>
    </div>
  );
}
