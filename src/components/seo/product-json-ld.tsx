import { getSiteUrl } from "@/lib/site-url";

type ProductJsonLdProps = {
  name: string;
  description: string;
  slug: string;
  price: number;
  currency?: string;
  imageUrl?: string | null;
  sku?: string | null;
  inStock: boolean;
  brandName: string;
};

export function ProductJsonLd({
  name,
  description,
  slug,
  price,
  currency = "INR",
  imageUrl,
  sku,
  inStock,
  brandName,
}: ProductJsonLdProps) {
  const url = `${getSiteUrl()}/products/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    url,
    image: imageUrl ? [imageUrl] : undefined,
    sku: sku ?? undefined,
    brand: { "@type": "Brand", name: brandName },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price: price.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
