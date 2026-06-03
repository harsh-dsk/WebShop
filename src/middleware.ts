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

  if (isSuperAdminRoute(request) || isAdminRoute(request)) {
    // Route-level authorization is enforced in server components via
    // requireStoreStaff() / requireSuperAdmin(), so middleware only requires
    // sign-in here to avoid stale Clerk metadata blocking valid users.
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: request.url });
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
