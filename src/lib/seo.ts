import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

function absoluteUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildOpenGraphMetadata(params: {
  title: string;
  description: string;
  urlPath: string;
  imageUrl?: string | null;
}): Pick<Metadata, "openGraph" | "twitter" | "metadataBase" | "alternates"> {
  const url = absoluteUrl(params.urlPath);
  const image = params.imageUrl ? [params.imageUrl] : undefined;

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ),
    alternates: { canonical: url },
    openGraph: {
      title: params.title,
      description: params.description,
      url,
      siteName: siteConfig.brand.name,
      type: "website",
      images: image,
    },
    twitter: {
      card: params.imageUrl ? "summary_large_image" : "summary",
      title: params.title,
      description: params.description,
      images: image,
    },
  };
}

