import { db } from "@/lib/db";
import { getPrimaryImage, parseProductImages } from "@/lib/services/catalog.service";

export async function getOrCreateWishlist(userId: string) {
  const existing = await db.wishlist.findUnique({ where: { userId } });
  if (existing) return existing;
  return db.wishlist.create({ data: { userId } });
}

export async function getWishlistWithItems(userId: string) {
  const wishlist = await getOrCreateWishlist(userId);
  const items = await db.wishlistItem.findMany({
    where: { wishlistId: wishlist.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          variants: { where: { isActive: true }, select: { stock: true, isActive: true } },
          category: { select: { name: true } },
        },
      },
    },
  });

  return {
    wishlist,
    items: items.map((item) => {
      const images = parseProductImages(item.product.images);
      const primary = getPrimaryImage(images) ?? images[0];
      return {
        id: item.id,
        productId: item.productId,
        createdAt: item.createdAt,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: Number(item.product.price),
          compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
          stock: item.product.stock,
          lowStockThreshold: item.product.lowStockThreshold,
          isFeatured: item.product.isFeatured,
          images: item.product.images,
          image: primary?.url ?? null,
          category: { name: item.product.category.name },
          variants: item.product.variants,
        },
      };
    }),
  };
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  const wishlist = await db.wishlist.findUnique({ where: { userId }, select: { id: true } });
  if (!wishlist) return false;
  const item = await db.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    select: { id: true },
  });
  return Boolean(item);
}

