# Vibe Coding Class Registration Platform

A production-grade full-stack web app for registering to Vibe Coding classes. Public registration with email confirmation (double opt-in) and an admin dashboard for session and participant management.

## Tech stack

- **Next.js 16** (App Router) + TypeScript
- **PostgreSQL** (Supabase) via **Drizzle ORM**
- **Auth**: env-based admin (single org); session in signed cookie (**iron-session**)
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
- **IRON_SECRET** – secret for session encryption (32+ chars, e.g. `openssl rand -base64 32`)
- **ADMIN_EMAIL** – admin login email
- **ADMIN_PASSWORD** – admin login password
- **RESEND_API_KEY** – from [Resend](https://resend.com)
- **EMAIL_FROM** – sender address (e.g. `Vibe Coding <noreply@yourdomain.com>`)
- **APP_URL** – public app URL (for confirmation links)

**Note:** `AUTH_SECRET` and `AUTH_URL` are no longer used (auth is env-based admin + iron-session). If they remain in your Vercel project or local `.env` from an older setup, you can remove them.

### 3. Database

```bash
# Generate migrations (after schema changes)
npm run db:generate

# Run migrations
npm run db:migrate

# Or push schema in dev (no migration files)
npm run db:push
```

### 4. Run locally

```bash
npm run dev
```

- Public site: http://localhost:3000  
- Admin: http://localhost:3000/admin (login with ADMIN_EMAIL / ADMIN_PASSWORD)

## Scripts

| Command              | Description                    |
|----------------------|--------------------------------|
| `npm run dev`        | Start dev server               |
| `npm run build`      | Build for production           |
| `npm run start`      | Start production server        |
| `npm run lint`       | Run ESLint                     |
| `npm run db:generate`| Generate Drizzle migrations    |
| `npm run db:migrate` | Run migrations                 |
| `npm run db:push`    | Push schema (dev, no migrations)|

## Deploy (Vercel)

1. Connect the repo to Vercel.
2. Add environment variables (same as `.env.local`).
3. Use **PostgreSQL** from Vercel, Neon, or Supabase and set `DATABASE_URL`.
4. After first deploy, run migrations against the production DB:
   ```bash
   DATABASE_URL="<production-url>" npm run db:migrate
   ```

## Resend

- Verify your domain in Resend and set `EMAIL_FROM` to use it.
- `APP_URL` must match your deployed URL so confirmation links work.

## Project structure

- `src/app/(public)/` – public routes (home, sessions, register, confirm)
- `src/app/admin/` – admin dashboard (sessions, participants)
- `src/app/api/public/` – register, confirm, resend-confirmation
- `src/app/api/admin/` – sessions CRUD, participants, manual confirm/cancel
- `src/db/` – Drizzle client and schema
- `src/lib/` – session (iron-session), email, crypto, validations, rate-limit
- `src/components/` – ui, public (SessionCard, Hero, RegistrationForm), admin

## Security

- Admin routes protected by proxy; session via iron-session (IRON_SECRET).
- Registration and resend confirmation are rate-limited.
- Confirmation tokens are hashed and single-use (24h TTL).
- Unique (sessionId, email); transactional confirm to avoid overbooking.
