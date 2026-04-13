# RAEYL

RAEYL is the website ownership wallet and control rail for modern websites.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth
- Stripe scaffolding

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Configure:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `TOKEN_ENCRYPTION_KEY`
- Google and Stripe keys if used

4. Run Prisma generate and migrate:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Seed demo data if desired:

```bash
npm run prisma:seed
```

6. Start the app:

```bash
npm run dev
```

## Route Groups

- Marketing:
  - `/`
  - `/product`
  - `/how-it-works`
  - `/for-owners`
  - `/for-developers`
  - `/pricing`
  - `/security`
  - `/faq`
  - `/contact`
- Auth:
  - `/sign-in`
  - `/get-started`
  - `/accept-invite/[token]`
- App:
  - `/app`
  - `/app/onboarding`
  - `/app/wallets/new`
  - `/app/wallets/[walletId]`
  - `/app/wallets/[walletId]/setup`
  - `/app/wallets/[walletId]/websites/new`
  - `/app/wallets/[walletId]/websites/[websiteId]`
  - `/app/wallets/[walletId]/providers`
  - `/app/wallets/[walletId]/providers/new`
  - `/app/wallets/[walletId]/providers/[providerId]`
  - `/app/wallets/[walletId]/billing`
  - `/app/wallets/[walletId]/access`
  - `/app/wallets/[walletId]/handoff`
  - `/app/wallets/[walletId]/alerts`
  - `/app/wallets/[walletId]/activity`
  - `/app/wallets/[walletId]/support`
  - `/app/wallets/[walletId]/settings`
  - `/app/settings/account`
  - `/app/partner`
- Admin:
  - `/admin`
  - `/admin/users`
  - `/admin/wallets`
  - `/admin/subscriptions`
  - `/admin/referrals`

## Notes

- The codebase includes real application structure, real Prisma schema, real server actions, NextAuth wiring, permissions helpers, provider scaffolding, handoff scaffolding, billing scaffolding, and admin foundations.
- Several screens currently render against mock wallet data for product continuity while the database-backed feature services are expanded.
