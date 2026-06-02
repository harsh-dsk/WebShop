import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { removeFromWishlist } from "@/actions/wishlist";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { formatPrice } from "@/lib/format";
import { getWishlistWithItems } from "@/lib/services/wishlist.service";

export const metadata: Metadata = {
  title: "Wishlist",
};

export default async function WishlistPage() {
  const user = await requireUser();
  const { items } = await getWishlistWithItems(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-primary">Wishlist</h1>
      <p className="mt-2 text-muted-foreground">
        Save products you want to come back to.
      </p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">Your wishlist is empty.</p>
          <Link href={ROUTES.products} className="mt-6 inline-block">
            <Button>Browse products</Button>
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex min-w-0 items-center gap-4">
                <Link
                  href={`${ROUTES.products}/${it.product.slug}`}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted"
                >
                  {it.product.image ? (
                    <Image
                      src={it.product.image}
                      alt={it.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : null}
                </Link>
                <div className="min-w-0">
                  <Link
                    href={`${ROUTES.products}/${it.product.slug}`}
                    className="line-clamp-1 font-semibold hover:text-primary"
                  >
                    {it.product.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {it.product.category.name}
                  </p>
                  <p className="mt-1 font-semibold text-primary">
                    {formatPrice(it.product.price)}
                  </p>
                </div>
              </div>

              <form action={removeFromWishlist.bind(null, it.id)}>
                <Button type="submit" variant="outline">
                  Remove
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

