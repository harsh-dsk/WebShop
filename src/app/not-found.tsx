import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-primary">404</h1>
      <p className="mt-2 text-muted-foreground">Page not found</p>
      <Link href={ROUTES.home} className="mt-6">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
