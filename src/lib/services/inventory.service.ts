import type { Prisma } from "@prisma/client";

type TransactionClient = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function deductProductStock(
  tx: TransactionClient,
  productId: string,
  quantity: number,
): Promise<void> {
  const product = await tx.product.findUnique({
    where: { id: productId },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const activeVariants = product.variants;

  if (activeVariants.length === 0) {
    if (product.stock < quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });
    return;
  }

  const totalVariantStock = activeVariants.reduce((sum, v) => sum + v.stock, 0);
  if (totalVariantStock < quantity) {
    throw new Error(`Insufficient stock for ${product.name}`);
  }

  let remaining = quantity;

  for (const variant of activeVariants) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, variant.stock);
    if (take <= 0) continue;

    await tx.productVariant.update({
      where: { id: variant.id },
      data: { stock: { decrement: take } },
    });
    remaining -= take;
  }
}
