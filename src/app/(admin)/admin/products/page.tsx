import Link from "next/link";
import Image from "next/image";

import { deleteProduct } from "@/actions/products";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";
import {
  getEffectiveStock,
  getPrimaryImage,
  parseProductImages,
} from "@/lib/services/catalog.service";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      variants: { select: { stock: true, isActive: true } },
      _count: { select: { variants: true } },
    },
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Products"
        description="Full catalog control: images, variants, attributes, tags, and SEO."
        actions={
          <Link href={`${ROUTES.adminProducts}/new`}>
            <Button>Add product</Button>
          </Link>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
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
              const images = parseProductImages(product.images);
              const img = getPrimaryImage(images) ?? images[0];
              const stock = getEffectiveStock(product);

              return (
                <tr
                  key={product.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {img && (
                          <Image
                            src={img.url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="44px"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.tags.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {product.tags.slice(0, 3).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {product.category.name}
                  </td>
                  <td className="px-4 py-3">
                    {formatPrice(Number(product.price))}
                  </td>
                  <td className="px-4 py-3">
                    {stock}
                    {product._count.variants > 0 && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({product._count.variants} variants)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={product.isActive ? "default" : "muted"}>
                      {product.isActive ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`${ROUTES.adminProducts}/${product.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteButton onDelete={deleteProduct.bind(null, product.id)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-10 text-center text-muted-foreground">
            No products yet.
          </p>
        )}
      </div>
    </div>
  );
}
