import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
};

/**
 * Minimal admin entry point — role guard only.
 * Full dashboard is implemented in a later phase.
 */
export default async function AdminPage() {
  const user = await getCurrentUser();

  return (
    <div className="rounded-2xl border border-border bg-card p-8">
      <h1 className="text-2xl font-bold text-primary">Admin access granted</h1>
      <p className="mt-2 text-muted-foreground">
        Signed in as <strong>{user?.email}</strong> with role{" "}
        <strong>{user?.role}</strong>. Product, order, and analytics tools
        will be added in future steps.
      </p>
    </div>
  );
}
