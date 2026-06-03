# Email notifications (Resend)

Order confirmation, status updates, and admin alerts are sent via [Resend](https://resend.com) using [React Email](https://react.email) templates.

## What sends automatically

| Event | Recipient | Trigger |
|-------|-----------|---------|
| Order placed | Customer (`shippingEmail`) | After successful checkout (`placeOrder`) |
| Order placed | Admin (`ADMIN_EMAIL`) | Same as above |
| Status → CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED | Customer | Admin updates status in dashboard |

Checkout and admin flows are unchanged except for non-blocking email calls after the database commit.

Duplicate sends are prevented with a `sent_emails` table (`orderId` + notification type unique).

## Environment variables

Add to `.env.local` (local) and to your Render service **Environment** tab (production):

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | API key from Resend → API Keys |
| `ADMIN_EMAIL` | Yes (for admin alerts) | Inbox for new-order notifications |
| `RESEND_FROM_EMAIL` | Production | Verified sender, e.g. `Storefront <orders@yourdomain.com>` |
| `NEXT_PUBLIC_APP_URL` | Recommended | Public site URL for “View order” links |

If `RESEND_FROM_EMAIL` is omitted, development uses Resend’s sandbox sender (`onboarding@resend.dev`). In production, verify your domain in Resend and set `RESEND_FROM_EMAIL`.

## Database migration

After pulling this feature, apply the schema:

```bash
npm run db:migrate:deploy
```

Or on a fresh dev database:

```bash
npm run db:migrate
```

## Resend setup

1. Create a [Resend](https://resend.com) account.
2. Add and verify your sending domain (DNS records in Resend dashboard).
3. Create an API key and set `RESEND_API_KEY`.
4. Set `RESEND_FROM_EMAIL` to an address on the verified domain.
5. For testing without a domain, use the test API key and `onboarding@resend.dev` (only delivers to your Resend account email).

## Render deployment

1. **Web Service** — connect the Git repo (same as your Next.js app).
2. **Build command:** `npm install && npm run db:migrate:deploy && npm run build`
3. **Start command:** `npm run start`
4. **Environment variables** — copy from `.env.example`, including:
   - `DATABASE_URL`, `DIRECT_URL`
   - Clerk keys
   - `RESEND_API_KEY`, `ADMIN_EMAIL`, `RESEND_FROM_EMAIL`
   - `NEXT_PUBLIC_APP_URL` → your Render URL (e.g. `https://your-app.onrender.com`)
5. Deploy. Place a test order or run the test script (below).

Render runs Node 20+; `postinstall` runs `prisma generate`.

## Local testing

### 1. Dry run (no API calls)

Renders all templates for an existing order:

```bash
npx tsx scripts/test-emails.ts <orderId> --dry-run
```

### 2. Live send (uses Resend)

```bash
npx tsx scripts/test-emails.ts <orderId>
```

This sends confirmation, admin alert, and all five status emails once. Run again on the same order to confirm deduplication (logs should show “Skipping duplicate email”).

### 3. End-to-end via the app

1. Set `RESEND_API_KEY` and `ADMIN_EMAIL` in `.env.local`.
2. Run `npm run db:migrate` and `npm run dev`.
3. Place an order through checkout → customer + admin emails.
4. In **Admin → Orders**, change status through CONFIRMED → DELIVERED → one email per transition.

## Code layout

| Path | Role |
|------|------|
| `src/lib/services/email.service.ts` | Send logic, dedup, Resend client |
| `src/lib/email/` | Config, logging, order → template data |
| `src/emails/` | React Email templates |
| `src/actions/orders.ts` | Hooks after place order / status update |
| `prisma/schema.prisma` | `SentEmail` model |

## Troubleshooting

- **No emails** — Check server logs for `[email]` lines. Confirm `RESEND_API_KEY` is set on Render and redeployed.
- **Admin only missing** — Set `ADMIN_EMAIL`.
- **Resend rejected sender** — Verify domain and `RESEND_FROM_EMAIL`.
- **Links point to localhost** — Set `NEXT_PUBLIC_APP_URL` to your public URL.
