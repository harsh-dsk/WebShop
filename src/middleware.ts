import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { ROUTES } from "@/lib/constants/routes";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMITS,
} from "@/lib/rate-limit";
import type { UserPublicMetadata } from "@/types/auth";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/products(.*)",
  "/categories(.*)",
  "/api/webhooks(.*)",
  "/api/recently-viewed(.*)",
  "/account/blocked",
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/wishlist(.*)",
  "/cart(.*)",
  "/checkout(.*)",
  "/account(.*)",
]);

const isApiProtectedRoute = createRouteMatcher([
  "/api/profile(.*)",
  "/api/upload(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isSuperAdminRoute = createRouteMatcher(["/super-admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;
  const ip = getClientIp(request);

  if (isAuthRoute(request)) {
    const authLimit = checkRateLimit(`auth:${ip}`, RATE_LIMITS.auth);
    if (!authLimit.success) {
      return new NextResponse(
        "<!DOCTYPE html><html><head><title>Too many requests</title></head><body><h1>Too many requests</h1><p>Please wait a few minutes and try again.</p></body></html>",
        { status: 429, headers: { "Content-Type": "text/html; charset=utf-8" } },
      );
    }
  }

  if (pathname.startsWith("/api/webhooks/")) {
    const webhookLimit = checkRateLimit(
      `webhook:${ip}`,
      RATE_LIMITS.webhook,
    );
    if (!webhookLimit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  const metadata = sessionClaims?.publicMetadata as
    | UserPublicMetadata
    | undefined;

  if (userId && metadata?.isBlocked) {
    const blockedUrl = new URL(ROUTES.accountBlocked, request.url);
    if (!pathname.startsWith(ROUTES.accountBlocked)) {
      return NextResponse.redirect(blockedUrl);
    }
  }

  if (isApiProtectedRoute(request) && !userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  if (
    isProtectedRoute(request) ||
    isAdminRoute(request) ||
    isSuperAdminRoute(request) ||
    isApiProtectedRoute(request)
  ) {
    if (!userId) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 },
        );
      }
      return redirectToSignIn({ returnBackUrl: request.url });
    }
  }

  if (isSuperAdminRoute(request) || isAdminRoute(request)) {
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
