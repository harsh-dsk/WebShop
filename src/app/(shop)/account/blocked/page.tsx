import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Account blocked",
  robots: { index: false, follow: false },
};

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { db } from "@/lib/db";

export default async function AccountBlockedPage() {
  const { userId } = await auth();
  const user = userId
    ? await db.user.findUnique({ where: { clerkId: userId } })
    : null;

  if (!user?.isBlocked) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">Your account is active.</p>
        <Link href={ROUTES.home} className="mt-4 inline-block text-accent hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-primary">Account restricted</h1>
      <p className="mt-4 text-muted-foreground">
        Your account has been blocked. If you believe this is a mistake, please
        contact store support.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href={ROUTES.home}>
          <Button variant="outline">Home</Button>
        </Link>
      </div>
    </div>
  );
}
