import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";

import { AddressCard } from "@/components/addresses/address-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { listUserAddresses } from "@/lib/services/address.service";

export const metadata: Metadata = {
  title: "Address book",
};

export default async function AccountAddressesPage() {
  const user = await requireUser();
  const addresses = await listUserAddresses(user.id);

  return (
    <div className="page-container max-w-3xl py-10 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <header className="page-header">
          <h1 className="page-title">Address book</h1>
          <p className="page-description">
            Manage delivery addresses for faster checkout.
          </p>
        </header>
        <Link href={`${ROUTES.accountAddresses}/new`} className="shrink-0">
          <Button className="gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            Add address
          </Button>
        </Link>
      </div>

      <nav className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href={ROUTES.accountOrders} className="text-muted-foreground hover:text-foreground">
          My orders
        </Link>
        <span className="text-muted-foreground" aria-hidden>
          ·
        </span>
        <Link href={ROUTES.profile} className="text-muted-foreground hover:text-foreground">
          Profile
        </Link>
      </nav>

      {addresses.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={MapPin}
            title="No saved addresses"
            description="Add your home, office, or other delivery locations for one-click checkout."
            action={
              <Link href={`${ROUTES.accountAddresses}/new`}>
                <Button>Add your first address</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id} className="sm:col-span-2 lg:col-span-1">
              <AddressCard address={address} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
