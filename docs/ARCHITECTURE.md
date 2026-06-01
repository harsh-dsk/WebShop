# FreshMart — Project Architecture

Production-ready grocery/general-store ecommerce platform for local businesses.

---

## 1. High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
│         Browser (Mobile-first)  │  Admin Dashboard  │  Webhooks          │
└───────────────┬─────────────────┴─────────┬─────────┴──────────┬────────┘
                │                           │                    │
                ▼                           ▼                    ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    Next.js 15 (App Router) — Vercel                        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ RSC Pages   │  │ Server       │  │ API Routes  │  │ Middleware      │ │
│  │ + Client    │  │ Actions      │  │ (REST)      │  │ (Clerk + RBAC)  │ │
│  └─────────────┘  └──────────────┘  └─────────────┘  └─────────────────┘ │
└───────────────┬─────────────────┬─────────────────┬─────────────────────┘
                │                 │                 │
        ┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
        │ Clerk Auth    │ │ Prisma ORM    │ │ Cloudinary    │
        │ (Users/Roles) │ │               │ │ (Images)      │
        └───────────────┘ └───────┬───────┘ └───────────────┘
                                  │
                          ┌───────▼───────┐
                          │ Neon Postgres │
                          └───────────────┘

        ┌─────────────────────────────────────┐
        │ Razorpay (Payments + Webhooks)      │
        └─────────────────────────────────────┘
```

---

## 2. Architectural Principles

| Principle | Implementation |
|-----------|----------------|
| **Server-first** | Product/catalog reads via RSC; mutations via Server Actions where possible |
| **Type safety** | TypeScript end-to-end; Zod at API/action boundaries |
| **Separation** | Route groups for shop vs admin; shared `components/ui` |
| **Security** | Clerk session + `role` in DB; middleware guards; server-side validation on every mutation |
| **Scalability** | Stateless app on Vercel; DB on Neon; images on CDN (Cloudinary) |
| **Sellable** | Single-tenant per deployment; env-driven branding later (Phase 2+) |

---

## 3. Route Groups & URL Map

### 3.1 Public / Shop (`(shop)`)

| Route | Purpose | Auth |
|-------|---------|------|
| `/` | Home — hero, featured categories, bestsellers | Public |
| `/categories` | All categories grid | Public |
| `/categories/[slug]` | Category product listing + filters | Public |
| `/products` | All products + search/filter | Public |
| `/products/[slug]` | Product detail, add to cart | Public |
| `/cart` | Cart review (Zustand + optional DB sync) | Public / Signed-in |
| `/checkout` | Address, summary, Razorpay | Signed-in |
| `/checkout/success` | Payment success | Signed-in |
| `/checkout/failure` | Payment failure | Signed-in |
| `/orders` | Order history | Signed-in |
| `/orders/[id]` | Order detail | Signed-in |
| `/profile` | User profile | Signed-in |

### 3.2 Auth (`(auth)`)

| Route | Purpose |
|-------|---------|
| `/sign-in/[[...sign-in]]` | Clerk sign-in (email + Google) |
| `/sign-up/[[...sign-up]]` | Clerk sign-up |

### 3.3 Admin (`(admin)`)

| Route | Purpose | Auth |
|-------|---------|------|
| `/admin` | Dashboard — KPIs, recent orders | `ADMIN` |
| `/admin/products` | Product list | `ADMIN` |
| `/admin/products/new` | Add product | `ADMIN` |
| `/admin/products/[id]/edit` | Edit product | `ADMIN` |
| `/admin/categories` | Category CRUD | `ADMIN` |
| `/admin/inventory` | Stock levels, low-stock alerts | `ADMIN` |
| `/admin/orders` | Order list | `ADMIN` |
| `/admin/orders/[id]` | Order detail + status update | `ADMIN` |
| `/admin/analytics` | Sales charts | `ADMIN` |

### 3.4 API Routes (`/api`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhooks/clerk` | POST | Sync user create/update/delete |
| `/api/webhooks/razorpay` | POST | Verify payment, update order |
| `/api/upload` | POST | Cloudinary signed upload (admin) |
| `/api/cart/sync` | POST | Persist guest cart to DB (optional) |
| `/api/razorpay/create-order` | POST | Create Razorpay order |
| `/api/razorpay/verify` | POST | Verify signature client callback |
| `/api/products/search` | GET | Typeahead / search (if not RSC-only) |

---

## 4. Authentication & Authorization

### 4.1 Clerk

- **Providers**: Email/password, Google OAuth
- **Webhooks**: `user.created`, `user.updated`, `user.deleted` → upsert/delete `User` in Postgres
- **Public metadata** (optional): `role` mirror for fast middleware checks

### 4.2 Roles

```typescript
enum Role {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
}
```

- Default new users: `CUSTOMER`
- First admin: seed script or manual DB update + Clerk metadata
- Admin promotion: admin-only action or env `ADMIN_EMAILS` on first login

### 4.3 Protection Layers

1. **`middleware.ts`**: Clerk auth; redirect unauthenticated from `/checkout`, `/orders`, `/profile`, `/admin/*`
2. **Admin layout**: Server component checks `user.role === ADMIN`; `notFound()` or redirect if not
3. **Server Actions / API**: `auth()` + role check + Zod parse on every mutation
4. **Razorpay webhook**: HMAC signature verification only (no Clerk)

---

## 5. Data Flow by Feature

### 5.1 Catalog (Read-Heavy)

```
Browser → RSC Page → Prisma (products + category) → Cache (optional: unstable_cache)
```

- Filters/search: URL search params (`?q=&category=&minPrice=&sort=`)
- Pagination: cursor or offset via `searchParams`

