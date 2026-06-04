"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { MapPin, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteAddress, setDefaultAddress } from "@/actions/addresses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAddressLabel } from "@/lib/address-labels";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import type { SavedAddress } from "@/types/address";

type AddressCardProps = {
  address: SavedAddress;
};

export function AddressCard({ address }: AddressCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSetDefault() {
    startTransition(async () => {
      const result = await setDefaultAddress(address.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Default address updated");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("Delete this address? This cannot be undone.")) return;

    startTransition(async () => {
      const result = await deleteAddress(address.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Address deleted");
      router.refresh();
    });
  }

  return (
    <article
      className={cn(
        "surface-card relative flex flex-col p-5 transition-all duration-200 sm:p-6",
        address.isDefault && "ring-2 ring-primary/20",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h3 className="font-semibold text-foreground">
              {formatAddressLabel(address.label)}
            </h3>
            {address.isDefault && (
              <Badge className="mt-1" variant="default">
                Default
              </Badge>
            )}
          </div>
        </div>
      </div>

      <address className="mt-4 space-y-1 text-sm not-italic leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">{address.fullName}</p>
        <p>{address.phone}</p>
        <p>{address.addressLine}</p>
        <p>
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p>{address.country}</p>
      </address>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
        {!address.isDefault && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={handleSetDefault}
            className="gap-1.5"
          >
            <Star className="h-3.5 w-3.5" aria-hidden />
            Set default
          </Button>
        )}
        <Link href={`${ROUTES.accountAddresses}/${address.id}/edit`}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Edit
          </Button>
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={handleDelete}
          className="gap-1.5 text-destructive hover:bg-red-50 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          Delete
        </Button>
      </div>
    </article>
  );
}
