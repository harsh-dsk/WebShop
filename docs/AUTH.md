# FreshMart — Authentication

## Overview

| Layer | Implementation |
|-------|------------------|
| Identity | [Clerk](https://clerk.com) (email + Google) |
| Session | Clerk cookies via `clerkMiddleware` |
| Database user | `User` model synced via webhook + `getCurrentUser()` fallback |
| Roles | `CUSTOMER` \| `ADMIN` in Postgres; mirrored in Clerk `publicMetadata.role` |
| Route protection | `src/middleware.ts` + server `requireUser()` / `requireAdmin()` |

## Routes

| Route | Access |
|-------|--------|
| `/` | Public |
| `/sign-in`, `/sign-up` | Public (redirect if signed in — Clerk default) |
| `/profile` | Signed in |
| `/cart`, `/checkout`, `/orders`, `/wishlist` | Signed in (middleware; pages not built yet) |
| `/admin` | Signed in + `ADMIN` role |

## Role assignment

1. New users default to `CUSTOMER` in the database.
2. Emails listed in `ADMIN_EMAILS` (comma-separated) receive `ADMIN` on first sync.
3. Existing users keep their current role on update (admin is not demoted automatically).

## Session flow

1. User signs in via Clerk → session cookie set.
2. Clerk webhook (`/api/webhooks/clerk`) upserts `User` and sets `publicMetadata.role`.
3. If webhook is delayed, `getCurrentUser()` upserts on first server request.
4. Middleware reads `sessionClaims.publicMetadata.role` for `/admin` routes.
5. Admin layout calls `requireAdmin()` against the database (authoritative).

## Local webhook testing

```bash
npm run dev
npx clerk webhooks serve
# Or ngrok: ngrok http 3000 → configure Clerk webhook URL
```

## Key files

- `src/middleware.ts` — Clerk + protected/admin routes
- `src/lib/auth.ts` — `getCurrentUser`, `requireUser`, `requireAdmin`
- `src/lib/clerk-sync.ts` — DB upsert + metadata sync
- `src/app/api/webhooks/clerk/route.ts` — Svix-verified webhook
