# Phase 6 — Admin catalog management

## Scope

| Feature | Route |
|---------|--------|
| Dashboard | `/admin` |
| Categories CRUD | `/admin/categories` |
| Products CRUD | `/admin/products` |
| Cloudinary uploads | Product form + category form + `POST /api/upload` |
| Inventory | `/admin/inventory` |

**Not in Phase 6:** cart, checkout, orders, payments, coupons, discounts.

## Product model

| Field | Purpose |
|-------|---------|
| `images[]` | Multiple Cloudinary images (reorderable) |
| `variants[]` | `ProductVariant` — name, SKU, price override, stock |
| `metadata` | Category-driven attributes (JSON) |
| `tags[]` | Comma-separated labels |
| `shortDescription` | Listing cards |
| `description` / `descriptionHtml` | Plain + rich HTML |
| `metaTitle` / `metaDescription` | SEO |

## Roles

- **ADMIN** — full Phase 6 admin access
- **SUPER_ADMIN** — same + future branding UI
- Branding remains in `src/config/site.ts` (developer-only)

## Migration

```bash
npm run db:migrate
# Suggested name: phase6_product_variants_seo
```

Adds: `ProductVariant`, product SEO/tags/rich fields. Removes hardcoded `unit` if migrating from older schema.

## Customize deployment

Edit `src/config/site.ts` before each client deploy — never in admin panel.
