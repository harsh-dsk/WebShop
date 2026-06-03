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
  "/account/blocked",
]);

const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/wishlist(.*)",
  "/cart(.*)",
  "/checkout(.*)",
  "/account(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isSuperAdminRoute = createRouteMatcher(["/super-admin(.*)"]);

const STAFF_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  const metadata = sessionClaims?.publicMetadata as
    | UserPublicMetadata
    | undefined;

  if (userId && metadata?.isBlocked) {
    const blockedUrl = new URL(ROUTES.accountBlocked, request.url);
    if (!request.nextUrl.pathname.startsWith(ROUTES.accountBlocked)) {
      return NextResponse.redirect(blockedUrl);
    }
  }

  if (
    isProtectedRoute(request) ||
    isAdminRoute(request) ||
    isSuperAdminRoute(request)
  ) {
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: request.url });
    }
  }

  const role = metadata?.role;

  if (isSuperAdminRoute(request)) {
    if (role !== "SUPER_ADMIN") {
      const homeUrl = new URL(ROUTES.home, request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  if (isAdminRoute(request)) {
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
