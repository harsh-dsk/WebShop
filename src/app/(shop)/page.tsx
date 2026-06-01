import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";

export default async function HomePage() {
  const { userId } = await auth();
  const user = userId ? await getCurrentUser() : null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="rounded-3xl border border-border bg-card p-8 sm:p-12">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">
          Local grocery, delivered fresh
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Welcome to FreshMart
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          {user
            ? `Signed in as ${user.firstName ?? user.email}. Your account is ready — catalog and checkout arrive in the next build phase.`
            : "Sign in or create an account to access your profile and future orders."}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {user ? (
            <>
              <Link href={ROUTES.profile}>
                <Button size="lg">View profile</Button>
              </Link>
              {user.role === "ADMIN" && (
                <Link href={ROUTES.admin}>
                  <Button variant="accent" size="lg">
                    Admin area
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href={ROUTES.signIn}>
                <Button size="lg">Sign in</Button>
              </Link>
              <Link href={ROUTES.signUp}>
                <Button variant="accent" size="lg">
                  Create account
                </Button>
              </Link>
            </>
          )}
        </div>

        {user && (
          <p className="mt-6 text-sm text-muted-foreground">
            Role:{" "}
            <span className="font-medium text-foreground">{user.role}</span>
          </p>
        )}
      </div>
    </section>
  );
}
