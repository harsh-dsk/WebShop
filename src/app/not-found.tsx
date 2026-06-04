import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="empty-state max-w-md border-solid bg-card shadow-card">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <FileQuestion className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">404</h1>
        <p className="mt-2 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href={ROUTES.home} className="mt-8">
          <Button size="lg">Go home</Button>
        </Link>
      </div>
    </div>
  );
}
