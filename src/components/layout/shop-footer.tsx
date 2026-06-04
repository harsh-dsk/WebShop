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
    <footer className="mt-auto border-t border-border bg-card">
      <div className="page-container py-12 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="text-lg font-semibold text-foreground">{brand.name}</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {footer.tagline}
            </p>
            <address className="mt-5 space-y-1 text-sm not-italic text-muted-foreground">
              <a
                href={`mailto:${contact.email}`}
                className="block transition-colors hover:text-primary"
              >
                {contact.email}
              </a>
              <span className="block">{contact.phone}</span>
              <span className="block">{contact.address}</span>
            </address>
            {socialLinks.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-accent underline-offset-4 transition-colors hover:text-accent/90 hover:underline"
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
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          {copyright}
        </p>
      </div>
    </footer>
  );
}
