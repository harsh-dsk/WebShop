import Link from "next/link";
import Image from "next/image";

import { deleteProduct } from "@/actions/products";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import { getPrimaryImage, parseProductImages } from "@/lib/services/catalog.service";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} total
          </p>
        </div>
        <Link href={`${ROUTES.adminProducts}/new`}>
          <Button>Add product</Button>
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const img =
                getPrimaryImage(parseProductImages(product.images)) ??
                parseProductImages(product.images)[0];

              return (
                <tr
                  key={product.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {img ? (
                          <Image
                            src={img.url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : null}
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {product.category.name}
                  </td>
                  <td className="px-4 py-3">
                    {formatPrice(Number(product.price))}
                  </td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">
                    {product.isActive ? "Active" : "Draft"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`${ROUTES.adminProducts}/${product.id}/edit`}
                      >
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteButton
                        onDelete={deleteProduct.bind(null, product.id)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">
            No products yet.
          </p>
        )}
      </div>
    </div>
  );
}
