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
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-muted"
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
              <span className="px-1 text-muted-foreground">…</span>
            )}
            <Link
              href={buildHref(basePath, p, searchParams)}
              className={cn(
                "flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition",
                p === page
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted",
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
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-muted"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
