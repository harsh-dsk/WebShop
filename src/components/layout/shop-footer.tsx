import Link from "next/link";

import { getRuntimeSiteConfig } from "@/lib/services/site-settings.service";

export async function ShopFooter() {
  const config = await getRuntimeSiteConfig();
  const { footer, contact, social, brand } = config;

  const socialLinks = [
    { label: "Instagram", href: social.instagram },
    { label: "Facebook", href: social.facebook },
    { label: "LinkedIn", href: social.linkedIn },
    { label: "Twitter", href: social.twitter },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));

  const copyright = footer.copyright
    .replace("{year}", String(new Date().getFullYear()))
    .replace("{brand}", brand.name);

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="font-semibold text-primary">{brand.name}</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {footer.tagline}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {contact.email}
              <br />
              {contact.phone}
              <br />
              {contact.address}
            </p>
            {socialLinks.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {footer.columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-foreground">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          {copyright}
        </p>
      </div>
    </footer>
  );
}
