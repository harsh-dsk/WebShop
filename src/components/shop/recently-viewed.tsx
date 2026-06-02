"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "webshop.recentlyViewed.v1";
const MAX_ITEMS = 8;

type RecentlyViewedProps = {
  currentSlug: string;
  initialSlugs?: string[];
  className?: string;
  title?: string;
};

export function trackRecentlyViewed(slug: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    const next = [slug, ...list.filter((s) => s !== slug)].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function getRecentlyViewed(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function RecentlyViewed({
  currentSlug,
  initialSlugs,
  className,
  title = "Recently viewed",
}: RecentlyViewedProps) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    trackRecentlyViewed(currentSlug);
    const fromStorage = getRecentlyViewed().filter((s) => s !== currentSlug);
    setSlugs(fromStorage.length > 0 ? fromStorage : (initialSlugs ?? []));
  }, [currentSlug]);

  const items = useMemo(() => slugs.slice(0, 6), [slugs]);
  if (items.length === 0) return null;

  return (
    <section className={cn("rounded-2xl border border-border bg-card p-6", className)}>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((slug) => (
          <Link
            key={slug}
            href={`${ROUTES.products}/${slug}`}
            className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {slug.replaceAll("-", " ")}
          </Link>
        ))}
      </div>
    </section>
  );
}

