"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { removeFromWishlist } from "@/actions/wishlist";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type WishlistItemProps = {
  id: string;
  product: {
    slug: string;
    name: string;
    price: number;
    image: string | null;
    category: { name: string };
  };
};

export function WishlistItem({ id, product }: WishlistItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);

  if (removed) return null;

  return (
    <li
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-200 card-interactive",
        pending && "opacity-60",
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <Link
          href={`${ROUTES.products}/${product.slug}`}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted"
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : null}
        </Link>
        <div className="min-w-0">
          <Link
            href={`${ROUTES.products}/${product.slug}`}
            className="line-clamp-1 font-semibold hover:text-primary"
          >
            {product.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            {product.category.name}
          </p>
          <p className="mt-1 font-semibold text-primary">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        loading={pending}
        onClick={() => {
          setRemoved(true);
          startTransition(async () => {
            const result = await removeFromWishlist(id);
            if (result.error) {
              setRemoved(false);
              toast.error(result.error);
              return;
            }
            toast.success("Removed from wishlist");
            router.refresh();
          });
        }}
      >
        <Heart className="mr-1.5 h-4 w-4" aria-hidden />
        {pending ? "Removing…" : "Remove"}
      </Button>
    </li>
  );
}
