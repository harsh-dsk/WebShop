import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { ROUTES } from "@/lib/constants/routes";
import { getCartItemCount } from "@/lib/services/cart.service";
import { cn } from "@/lib/utils";

type CartNavLinkProps = {
  userId: string | null;
  className?: string;
};

export async function CartNavLink({ userId, className }: CartNavLinkProps) {
  const count = userId ? await getCartItemCount(userId) : 0;

  return (
    <Link
      href={userId ? ROUTES.cart : ROUTES.signIn}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-primary",
        className,
      )}
      aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
    >
      <ShoppingCart className="h-5 w-5" aria-hidden />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
