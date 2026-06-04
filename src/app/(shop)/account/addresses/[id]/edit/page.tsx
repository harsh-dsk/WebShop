import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddressForm } from "@/components/addresses/address-form";
import { requireUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { getUserAddressById, toSavedAddress } from "@/lib/services/address.service";

export const metadata: Metadata = {
  title: "Edit address",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function EditAddressPage({ params, searchParams }: PageProps) {
  const user = await requireUser();
  const { id } = await params;
  const { returnTo } = await searchParams;

  const row = await getUserAddressById(user.id, id);
  if (!row) notFound();

  const address = toSavedAddress(row);
  const safeReturn =
    returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : undefined;

  return (
    <div className="page-container max-w-xl py-10 sm:py-12">
      <nav className="breadcrumb">
        <Link href={ROUTES.accountAddresses}>Addresses</Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">Edit</span>
      </nav>

      <header className="page-header mt-6">
        <h1 className="page-title">Edit address</h1>
        <p className="page-description">Update your saved delivery details.</p>
      </header>

      <div className="surface-card mt-8 p-6 sm:p-8">
        <AddressForm mode="edit" address={address} returnTo={safeReturn} />
      </div>
    </div>
  );
}
