# Product catalog (Step 5)

## Customize before deploy

Edit **`src/config/site.ts`** — brand name, logo, hero, navigation, footer, contact, theme colors, currency.

## Roles

| Role | Catalog access |
|------|----------------|
| `ADMIN` | Categories, products, inventory CRUD |
| `SUPER_ADMIN` | Same + future branding/settings |
| `CUSTOMER` | Browse, search, filter |

Env: `SUPER_ADMIN_EMAILS`, `ADMIN_EMAILS`

## Category attribute schema

Optional JSON on each category defines product metadata fields:

```json
[
  { "key": "size", "label": "Size", "type": "text", "required": false },
  { "key": "color", "label": "Color", "type": "select", "options": ["Black", "White"] }
]
```

Values are stored on `Product.metadata` — no hardcoded product columns.

## Routes

| Public | Admin |
|--------|-------|
| `/products` | `/admin/products` |
| `/products/[slug]` | `/admin/products/new`, `.../edit` |
| `/categories` | `/admin/categories` |
| `/categories/[slug]` | `/admin/inventory` |

## Database migration

After pulling schema changes:

```bash
npm run db:migrate
# Name suggestion: platform_catalog_roles_metadata
```

## Cloudinary

Configure `CLOUDINARY_*` in `.env.local`. Admin product form uploads via `POST /api/upload`.
