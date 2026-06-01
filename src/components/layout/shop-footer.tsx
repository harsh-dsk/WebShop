import Link from "next/link";

import { siteConfig } from "@/config/site";
import { formatCopyright } from "@/lib/format";

export function ShopFooter() {
  const { footer, contact } = siteConfig;

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="font-semibold text-primary">{siteConfig.brand.name}</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {footer.tagline}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {contact.email}
              <br />
              {contact.phone}
            </p>
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
          {formatCopyright()}
        </p>
      </div>
    </footer>
  );
}
