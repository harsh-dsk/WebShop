export const ROUTES = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  profile: "/profile",
  products: "/products",
  categories: "/categories",
  wishlist: "/account/wishlist",
  cart: "/cart",
  checkout: "/checkout",
  checkoutSuccess: "/checkout/success",
  accountOrders: "/account/orders",
  orders: "/account/orders",
  admin: "/admin",
  adminProducts: "/admin/products",
  adminCategories: "/admin/categories",
  adminInventory: "/admin/inventory",
  adminOrders: "/admin/orders",
} as const;

export const PROTECTED_ROUTES = [
  ROUTES.profile,
  ROUTES.wishlist,
  ROUTES.cart,
  ROUTES.checkout,
  ROUTES.checkoutSuccess,
  ROUTES.accountOrders,
  "/account(.*)",
] as const;

export const ADMIN_ROUTES = [ROUTES.admin] as const;
