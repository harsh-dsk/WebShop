/** Canonical public site URL for SEO, sitemap, and OpenGraph. */
export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}
