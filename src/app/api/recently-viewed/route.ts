import { NextResponse } from "next/server";

import { getProductsBySlugs } from "@/lib/services/catalog.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("slugs") ?? "";

  const slugs = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);

  const products = await getProductsBySlugs(slugs);

  // Preserve the requested order.
  const ordered = slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  return NextResponse.json({
    products: ordered.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      isFeatured: p.isFeatured,
      images: p.images,
      category: { name: p.category.name },
      variants: p.variants,
    })),
  });
}

