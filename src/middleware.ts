import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { ROUTES } from "@/lib/constants/routes";
import type { UserPublicMetadata } from "@/types/auth";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/products(.*)",
  "/categories(.*)",
  "/api/webhooks(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/wishlist(.*)",
  "/cart(.*)",
  "/checkout(.*)",
  "/orders(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const STAFF_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  if (isProtectedRoute(request) || isAdminRoute(request)) {
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: request.url });
    }
  }

  if (isAdminRoute(request)) {
    const metadata = sessionClaims?.publicMetadata as
      | UserPublicMetadata
      | undefined;
    const role = metadata?.role;

    if (role && !STAFF_ROLES.has(role)) {
      const homeUrl = new URL(ROUTES.home, request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
