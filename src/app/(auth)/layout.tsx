import Link from "next/link";
import { Leaf } from "lucide-react";

import { ROUTES } from "@/lib/constants/routes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <Link
          href={ROUTES.home}
          className="mx-auto flex max-w-md items-center justify-center gap-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-xl font-semibold text-primary">FreshMart</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} FreshMart
      </footer>
    </div>
  );
}
