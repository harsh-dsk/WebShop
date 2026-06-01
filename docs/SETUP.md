# FreshMart — Step 3: Project Setup

Installation, dependencies, and third-party service configuration. **No application code in this step.**

---

## Prerequisites

| Tool | Version |
|------|---------|
| **Node.js** | 20 LTS or newer |
| **npm** | 10+ (or pnpm/yarn) |
| **Git** | Latest |
| **Accounts** | [Neon](https://neon.tech), [Clerk](https://clerk.com), [Cloudinary](https://cloudinary.com), [Razorpay](https://razorpay.com), [Vercel](https://vercel.com) (deployment) |

---

## 1. Installation commands

Run from the project root (`WebShop/`).

### 1.1 Clone & enter project

```bash
cd C:\Users\user\WebShop
```

### 1.2 Install dependencies

```bash
npm install
```

This installs all packages from `package.json` and runs `postinstall` → `prisma generate`.

### 1.3 Environment file

```bash
# macOS / Linux
cp .env.example .env.local

# Windows PowerShell
Copy-Item .env.example .env.local
```

Fill in every value in `.env.local` using the sections below before running migrations.

### 1.4 Prisma — generate client & run migrations

```bash
# Generate Prisma Client (also runs on postinstall)
npm run db:generate

# Create and apply migrations (development)
npm run db:migrate
# When prompted, name the first migration: init

# Alternative: push schema without migration files (prototyping only)
# npm run db:push

# Open Prisma Studio (visual DB browser)
npm run db:studio
```

### 1.5 Production build (after app code exists)

```bash
npm run build
npm run start
```

### 1.6 Useful npm scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Dev server | `npm run dev` | Next.js on http://localhost:3000 |
| DB migrate | `npm run db:migrate` | Dev migrations |
| DB deploy | `npm run db:migrate:deploy` | Production migrations (CI/Vercel) |
| DB push | `npm run db:push` | Sync schema without migration files |
| DB studio | `npm run db:studio` | GUI for Postgres |
| DB seed | `npm run db:seed` | Seed data (after `prisma/seed.ts` is added) |
| DB reset | `npm run db:reset` | Reset DB + re-migrate + seed |

---

## 2. Required dependencies

Defined in `package.json`.

### 2.1 Runtime (`dependencies`)

| Package | Purpose |
|---------|---------|
| `next` | Next.js 15 App Router |
| `react`, `react-dom` | UI runtime |
| `typescript` | Types (also used at build) |
| `@prisma/client` | Database ORM client |
| `@clerk/nextjs` | Auth (signup, login, Google, middleware) |
| `cloudinary` | Server-side image upload & transforms |
| `razorpay` | Payment order creation & verification |
| `zustand` | Client cart state |
| `react-hook-form` | Form state |
| `@hookform/resolvers` | Zod ↔ RHF bridge |
| `zod` | Schema validation |
| `svix` | Verify Clerk webhook signatures |
| `sonner` | Toast notifications |
| `clsx`, `tailwind-merge`, `class-variance-authority` | Styling utilities |
| `lucide-react` | Icons |

### 2.2 Development (`devDependencies`)

| Package | Purpose |
|---------|---------|
| `prisma` | CLI — migrate, generate, studio |
| `tailwindcss`, `postcss`, `autoprefixer` | CSS (configured in a later step) |
| `eslint`, `eslint-config-next` | Linting |
| `@types/node`, `@types/react`, `@types/react-dom` | Type definitions |
| `tsx` | Run `prisma/seed.ts` |

### 2.3 Install a single package later

```bash
npm install <package-name>
npm install -D <dev-package-name>
```

---

## 3. Neon PostgreSQL setup

### 3.1 Create database

1. Sign in at [https://console.neon.tech](https://console.neon.tech)
2. **New Project** → name e.g. `freshmart`
3. Region: choose closest to your users (e.g. `ap-southeast-1` for India)
4. Postgres version: **16** (recommended)

### 3.2 Connection strings

1. Open project → **Dashboard** → **Connect**
2. Copy **Pooled connection** → set as `DATABASE_URL` in `.env.local`
3. Copy **Direct connection** → set as `DIRECT_URL` in `.env.local`

Both URLs must include `?sslmode=require` (Neon adds this by default).

Example shape:

```env
DATABASE_URL=postgresql://neondb_owner:***@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://neondb_owner:***@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### 3.3 Apply schema

```bash
npm run db:migrate
```

Verify tables in Neon **Tables** view or:

```bash
npm run db:studio
```

### 3.4 Vercel + Neon (deployment)

1. Vercel project → **Storage** → **Connect Neon** (or paste env vars manually)
2. Set `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) for **Production** and **Preview**
3. Add build step env: migrations run via `prisma migrate deploy` in CI or a post-build script (roadmap Step 4)

---

## 4. Clerk authentication setup

### 4.1 Create application

1. [https://dashboard.clerk.com](https://dashboard.clerk.com) → **Add application**
2. Name: `FreshMart`
3. Enable sign-in methods:
   - **Email** (password or email code — your choice)
   - **Google** → Configure OAuth (Clerk provides defaults; add your Google Cloud OAuth credentials if using custom)

### 4.2 API keys

**Configure** → **API Keys**:

| Variable | Clerk field |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Publishable key |
| `CLERK_SECRET_KEY` | Secret key |

Add to `.env.local`.

### 4.3 Paths (match FreshMart routes)

**Configure** → **Paths** (or set via env — recommended for portability):

| Env variable | Value |
|--------------|-------|
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/` |

### 4.4 Google login

1. **User & Authentication** → **Social connections** → **Google** → Enable
2. For production custom branding: [Google Cloud Console](https://console.cloud.google.com) → OAuth 2.0 Client → add Clerk redirect URIs from Clerk dashboard

### 4.5 Webhook (sync User table)

1. **Configure** → **Webhooks** → **Add Endpoint**
2. **Endpoint URL** (local dev uses a tunnel):

   ```text
   https://<your-domain>/api/webhooks/clerk
   ```

   Local development with [ngrok](https://ngrok.com) or [Clerk CLI](https://clerk.com/docs/testing/webhooks):

   ```bash
   npx clerk webhooks serve
   # or: ngrok http 3000 → use https URL + /api/webhooks/clerk
   ```

3. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy **Signing Secret** → `CLERK_WEBHOOK_SECRET`

### 4.6 Admin users

Set in `.env.local`:

```env
ADMIN_EMAILS=owner@yourstore.com,manager@yourstore.com
```

On first webhook sync, matching emails receive `role: ADMIN` in Postgres (implemented in a later step).

### 4.7 Vercel

Add all `CLERK_*` and `NEXT_PUBLIC_CLERK_*` variables. Set production webhook URL to `https://your-domain.com/api/webhooks/clerk`.

---

## 5. Cloudinary image upload setup

### 5.1 Account

1. [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
2. Note from **Dashboard** → **Account Details**:
   - Cloud name → `CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET` (server only)

### 5.2 Upload folder (recommended)

Set optional env:

```env
CLOUDINARY_FOLDER=freshmart/products
```

Server upload code (later) will use folder `freshmart/products/{productId}/`.

### 5.3 Security

- **Never** put `CLOUDINARY_API_SECRET` in client code or `NEXT_PUBLIC_*`
- Admin-only upload via `/api/upload` (implemented later)
- Enable **Restricted image types** in Cloudinary settings if desired (jpg, png, webp)

### 5.4 Optional: upload preset

For unsigned browser uploads (not required for admin server upload):

1. **Settings** → **Upload** → **Upload presets** → Add preset
2. Signing mode: **Unsigned** (only if you accept the security tradeoff)
3. Set `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

### 5.5 Vercel

Add `CLOUDINARY_*` server variables; add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` if needed on client.

---

## 6. Razorpay payment setup

### 6.1 Account

1. Register at [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Complete KYC for **Live** mode; use **Test Mode** for development

### 6.2 API keys

**Settings** → **API Keys** → Generate / view Test keys:

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Key ID — used in checkout modal (browser) |
| `RAZORPAY_KEY_ID` | Same Key ID — server order creation |
| `RAZORPAY_KEY_SECRET` | **Server only** — never expose to client |

### 6.3 Webhook

1. **Settings** → **Webhooks** → **Add New Webhook**
2. URL:

   ```text
   https://<your-domain>/api/webhooks/razorpay
   ```

   Local: tunnel to `http://localhost:3000/api/webhooks/razorpay`

3. Active events (minimum):
   - `payment.captured`
   - `payment.failed`
   - `order.paid` (if using Razorpay Orders API)
4. Copy **Webhook Secret** → `RAZORPAY_WEBHOOK_SECRET`

### 6.4 Currency

```env
RAZORPAY_CURRENCY=INR
```

Amounts in paise (integer) when calling Razorpay API — e.g. ₹199.00 → `19900`.

### 6.5 Test cards (Test Mode)

| Method | Details |
|--------|---------|
| Card | `4111 1111 1111 1111`, any future expiry, any CVV |
| UPI | `success@razorpay` |

Docs: [https://razorpay.com/docs/payments/payments/test-card-upi-details](https://razorpay.com/docs/payments/payments/test-card-upi-details)

### 6.6 Vercel

Set `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` only for **Production**/**Preview** server env (not `NEXT_PUBLIC_`).

---

## 7. Prisma setup

### 7.1 Schema location

`prisma/schema.prisma` — models: User, Category, Product, Cart, CartItem, Wishlist, WishlistItem, Order, OrderItem.

### 7.2 Workflow

```bash
# 1. Ensure DATABASE_URL and DIRECT_URL are set in .env.local

# 2. Generate client
npm run db:generate

# 3. Create migration from schema
npm run db:migrate

# 4. (Optional) Seed — after prisma/seed.ts is added in a later step
npm run db:seed
```

### 7.3 Production migrations

```bash
npm run db:migrate:deploy
```

Run in CI or once per deploy before/with `next build`.

### 7.4 Vercel build integration (recommended)

In `package.json`, `build` already includes:

```json
"build": "prisma generate && next build"
```

Add to Vercel **Build Command** or use default `npm run build`.

For migrations on deploy, either:

- Run `npx prisma migrate deploy` in Vercel **Build** command:

  ```bash
  npx prisma migrate deploy && prisma generate && next build
  ```

- Or use Neon “migrate on deploy” integration

### 7.5 Troubleshooting

| Issue | Fix |
|-------|-----|
| `Can't reach database` | Check Neon IP allowlist (default: open); verify `sslmode=require` |
| Migrate fails with pooler | Use `DIRECT_URL` for migrations (already in schema) |
| Client out of sync | Run `npm run db:generate` after schema changes |

---

## 8. Local development checklist

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local
# Fill all variables (Neon, Clerk, Cloudinary, Razorpay)

# 3. Database
npm run db:migrate

# 4. (When app exists) Run dev server
npm run dev
```

### 8.1 Tunnel for webhooks (local)

```bash
# Terminal 1
npm run dev

# Terminal 2 — example with ngrok
ngrok http 3000
```

Update Clerk and Razorpay webhook URLs to:

- `https://<subdomain>.ngrok-free.app/api/webhooks/clerk`
- `https://<subdomain>.ngrok-free.app/api/webhooks/razorpay`

Set `NEXT_PUBLIC_APP_URL` to the same ngrok HTTPS URL while testing webhooks.

---

## 9. Vercel deployment env summary

Add these in **Project → Settings → Environment Variables**:

| Variable | Environments |
|----------|----------------|
| `DATABASE_URL` | Production, Preview |
| `DIRECT_URL` | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | Production (`https://your-domain.com`), Preview |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | All |
| `CLERK_SECRET_KEY` | All |
| `CLERK_WEBHOOK_SECRET` | Production, Preview |
| `NEXT_PUBLIC_CLERK_*_URL` | All |
| `ADMIN_EMAILS` | Production |
| `CLOUDINARY_*` | All (secret server-only) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | All (if needed) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | All |
| `RAZORPAY_KEY_ID` | All |
| `RAZORPAY_KEY_SECRET` | Production |
| `RAZORPAY_WEBHOOK_SECRET` | Production, Preview |
| `RAZORPAY_CURRENCY` | All |

---

## 10. What comes next (Step 4)

- Phased implementation roadmap
- `prisma/seed.ts`, Next.js config, Tailwind theme
- Feature build order (auth → catalog → cart → checkout → admin)

---

*Step 3 complete. Approve to proceed to Step 4 (roadmap only).*
