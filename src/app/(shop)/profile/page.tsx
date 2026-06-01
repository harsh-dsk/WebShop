import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import type { Metadata } from "next";

import { getSessionSummary, requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const user = await requireUser();
  const session = await getSessionSummary();
  const { sessionClaims } = await auth();

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

        {sessionClaims?.publicMetadata && (
          <p className="mt-4 text-xs text-muted-foreground">
            Clerk public metadata is synced for middleware role checks.
          </p>
        )}
      </div>
    </section>
  );
}
