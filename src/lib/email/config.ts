import { siteConfig } from "@/config/site";

export function getResendApiKey(): string | undefined {
  return process.env.RESEND_API_KEY?.trim() || undefined;
}

export function getAdminEmail(): string | undefined {
  return process.env.ADMIN_EMAIL?.trim() || undefined;
}

/** Verified sender in Resend (defaults to Resend sandbox for development). */
export function getFromEmail(): string {
  const configured = process.env.RESEND_FROM_EMAIL?.trim();
  if (configured) return configured;
  return `${siteConfig.brand.name} <onboarding@resend.dev>`;
}

export function getSiteBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  return base;
}

export function isEmailConfigured(): boolean {
  return Boolean(getResendApiKey());
}
