# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Start dev server (runs on port 3001)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

No lint or test scripts are currently configured.

## Environment Setup

Copy `.env.example` to `.env` and fill in values:
- `NUXT_AUTH_SECRET` — JWT signing secret
- `MONGODB_URI` — MongoDB connection string (defaults to `mongodb://localhost:27017/quick-recipes`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional Google OAuth
- `JWT_SECRET` — separate JWT secret used for token operations

Seed the database after starting the dev server:
```bash
curl -X POST http://localhost:3001/api/seed-data
```

## Architecture

This is a **Nuxt 4** app using the `/app` directory convention (not `/src`). The Nitro server handles all backend logic within the same repo.

### Directory Layout

- `app/` — Vue frontend (pages, components, composables, layouts, middleware)
- `server/` — Nitro API routes and server utilities
- `types/index.ts` — Shared TypeScript interfaces used by both frontend and server
- `nuxt.config.ts` — Modules: `@nuxtjs/tailwindcss`, `@pinia/nuxt`, `@vueuse/nuxt`

### Authentication

Auth is custom-built (not using `@sidebase/nuxt-auth` despite it being listed as a dependency). The flow:
- Server: `server/utils/auth.ts` — JWT creation/verification via `jose`, cookie management (`qr-auth-token`, HTTP-only, 48h expiry)
- Server: `server/api/middleware/auth.ts` — extracts and verifies the token for protected API routes
- Client: `app/composables/useSimpleAuth.ts` — calls `/api/auth/me` to check session; exposes `user`, `status`, `signOut`, `checkAuth`
- Route guard: `app/middleware/auth.ts` — protects `/recipes/create`, `/profile`, `/my-recipes`

### Database

MongoDB accessed via `server/utils/db.ts` — singleton `MongoClient` with lazy connection. Collections: `users`, `recipes`, `ingredients`. Text indexes on `recipes.title`/`recipes.description` and `ingredients.name` power the search endpoints.

### State & Data

- Local draft saving during recipe creation uses `app/composables/useLocalData.ts`
- Dark mode is managed via `app/composables/useDarkMode.ts`; Tailwind is configured with `darkMode: 'class'`
- Pinia is available but composables handle most state

### Key API Conventions

- All API files follow Nuxt's file-based routing: `server/api/recipes/[id].get.ts` → `GET /api/recipes/:id`
- Auth-required endpoints call `getAuthenticatedUser(event)` from `server/utils/auth.ts` and return 401 if null
- Recipe macros (calories, protein, carbs) are stored directly on the recipe document — they are calculated at creation time from ingredient data, not computed on read
