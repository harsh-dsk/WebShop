import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeVariables } from "@/components/brand/theme-variables";
import { AppToaster } from "@/components/providers/shop-toaster";
import { RouteProgress } from "@/components/providers/route-progress";
import { siteConfig } from "@/config/site";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { getRuntimeSiteConfig } from "@/lib/services/site-settings.service";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.brand.name,
    template: `%s | ${siteConfig.brand.name}`,
  },
  description: siteConfig.brand.description,
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000",
  ),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const runtimeConfig = await getRuntimeSiteConfig();

  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en">
        <head>
          <ThemeVariables config={runtimeConfig} />
          {runtimeConfig.faviconUrl ? (
            <link rel="icon" href={runtimeConfig.faviconUrl} />
          ) : null}
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}
        >
          <RouteProgress />
          <AppToaster />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
