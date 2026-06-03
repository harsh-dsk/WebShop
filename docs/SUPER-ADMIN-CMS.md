# Super Admin CMS

Platform-level control for **SUPER_ADMIN** users: user management, site settings, theme, branding, homepage CMS, and analytics.

## Roles

| Role | Access |
|------|--------|
| **CUSTOMER** | Storefront only |
| **ADMIN** | `/admin` — products, categories, inventory, orders |
| **SUPER_ADMIN** | `/admin` + `/super-admin` — full CMS |

Initial super admins can be seeded via `SUPER_ADMIN_EMAILS` in `.env` (Clerk signup). Roles can then be managed in the CMS.

## Routes

- `/super-admin` — Overview
- `/super-admin/users` — User management
- `/super-admin/settings` — Store info, contact, social, homepage
- `/super-admin/theme` — Colors
- `/super-admin/branding` — Logo & favicon (Cloudinary)
- `/super-admin/analytics` — Revenue, orders, top products, low stock

## Database migration

```bash
npm run db:migrate
# Production / Render:
npm run db:migrate:deploy
```

Adds:

- `users.isBlocked`
- `site_settings` singleton table

On first request, `site_settings` is seeded from `src/config/site.ts` defaults.

## Deployment (Render)

1. Run migrations in build: `npm run db:migrate:deploy && npm run build`
2. Ensure `SUPER_ADMIN_EMAILS` includes your operator email
3. Sign in once to sync Clerk metadata (`role`, `isBlocked`)
4. Open `/super-admin` to customize the store

## Blocked users

Blocked users are redirected to `/account/blocked`. `isBlocked` is stored in Postgres and synced to Clerk `publicMetadata` for edge middleware checks.

## Dynamic storefront

Theme colors, branding, hero, and homepage sections load from `site_settings` via `getRuntimeSiteConfig()`. Static `site.config.ts` remains the fallback seed only.
