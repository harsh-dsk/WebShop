export const ROUTES = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  profile: "/profile",
  products: "/products",
  categories: "/categories",
  wishlist: "/wishlist",
  cart: "/cart",
  checkout: "/checkout",
  orders: "/orders",
  admin: "/admin",
  adminProducts: "/admin/products",
  adminCategories: "/admin/categories",
  adminInventory: "/admin/inventory",
} as const;

export const PROTECTED_ROUTES = [
  ROUTES.profile,
  ROUTES.wishlist,
  ROUTES.cart,
  ROUTES.checkout,
  ROUTES.orders,
] as const;

export const ADMIN_ROUTES = [ROUTES.admin] as const;
