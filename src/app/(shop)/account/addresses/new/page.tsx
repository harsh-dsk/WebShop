import type { Metadata } from "next";
import Link from "next/link";

import { AddressForm } from "@/components/addresses/address-form";
import { ROUTES } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Add address",
};

type PageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function NewAddressPage({ searchParams }: PageProps) {
  const { returnTo } = await searchParams;
  const safeReturn =
    returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : undefined;

  return (
    <div className="page-container max-w-xl py-10 sm:py-12">
      <nav className="breadcrumb">
        <Link href={ROUTES.accountAddresses}>Addresses</Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">Add</span>
      </nav>

      <header className="page-header mt-6">
        <h1 className="page-title">Add address</h1>
        <p className="page-description">Save a new delivery address to your account.</p>
      </header>

      <div className="surface-card mt-8 p-6 sm:p-8">
        <AddressForm mode="create" returnTo={safeReturn} />
      </div>
    </div>
  );
}
