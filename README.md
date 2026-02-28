# Aurora E-commerce Showcase Template

A full-featured retail storefront for Aurora Studio. Showcases Aurora capabilities: Meilisearch search, Holmes mission inference, delivery slots, per-store promotions, and multi-step checkout.

**Aurora** is an all-in-one, no-code platform for stores, marketplaces, CRMs, and more.

## Features

- **Location & Store Selection** — Set delivery location on a map, browse nearby stores
- **Meilisearch Search** — Live product search dropdown in header
- **Product Catalogue** — Featured, Bestsellers, New Arrivals, On Sale tabs; category filters
- **Product Detail** — Tabs (Details, Nutrition, Feedback), You May Also Like
- **Basket & Checkout** — Multi-step checkout with delivery slot selection
- **Holmes** — AI mission inference; one-click bundle checkout when enabled
- **Promotions** — Store-specific offers and on-sale products
- **Account** — Profile, Orders, Addresses (integrate Supabase Auth for full features)

## Setup

1. Copy `.env.example` to `.env.local`
2. Configure environment variables (see below)
3. Provision your Aurora tenant with the base schema (see Schema)
4. Run `pnpm dev`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_AURORA_API_URL` | Yes | Aurora API base URL (e.g. `https://api.yourapp.com`) |
| `AURORA_API_KEY` | Yes | API key from Aurora Studio → Settings → API Keys |
| `NEXT_PUBLIC_TENANT_SLUG` | Yes | Your tenant slug (e.g. `acme`) |
| `NEXT_PUBLIC_SITE_NAME` | No | Store name (default: "Store") |
| `NEXT_PUBLIC_LOGO_URL` | No | Logo image URL |
| `NEXT_PUBLIC_ACCENT_COLOR` | No | Accent colour (default: `#38bdf8`) |

## Base Schema

Provision the required tables before using the template:

**Option A — Import in Aurora Studio**  
Data Builder → Import from JSON → use `schema/base-store-schema-import.json`

**Option B — Provision script** (requires tenant admin API key)
```bash
AURORA_API_URL=https://api.yourapp.com AURORA_API_KEY=aur_xxx TENANT_SLUG=your-tenant pnpm schema:provision
```
If you get 401/403, use Option A instead.

**Tables created:** vendors, categories, products, promotions, orders, order_items, product_substitutions, addresses

For **Meilisearch** search to work, enable Meilisearch in Aurora Settings and run an index sync for your products table.

For **delivery slots**, add vendors with `location` (PostGIS), create `vendor_catchments` and `delivery_slots` records. Vendors manage slots in the vendor dashboard.

## Holmes

Holmes is auto-injected when `NEXT_PUBLIC_AURORA_API_URL` and `NEXT_PUBLIC_TENANT_SLUG` are set. It captures behavioural signals and surfaces a mission-based product bundle when confidence is high. Enable Holmes in your tenant commerce config.

For standalone deployment, set `NEXT_PUBLIC_APP_URL` on the Aurora API to your storefront URL so Holmes redirects correctly after one-click checkout.

## Deploy to Vercel

From Aurora Studio: Settings → Storefront → Deploy to Vercel. Env vars are injected automatically.
