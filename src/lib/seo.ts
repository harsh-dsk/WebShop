import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { getSiteUrl } from "@/lib/site-url";

function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildOpenGraphMetadata(params: {
  title: string;
  description: string;
  urlPath: string;
  imageUrl?: string | null;
  type?: "website" | "article";
}): Pick<Metadata, "openGraph" | "twitter" | "metadataBase" | "alternates"> {
  const url = absoluteUrl(params.urlPath);
  const image = params.imageUrl ? [params.imageUrl] : undefined;

  return {
    metadataBase: new URL(getSiteUrl()),
    alternates: { canonical: url },
    openGraph: {
      title: params.title,
      description: params.description,
      url,
      siteName: siteConfig.brand.name,
      type: params.type ?? "website",
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

export function buildPageMetadata(params: {
  title: string;
  description: string;
  urlPath: string;
  imageUrl?: string | null;
}): Metadata {
  return {
    title: params.title,
    description: params.description,
    ...buildOpenGraphMetadata(params),
  };
}