### 5.2 Cart (Client State + Optional Persistence)

```
Add to Cart → Zustand (localStorage persist)
Checkout start → Server Action merges cart → DB Cart/CartItem (signed-in user)
```

- Guest: Zustand only until sign-in at checkout
- Signed-in: optional sync to `Cart` table

### 5.3 Checkout & Payment

```
1. User submits checkout form (RHF + Zod)
2. Server Action: validate stock, create Order (PENDING), OrderItems
3. API: create Razorpay order → return orderId + key
4. Client: Razorpay checkout modal
5. Client callback → API verify signature
6. Webhook (authoritative): payment.captured → Order PAID, decrement inventory
```

### 5.4 Admin Product with Images

```
Admin form → Server Action (Zod) → Prisma Product
Image file → /api/upload → Cloudinary → store publicId + url on Product
```

---

## 6. Layer Responsibilities

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Pages** | `src/app/**/page.tsx` | Compose UI, fetch data (RSC), metadata |
| **Layouts** | `src/app/**/layout.tsx` | Shell, nav, auth boundaries |
| **Components** | `src/components/**` | Presentational + feature UI |
| **Server Actions** | `src/actions/**` | Mutations, revalidatePath |
| **API Routes** | `src/app/api/**` | Webhooks, Razorpay, uploads |
| **Services** | `src/lib/services/**` | Business logic (orders, inventory) |
| **Data access** | `src/lib/db.ts` + Prisma | Single Prisma client singleton |
| **Validation** | `src/lib/validations/**` | Zod schemas shared client/server |
| **Stores** | `src/stores/**` | Zustand cart |
| **Hooks** | `src/hooks/**` | Client hooks (debounced search, etc.) |
| **Types** | `src/types/**` | Shared TS types (inferred from Zod where possible) |

---

## 7. Design System (Tailwind)

### 7.1 Tokens (`tailwind.config.ts` + CSS variables)

| Token | Value | Usage |
|-------|-------|-------|
| `background` | Cream `#FAF7F2` | Page background |
| `card` | Beige `#F0EBE3` | Cards, panels |
| `primary` | Dark green `#1B4332` | Buttons, headings, nav |
| `accent` | Orange `#E85D04` | CTAs, badges, sales |
| `muted` | Warm gray | Secondary text |
| `border` | Soft tan | Dividers |

### 7.2 UI Patterns

- **Radius**: `rounded-xl` / `rounded-2xl` for cards and buttons
- **Shadows**: Soft `shadow-sm` on cards; `shadow-md` on hover
- **Typography**: Display font for headings; clean sans for body
- **Components**: shadcn-style primitives in `components/ui` (Button, Input, Card, Badge, Dialog, Select)

---

## 8. External Services Configuration

| Service | Env vars (examples) | Used for |
|---------|---------------------|----------|
| **Neon** | `DATABASE_URL` | Prisma |
| **Clerk** | `NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET` | Auth |
| **Cloudinary** | `CLOUDINARY_*` | Product images |
| **Razorpay** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Payments |
| **App** | `NEXT_PUBLIC_APP_URL` | Webhooks, redirects |

---

## 9. Error Handling & Observability

- **User-facing**: Toast (sonner) for action failures; dedicated error boundaries per route group
- **API**: Consistent `{ error: string, code?: string }` JSON; never leak stack traces
- **Logging**: `console.error` in dev; structured logs in production (Vercel logs)
- **Idempotency**: Razorpay webhook handlers check existing payment id before updating order

---

## 10. Testing Strategy (Roadmap)

| Area | Approach |
|------|----------|
| Validations | Unit tests on Zod schemas |
| Services | Unit tests on order/inventory logic |
| API webhooks | Integration tests with mocked signatures |
| E2E | Playwright for checkout flow (later phase) |

---

## 11. Deployment Topology

```
GitHub → Vercel (Preview + Production)
              │
              ├── ENV: DATABASE_URL (Neon pooled)
              ├── ENV: Clerk, Cloudinary, Razorpay
              └── Build: prisma generate && next build

Neon Postgres ← Prisma Migrate (CI or manual)
Cloudinary ← Direct upload from server/API
Razorpay ← Webhook URL: https://<domain>/api/webhooks/razorpay
Clerk ← Webhook URL: https://<domain>/api/webhooks/clerk
```

---

## 12. Security Checklist

- [ ] All admin routes behind middleware + server role check
- [ ] CSRF: Server Actions default protection; API uses signature/webhook secrets
- [ ] Rate limit upload and payment endpoints (middleware or Vercel)
- [ ] Validate stock server-side before payment
- [ ] Sanitize search inputs; parameterized Prisma queries only
- [ ] Never expose `RAZORPAY_KEY_SECRET` to client
- [ ] Cloudinary upload restricted to authenticated admin

---

## 13. Module Dependency Graph

```
app/(shop)     → components/shop, actions/cart, actions/orders, stores/cart
app/(admin)    → components/admin, actions/products, actions/categories
app/api        → lib/services, lib/razorpay, lib/cloudinary
actions/*      → lib/db, lib/validations, lib/services
middleware     → Clerk only (no Prisma in edge if avoiding DB in middleware)
```

**Note**: Role checks that need DB run in Server Components/Actions, not edge middleware (unless using Clerk `publicMetadata.role`).

---

## 14. Future Extensions (Post-MVP)

- Multi-store / white-label theming via env
- Coupons & promotions
- Email notifications (Resend)
- Delivery slots & address book
- PWA / offline cart
- Inventory reservation during checkout

---

*Document version: 1.0 — Step 1 Architecture. Pending approval before Prisma schema (Step 2).*
