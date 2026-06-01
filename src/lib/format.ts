import { siteConfig } from "@/config/site";

export function formatPrice(amount: number | string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  const { locale, code } = siteConfig.currency;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCopyright(): string {
  return siteConfig.footer.copyright
    .replace("{year}", String(new Date().getFullYear()))
    .replace("{brand}", siteConfig.brand.name);
}
