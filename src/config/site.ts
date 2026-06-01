/**
 * Central branding & store configuration.
 * Customize this file before deploying for each business.
 *
 * Examples: general store, electronics, clothing, cosmetics, pet store, etc.
 */

export type NavLink = {
  label: string;
  href: string;
};

export type SiteConfig = {
  brand: {
    name: string;
    tagline: string;
    description: string;
  };
  logo: {
    /** Use "image" when logo.imageUrl is set; otherwise shows logo.text */
    type: "text" | "image";
    text: string;
    imageUrl: string;
    imageAlt: string;
  };
  theme: {
    primary: string;
    accent: string;
    background: string;
    card: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: NavLink;
    secondaryCta: NavLink;
    imageUrl?: string;
  };
  navigation: {
    main: NavLink[];
  };
  footer: {
    tagline: string;
    columns: Array<{
      title: string;
      links: NavLink[];
    }>;
    copyright: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  currency: {
    code: string;
    symbol: string;
    locale: string;
  };
  catalog: {
    productsPerPage: number;
    defaultSort: "newest" | "price-asc" | "price-desc" | "name";
  };
};

export const siteConfig: SiteConfig = {
  brand: {
    name: "Storefront",
    tagline: "Premium shopping experience",
    description:
      "A modern ecommerce template — customize branding and deploy for any retail business.",
  },
  logo: {
    type: "text",
    text: "SF",
    imageUrl: "/logo.svg",
    imageAlt: "Store logo",
  },
  theme: {
    primary: "#1B4332",
    accent: "#E85D04",
    background: "#FAF7F2",
    card: "#F0EBE3",
  },
  hero: {
    eyebrow: "New collection available",
    title: "Discover products you'll love",
    subtitle:
      "Browse our curated catalog. Deploy this template for electronics, fashion, home goods, and more.",
    primaryCta: { label: "Shop all products", href: "/products" },
    secondaryCta: { label: "Browse categories", href: "/categories" },
  },
  navigation: {
    main: [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
      { label: "Categories", href: "/categories" },
    ],
  },
  footer: {
    tagline: "Quality products. Trusted service.",
    columns: [
      {
        title: "Shop",
        links: [
          { label: "All products", href: "/products" },
          { label: "Categories", href: "/categories" },
        ],
      },
      {
        title: "Account",
        links: [
          { label: "Sign in", href: "/sign-in" },
          { label: "Profile", href: "/profile" },
        ],
      },
    ],
    copyright: "© {year} {brand}. All rights reserved.",
  },
  contact: {
    email: "hello@example.com",
    phone: "+91 00000 00000",
    address: "Your city, your country",
  },
  currency: {
    code: "INR",
    symbol: "₹",
    locale: "en-IN",
  },
  catalog: {
    productsPerPage: 12,
    defaultSort: "newest",
  },
};
