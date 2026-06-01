export const ROUTES = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  profile: "/profile",
  wishlist: "/wishlist",
  cart: "/cart",
  checkout: "/checkout",
  orders: "/orders",
  admin: "/admin",
} as const;

/** Routes that require a signed-in Clerk session */
export const PROTECTED_ROUTES = [
  ROUTES.profile,
  ROUTES.wishlist,
  ROUTES.cart,
  ROUTES.checkout,
  ROUTES.orders,
] as const;

/** Routes that require ADMIN role */
export const ADMIN_ROUTES = [ROUTES.admin] as const;

/** Routes accessible without authentication */
export const PUBLIC_ROUTE_PATTERNS = [
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
] as const;
