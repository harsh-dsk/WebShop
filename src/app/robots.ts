import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/super-admin/",
          "/api/",
          "/checkout",
          "/cart",
          "/profile",
          "/account/",
          "/sign-in",
          "/sign-up",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
