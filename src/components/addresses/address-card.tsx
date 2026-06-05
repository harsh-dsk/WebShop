"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
  const [pendingAction, setPendingAction] = useState<"default" | "delete" | null>(
    null,
  );
  const [isDefault, setIsDefault] = useState(address.isDefault);
  const [removed, setRemoved] = useState(false);

  if (removed) return null;

  function handleSetDefault() {
    setPendingAction("default");
    setIsDefault(true);

    startTransition(async () => {
      const result = await setDefaultAddress(address.id);
      if (result.error) {
        setIsDefault(address.isDefault);
        toast.error(result.error);
      } else {
        toast.success("Default address updated");
        router.refresh();
      }
      setPendingAction(null);
    });
  }

  function handleDelete() {
    if (!confirm("Delete this address? This cannot be undone.")) return;

    setPendingAction("delete");
    setRemoved(true);

    startTransition(async () => {
      const result = await deleteAddress(address.id);
      if (result.error) {
        setRemoved(false);
        toast.error(result.error);
      } else {
        toast.success("Address deleted");
        router.refresh();
      }
      setPendingAction(null);
    });
  }

  return (
    <article
      className={cn(
        "surface-card card-interactive relative flex flex-col p-5 sm:p-6",
        isDefault && "ring-2 ring-primary/20",
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
            {isDefault && (
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
        {!isDefault && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={pending && pendingAction === "default"}
            disabled={pending}
            onClick={handleSetDefault}
            className="gap-1.5"
          >
            <Star className="h-3.5 w-3.5" aria-hidden />
            {pending && pendingAction === "default" ? "Setting…" : "Set default"}
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
          loading={pending && pendingAction === "delete"}
          disabled={pending}
          onClick={handleDelete}
          className="gap-1.5 text-destructive hover:bg-red-50 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          {pending && pendingAction === "delete" ? "Deleting…" : "Delete"}
        </Button>
      </div>
    </article>
  );
}
