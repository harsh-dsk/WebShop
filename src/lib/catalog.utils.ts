import type { ProductImage } from "@/types/catalog";

export function getPrimaryImage(images: unknown): ProductImage | null {
  if (!Array.isArray(images) || images.length === 0) return null;
  const first = images[0] as ProductImage;
  if (typeof first?.url === "string") return first;
  return null;
}

export function parseProductImages(images: unknown): ProductImage[] {
  if (!Array.isArray(images)) return [];
  return images.filter(
    (img): img is ProductImage =>
      typeof img === "object" &&
      img !== null &&
      "url" in img &&
      typeof (img as ProductImage).url === "string",
  );
}

export function getEffectiveStock(product: {
  stock: number;
  variants?: { stock: number; isActive: boolean }[];
}): number {
  if (product.variants && product.variants.length > 0) {
    return product.variants
      .filter((v) => v.isActive)
      .reduce((sum, v) => sum + v.stock, 0);
  }
  return product.stock;
}
