import Link from "next/link";

import { cn } from "@/lib/utils";

type PaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
  searchParams?: Record<string, string | undefined>;
};

function buildHref(
  basePath: string,
  page: number,
  searchParams?: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

const pageLinkClass =
  "flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-all duration-200";

export function Pagination({
  basePath,
  page,
  totalPages,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) =>
      p === 1 ||
      p === totalPages ||
      (p >= page - 1 && p <= page + 1),
  );

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {page > 1 && (
        <Link
          href={buildHref(basePath, page - 1, searchParams)}
          className={cn(
            pageLinkClass,
            "border-border bg-card shadow-sm hover:border-primary/20 hover:bg-muted",
          )}
        >
          Previous
        </Link>
      )}

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;

        return (
          <span key={p} className="flex items-center gap-2">
            {showEllipsis && (
              <span className="px-1 text-muted-foreground" aria-hidden>
                …
              </span>
            )}
            <Link
              href={buildHref(basePath, p, searchParams)}
              className={cn(
                pageLinkClass,
                p === page
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card hover:border-primary/20 hover:bg-muted",
              )}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Link>
          </span>
        );
      })}

      {page < totalPages && (
        <Link
          href={buildHref(basePath, page + 1, searchParams)}
          className={cn(
            pageLinkClass,
            "border-border bg-card shadow-sm hover:border-primary/20 hover:bg-muted",
          )}
        >
          Next
        </Link>
      )}
    </nav>
  );
}
