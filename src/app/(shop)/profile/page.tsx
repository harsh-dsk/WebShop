import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import AddressForm from "@/components/profile/address-form";
import { isStoreStaff, isSuperAdmin, requireUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const user = await requireUser();
  const { sessionId, sessionClaims, userId } = await auth();
  const session = {
    isSignedIn: Boolean(userId),
    sessionId,
    clerkUserId: userId,
    user,
    role: user.role,
    isStoreStaff: isStoreStaff(user.role),
    isSuperAdmin: isSuperAdmin(user.role),
  };

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-primary">Your profile</h1>
      <p className="mt-2 text-muted-foreground">
        Account details synced from Clerk and stored in FreshMart.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">
              {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {fullName}
            </h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <dl className="mt-8 space-y-4 text-sm">
          <div className="flex justify-between border-b border-border pb-3">
            <dt className="text-muted-foreground">Role</dt>
            <dd className="font-medium">{user.role}</dd>
          </div>
          <div className="flex justify-between border-b border-border pb-3">
            <dt className="text-muted-foreground">User ID</dt>
            <dd className="font-mono text-xs">{user.id}</dd>
          </div>
          <div className="flex justify-between border-b border-border pb-3">
            <dt className="text-muted-foreground">Clerk ID</dt>
            <dd className="font-mono text-xs">{user.clerkId}</dd>
          </div>
          <div className="flex justify-between border-b border-border pb-3">
            <dt className="text-muted-foreground">Session active</dt>
            <dd className="font-medium">
              {session.isSignedIn ? "Yes" : "No"}
            </dd>
          </div>
          {session.sessionId && (
            <div className="flex justify-between pb-3">
              <dt className="text-muted-foreground">Session ID</dt>
              <dd className="max-w-[12rem] truncate font-mono text-xs">
                {session.sessionId}
              </dd>
            </div>
          )}
        </dl>

        {sessionClaims?.publicMetadata != null ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Clerk public metadata is synced for middleware role checks.
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={ROUTES.accountOrders}>
            <Button variant="outline">My orders</Button>
          </Link>
          <Link href={ROUTES.cart}>
            <Button variant="outline">View cart</Button>
          </Link>
        </div>

        <Link href={ROUTES.accountAddresses} className="mt-8 block">
          <div className="rounded-2xl border border-border bg-muted/50 p-6 transition-all hover:bg-muted hover:shadow-md">
            <h3 className="text-lg font-semibold text-foreground">Saved addresses</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your address book for faster checkout and order delivery.
            </p>
            <div className="mt-4">
              <Button variant="outline" size="sm">
                View address book
              </Button>
            </div>
          </div>
        </Link>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground">Quick profile address</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Legacy single address on your profile. For multiple addresses and checkout,
            use your{" "}
            <Link href={ROUTES.accountAddresses} className="font-medium text-accent hover:underline">
              address book
            </Link>
            .
          </p>
          <AddressForm
            initial={{
              fullName: user.fullName ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`,
              phone: user.phone ?? undefined,
              address: user.address ?? undefined,
              city: user.city ?? undefined,
              state: user.state ?? undefined,
              postalCode: user.postalCode ?? undefined,
            }}
          />
        </div>
      </div>
    </section>
  );
}
