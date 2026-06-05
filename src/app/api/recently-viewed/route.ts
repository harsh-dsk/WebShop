import { NextResponse } from "next/server";

import {
  checkRateLimit,
  getClientIp,
  RATE_LIMITS,
} from "@/lib/rate-limit";
import { rateLimitExceededResponse } from "@/lib/rate-limit-response";
import { getProductsBySlugs } from "@/lib/services/catalog.service";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`recently-viewed:${ip}`, RATE_LIMITS.publicApi);
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit);
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("slugs") ?? "";

  const slugs = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);

  try {
    const products = await getProductsBySlugs(slugs);

    const ordered = slugs
      .map((slug) => products.find((p) => p.slug === slug))
      .filter(
        (product): product is NonNullable<typeof product> => Boolean(product),
      );

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
  } catch {
    return NextResponse.json(
      { error: "Could not load products", products: [] },
      { status: 500 },
    );
  }
}
