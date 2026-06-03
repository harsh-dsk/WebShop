import type { SiteSettings } from "@prisma/client";

import { siteConfig, type SiteConfig } from "@/config/site";

export type RuntimeSiteConfig = SiteConfig & {
  social: {
    instagram: string | null;
    facebook: string | null;
    linkedIn: string | null;
    twitter: string | null;
  };
  homepage: {
    showFeaturedProducts: boolean;
    showCategories: boolean;
    showBestSellers: boolean;
    showNewsletter: boolean;
  };
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    button: string;
  };
  faviconUrl: string | null;
};

export function mapSiteSettingsToRuntime(settings: SiteSettings): RuntimeSiteConfig {
  const logoType =
    settings.logoUrl && settings.logoUrl.length > 0 ? "image" : "text";

  return {
    brand: {
      name: settings.storeName,
      tagline: settings.storeTagline,
      description: settings.storeDescription,
    },
    logo: {
      type: logoType,
      text: settings.logoText,
      imageUrl: settings.logoUrl ?? siteConfig.logo.imageUrl,
      imageAlt: `${settings.storeName} logo`,
    },
    theme: {
      primary: settings.primaryColor,
      accent: settings.accentColor,
      background: settings.backgroundColor,
      card: settings.secondaryColor,
    },
    themeColors: {
      primary: settings.primaryColor,
      secondary: settings.secondaryColor,
      accent: settings.accentColor,
      background: settings.backgroundColor,
      text: settings.textColor,
      button: settings.buttonColor,
    },
    hero: {
      eyebrow: settings.heroEyebrow ?? siteConfig.hero.eyebrow,
      title: settings.heroTitle,
      subtitle: settings.heroSubtitle,
      primaryCta: {
        label: settings.heroPrimaryCtaLabel,
        href: settings.heroPrimaryCtaHref,
      },
      secondaryCta: {
        label:
          settings.heroSecondaryCtaLabel ?? siteConfig.hero.secondaryCta.label,
        href:
          settings.heroSecondaryCtaHref ?? siteConfig.hero.secondaryCta.href,
      },
      imageUrl: settings.heroBackgroundImage ?? undefined,
    },
    navigation: siteConfig.navigation,
    footer: {
      ...siteConfig.footer,
      tagline: settings.storeTagline,
    },
    contact: {
      email: settings.supportEmail,
      phone: settings.supportPhone,
      address: settings.storeAddress,
    },
    currency: siteConfig.currency,
    catalog: siteConfig.catalog,
    social: {
      instagram: settings.instagramUrl,
      facebook: settings.facebookUrl,
      linkedIn: settings.linkedInUrl,
      twitter: settings.twitterUrl,
    },
    homepage: {
      showFeaturedProducts: settings.showFeaturedProducts,
      showCategories: settings.showCategories,
      showBestSellers: settings.showBestSellers,
      showNewsletter: settings.showNewsletter,
    },
    faviconUrl: settings.faviconUrl,
  };
}

export function getDefaultSiteSettingsData() {
  const { brand, logo, theme, hero, contact } = siteConfig;
  return {
    id: "default" as const,
    storeName: brand.name,
    storeTagline: brand.tagline,
    storeDescription: brand.description,
    logoUrl: logo.type === "image" ? logo.imageUrl : null,
    logoText: logo.text,
    faviconUrl: null,
    supportEmail: contact.email,
    supportPhone: contact.phone,
    storeAddress: contact.address,
    instagramUrl: null,
    facebookUrl: null,
    linkedInUrl: null,
    twitterUrl: null,
    primaryColor: theme.primary,
    secondaryColor: theme.card,
    accentColor: theme.accent,
    backgroundColor: theme.background,
    textColor: "#1B2E28",
    buttonColor: theme.primary,
    heroEyebrow: hero.eyebrow,
    heroTitle: hero.title,
    heroSubtitle: hero.subtitle,
    heroPrimaryCtaLabel: hero.primaryCta.label,
    heroPrimaryCtaHref: hero.primaryCta.href,
    heroSecondaryCtaLabel: hero.secondaryCta.label,
    heroSecondaryCtaHref: hero.secondaryCta.href,
    heroBackgroundImage: hero.imageUrl ?? null,
    showFeaturedProducts: true,
    showCategories: true,
    showBestSellers: true,
    showNewsletter: false,
  };
}
