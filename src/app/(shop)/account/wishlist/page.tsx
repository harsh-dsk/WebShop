import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";

import { WishlistItem } from "@/components/shop/wishlist-item";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
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
        <div className="mt-10">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Tap the heart on any product to save it here for later."
            action={
              <Link href={ROUTES.products}>
                <Button>Browse products</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {items.map((it) => (
            <WishlistItem
              key={it.id}
              id={it.id}
              product={{
                slug: it.product.slug,
                name: it.product.name,
                price: Number(it.product.price),
                image: it.product.image,
                category: it.product.category,
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
