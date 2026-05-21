# HunarHub

A peer-to-peer skill-matching platform where students teach and learn from each other.

## Tech stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **Prisma ORM** + **PostgreSQL** (Supabase / Neon / local)
- **NextAuth.js (Auth.js v5)** — Google OAuth
- **Socket.io** — real-time messaging (custom Node server)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `AUTH_URL` | `http://localhost:3000` in dev |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (Socket.io CORS) |

### 3. Google OAuth setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Google+ API** / **Google Identity**.
3. Create **OAuth 2.0 Client ID** (Web application).
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret into `.env`.

### 4. Database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. Run the app

```bash
npm run setup:env   # creates/updates .env (AUTH_SECRET, DATABASE_URL, etc.)
npm run db:up       # optional: local Postgres via Docker
npm run db:push     # apply schema to your database
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Troubleshooting

| Error | Fix |
|-------|-----|
| `MissingSecret` / `ClientFetchError` on session | Run `npm run setup:env` and restart `npm run dev` |
| `Can't reach database server` | Start Docker (`npm run db:up`) **or** set `DATABASE_URL` to a [Neon](https://neon.tech) / Supabase connection string |
| Google sign-in disabled | Add real `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env` |
| Real-time chat not updating | Use `npm run dev` (not `npm run dev:next`) — Socket.io needs the custom server |

## Authentication flow

1. User signs in with **Google** on `/sign-in`.
2. **PrismaAdapter** creates a `User` row on first login.
3. **Middleware** checks `session.user.onboardingComplete` (derived from `university`).
4. New users are redirected to **`/onboarding`** to set university and skill tags.
5. After onboarding, users land on **`/browse`**.

## Messaging (`/messages`)

- **Send Request** on a browse card creates a `Conversation` + initial message (`isRequestMode: true`).
- Receiver sees **Accept** / **Decline** sticky actions; on accept, status becomes `ACTIVE` and chat unlocks.
- **Socket.io** delivers new messages instantly (`npm run dev` uses `server.ts` — not `next dev` alone).

```bash
npm run dev          # Next.js + Socket.io on :3000
npm run dev:next     # Next.js only (no real-time)
```

Apply the conversation status migration if upgrading an existing DB:

```bash
npm run db:migrate
```

## Data model

| Model | Purpose |
|-------|---------|
| `User` | Student profile (university, avatar, bio, rating) |
| `Skill` | Canonical skill catalog |
| `UserSkill` | Join table with `CAN_TEACH` / `WANTS_TO_LEARN` |
| `Conversation` | Chat thread (`participantIds`, `status`, `initiatedById`) |
| `Message` | Messages with optional `isRequestMode` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed skill catalog |
| `npm run db:push` | Push schema without migration |

## Project structure

```
src/
  app/              # Routes (pages + API)
  components/       # UI + onboarding + auth
  lib/
    auth/           # NextAuth config + callbacks
    prisma.ts       # DB client singleton
    skills/         # Skill upsert helpers
prisma/
  schema.prisma     # Database schema
```
