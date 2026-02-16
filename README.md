# Vibe Coding Class Registration Platform

A production-grade full-stack web app for registering to Vibe Coding classes. Public registration with email confirmation (double opt-in) and an admin dashboard for session and participant management.

## Tech stack

- **Next.js 16** (App Router) + TypeScript
- **PostgreSQL** (Supabase)
- **Prisma ORM** (v6)
- **Auth**: NextAuth.js v5 (Credentials, admin-only)
- **Email**: Resend
- **UI**: Tailwind CSS + shadcn/ui, Framer Motion
- **Validation**: Zod · **Forms**: React Hook Form
- **Deploy**: Vercel

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and set:

- **DATABASE_URL** – PostgreSQL connection string (e.g. Neon, Supabase)
- **AUTH_SECRET** – random secret for NextAuth (e.g. `openssl rand -base64 32`)
- **AUTH_URL** – app URL (e.g. `http://localhost:3000`)
- **RESEND_API_KEY** – from [Resend](https://resend.com)
- **EMAIL_FROM** – sender address (e.g. `Vibe Coding <noreply@yourdomain.com>`)
- **APP_URL** – public app URL (for confirmation links)

Optional for seeding an admin user:

- **ADMIN_EMAIL** – admin login email
- **ADMIN_PASSWORD** – admin password (change after first login)

### 3. Database

```bash
# Run migrations
npx prisma migrate deploy

# Seed admin user (optional; creates admin@example.com / admin123changeme if not set)
npx prisma db seed
```

### 4. Run locally

```bash
npm run dev
```

- Public site: http://localhost:3000  
- Admin: http://localhost:3000/admin (login required)

## Scripts

| Command        | Description                |
|----------------|----------------------------|
| `npm run dev`  | Start dev server           |
| `npm run build`| Build for production       |
| `npm run start`| Start production server    |
| `npm run lint` | Run ESLint                 |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate`  | Run migrations (dev)  |
| `npm run db:seed`     | Seed admin user       |
| `npm run db:push`     | Push schema (no migrations) |

## Deploy (Vercel)

1. Connect the repo to Vercel.
2. Add environment variables (same as `.env.local`).
3. Use **PostgreSQL** from Vercel, Neon, or Supabase and set `DATABASE_URL`.
4. After first deploy, run migrations against the production DB:
   ```bash
   DATABASE_URL="<production-url>" npx prisma migrate deploy
   ```
5. Seed admin user if needed:
   ```bash
   DATABASE_URL="<production-url>" ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npx prisma db seed
   ```

## Resend

- Verify your domain in Resend and set `EMAIL_FROM` to use it.
- `APP_URL` must match your deployed URL so confirmation links work.

## Project structure

- `src/app/(public)/` – public routes (home, sessions, register, confirm)
- `src/app/admin/` – admin dashboard (sessions, participants)
- `src/app/api/public/` – register, confirm, resend-confirmation
- `src/app/api/admin/` – sessions CRUD, participants, manual confirm/cancel
- `src/lib/` – auth, prisma, email, crypto, validations, rate-limit
- `src/components/` – ui, public (SessionCard, Hero, RegistrationForm), admin

## Security

- Admin routes protected by middleware and server-side role check.
- Registration and resend confirmation are rate-limited.
- Confirmation tokens are hashed and single-use (24h TTL).
- Unique (sessionId, email); transactional confirm to avoid overbooking.
