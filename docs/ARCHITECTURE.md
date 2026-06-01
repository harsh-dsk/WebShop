# Ecommerce Platform — Architecture

**Reusable single-tenant template** — one codebase, customized per deployment for any retail business (general store, electronics, clothing, cosmetics, pet store, hardware, etc.).

Branding lives in `src/config/site.ts`. Business logic is category-driven with flexible product `metadata`.

---

## 1. Platform model

| Concept | Approach |
|---------|----------|
| **Deployment** | One git repo → customize `site.ts` → deploy to Vercel + Neon |
| **Catalog** | Categories define optional `attributeSchema`; products store values in `metadata` JSON |
| **Terminology** | No grocery-specific copy in code; all customer-facing text from `siteConfig` |
| **Roles** | `SUPER_ADMIN` (developer) · `ADMIN` (store owner) · `CUSTOMER` |

---

## 2. Roles & permissions

### SUPER_ADMIN (Developer)

- Full platform control (future: branding DB overrides)
- **Controls:** logo, brand name, theme, hero, banners, navigation, footer, contact, global settings
- **Also has:** all `ADMIN` capabilities

### ADMIN (Store owner)

- Products, images, categories, inventory, orders, customers, coupons, discounts *(orders/coupons in later phases)*
- **Cannot:** change branding, theme, homepage layout, navigation structure, core platform settings

### CUSTOMER

- Browse, search, filter, product details
- Cart, checkout, orders *(later phases)*

### Enforcement

| Layer | Mechanism |
|-------|-----------|
| Middleware | Clerk session; `/admin` requires staff role in metadata |
| Server | `requireStoreStaff()` / `requireSuperAdmin()` + Prisma role |
| Actions | Role check on every mutation |

---

## 3. Branding configuration

All customizable without code changes (defaults in repo):

```text
src/config/site.ts
  ├── brand (name, tagline, description)
  ├── logo (text or image)
  ├── theme (colors → CSS variables)
  ├── hero (title, CTAs, image)
  ├── navigation.main[]
  ├── footer (columns, copyright)
  ├── contact
  └── catalog (pagination, sort defaults)
```

Future: `SUPER_ADMIN` UI persists overrides; until then, developers edit `site.ts` before deploy.

---

## 4. Product system

```text
Category
  ├── attributeSchema: [{ key, label, type, options?, required? }]
  └── products[]

Product
  ├── categoryId (required)
  ├── price, stock, images (Cloudinary JSON)
  └── metadata: { [key]: value }  ← validated against category schema
```

No hardcoded fields like `unit` or `weight` — use category schema + metadata.

---

## 5. Route map (summary)

| Area | Routes | Auth |
|------|--------|------|
| Shop | `/`, `/products`, `/products/[slug]`, `/categories`, `/categories/[slug]` | Public |
| Account | `/profile`, `/orders`, `/cart` | Signed in |
| Admin | `/admin/products`, `/admin/categories`, `/admin/inventory` | `ADMIN` \| `SUPER_ADMIN` |
| Platform | `/admin/settings` *(future)* | `SUPER_ADMIN` only |
| Auth | `/sign-in`, `/sign-up` | Public |

---

## 6. Tech stack

Next.js 15 App Router · TypeScript · Tailwind · Prisma · Neon · Clerk · Cloudinary · Razorpay *(payments later)*

---

## 7. Design principles

- Premium, mobile-first UI; reusable `components/ui` + shop/admin feature components
- Server Components for catalog reads; Server Actions for admin mutations
- SEO: metadata API per product/category page

---

*See `docs/FOLDER-STRUCTURE.md`, `docs/SETUP.md`, `docs/AUTH.md`.*
