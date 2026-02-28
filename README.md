# Aurora E-commerce Template

Modern retail storefront for Aurora Studio. Uses `@aurora-studio/sdk` to connect to your Aurora API.

## Setup

1. Copy `.env.example` to `.env.local`
2. Set `NEXT_PUBLIC_AURORA_API_URL` to your Aurora API base URL (e.g. `https://api.yourapp.com`)
3. Set `AURORA_API_KEY` (create in Aurora Studio → API Keys)
4. Run `pnpm dev`

## Deploy to Vercel

From Aurora Studio dashboard: Settings → Storefront → Deploy to Vercel. Env vars are injected automatically.
