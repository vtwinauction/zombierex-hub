# ZOMBIEREX

> Precision social for motorcycle & automotive culture.

ZOMBIEREX is a premium, mobile-first social platform engineered for riders and drivers. It blends short-form video, an editorial feed, a "Digital Garage" profile, marketplace ("The Vault"), events, messaging, and community signals into a single, cohesive product with a distinctive **Obsidian & Signal** design system.

This repository contains the **visual prototype** (frontend + mock data) of ZOMBIEREX, built on **TanStack Start** and deployed as a PWA-ready web application.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Vision & Objectives](#2-vision--objectives)
3. [Technology Stack](#3-technology-stack)
4. [Folder & Architecture Structure](#4-folder--architecture-structure)
5. [Installation](#5-installation)
6. [Environment Variables](#6-environment-variables)
7. [Build & Deployment](#7-build--deployment)
8. [Authentication Flow](#8-authentication-flow)
9. [Database Structure](#9-database-structure)
10. [API Documentation](#10-api-documentation)
11. [State Management](#11-state-management)
12. [Third-Party Services](#12-third-party-services)
13. [Push Notifications](#13-push-notifications)
14. [Storage Architecture](#14-storage-architecture)
15. [Security](#15-security)
16. [Performance](#16-performance)
17. [Testing](#17-testing)
18. [Troubleshooting](#18-troubleshooting)
19. [Roadmap](#19-roadmap)

---

## 1. Project Overview

ZOMBIEREX is a cross-platform, mobile-first social network for motorcycle and automotive enthusiasts. The current build is a **visual prototype** — all screens, interactions, and offline behaviors work end-to-end against a local mock data layer. A real backend (Lovable Cloud / Supabase) is planned for the next phase.

Core surfaces:

- **Feed / Broadcast** (`/`) — editorial masthead + short-form video reels + community signals.
- **Search / Signal Index** (`/search`) — pilots, garages, tags.
- **Marketplace / The Vault** (`/marketplace`) — curated listings.
- **Events** (`/events`) — meets, races, rides.
- **Messages** (`/messages`) — 1:1 and club threads.
- **Notifications / System Log** (`/notifications`).
- **Profile / Digital Garage** (`/profile`) — machines, stats, achievements.

## 2. Vision & Objectives

**Vision.** The world's most premium social platform for riders and drivers — designed with the rigor of Apple / Porsche / Rivian / Nothing, but tuned for gearheads.

**Objectives.**

- Deliver a distinctive, non-templated visual identity ("Obsidian & Signal").
- Prioritize short-form video and community signals over generic timelines.
- Treat every user's machine as the hero — not the user's face.
- Ship as a mobile-first PWA first, wrap for native later.
- Design for offline-first interactions (queue, retry, sync).

## 3. Technology Stack

| Layer            | Choice                                                       |
| ---------------- | ------------------------------------------------------------ |
| Framework        | TanStack Start v1 (SSR + file-based routing)                 |
| Build tool       | Vite 7                                                       |
| UI               | React 19 + TypeScript (strict)                               |
| Styling          | Tailwind CSS v4 (via `@tailwindcss/vite`), CSS custom props  |
| Component base   | shadcn/ui + Radix primitives                                 |
| Data fetching    | TanStack Query 5                                             |
| Routing          | TanStack Router (file-based, `src/routes/`)                  |
| Icons            | Custom `RexIcons` SVG family + `lucide-react` (fallback)     |
| Fonts            | Instrument Serif · Work Sans · JetBrains Mono (Google Fonts) |
| Runtime target   | Cloudflare Workers (edge, `nodejs_compat`)                   |
| Package manager  | bun                                                          |
| Planned backend  | Lovable Cloud (Supabase: Postgres + Auth + Storage + Edge)   |

## 4. Folder & Architecture Structure

```text
zombierex/
├── src/
│   ├── routes/               # File-based routes (TanStack Router)
│   │   ├── __root.tsx        # App shell, <head>, providers
│   │   ├── index.tsx         # Broadcast feed
│   │   ├── search.tsx        # Signal Index
│   │   ├── marketplace.tsx   # The Vault
│   │   ├── events.tsx
│   │   ├── messages.tsx
│   │   ├── notifications.tsx
│   │   └── profile.tsx       # Digital Garage
│   ├── components/
│   │   ├── icons/RexIcons.tsx    # Custom SVG icon family
│   │   ├── ui/                   # shadcn primitives
│   │   ├── InteractionBar.tsx    # Offline-capable social bar
│   │   ├── BottomNav.tsx
│   │   ├── StatusBar.tsx / StatusHUD.tsx
│   │   ├── Reel.tsx / TelemetryPost.tsx
│   │   ├── StoriesRail.tsx / SideRail.tsx / FeedHeader.tsx
│   │   ├── RiderBadge.tsx        # Metallic status tags
│   │   └── hud.tsx               # HUD primitives
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── useInteractionState.ts
│   ├── lib/
│   │   ├── interaction-queue.ts  # Offline mutation queue
│   │   ├── mock-data.ts          # Prototype fixtures
│   │   ├── error-capture.ts
│   │   ├── error-page.ts
│   │   ├── lovable-error-reporting.ts
│   │   └── utils.ts
│   ├── assets/                   # Local images (imported)
│   ├── router.tsx                # Router factory (QueryClient in context)
│   ├── start.ts                  # TanStack Start client entry
│   ├── server.ts                 # SSR entry
│   ├── styles.css                # Design tokens + global CSS
│   └── routeTree.gen.ts          # AUTO-GENERATED — do not edit
├── docs/                         # Extended documentation
├── public/                       # Static assets served as-is
├── vite.config.ts
├── tsconfig.json
├── components.json               # shadcn config
├── package.json
├── README.md
└── CHANGELOG.md
```

### Architectural principles

- **File-based routing.** One file per screen under `src/routes/`. No `src/pages/`.
- **Design tokens first.** All color / radius / shadow values are defined as CSS custom properties in `src/styles.css`. Components consume tokens, never raw hex.
- **Offline-optimistic.** All mutations flow through the interaction queue (`src/lib/interaction-queue.ts`) with localStorage persistence and exponential-backoff retry.
- **Server-safe by default.** No direct `window`/`localStorage` reads at module scope; all browser APIs are guarded for SSR.

## 5. Installation

Prerequisites: **bun ≥ 1.1** (or npm/pnpm), Node ≥ 20.

```bash
git clone <repo-url> zombierex
cd zombierex
bun install
bun run dev
```

The dev server starts on `http://localhost:8080`.

## 6. Environment Variables

The prototype does not require any secrets. Variables become relevant when Lovable Cloud is enabled.

| Variable                       | Scope        | Purpose                                   |
| ------------------------------ | ------------ | ----------------------------------------- |
| `VITE_SUPABASE_URL`            | client + SSR | Public Supabase project URL               |
| `VITE_SUPABASE_PUBLISHABLE_KEY`| client + SSR | Publishable (anon) key                    |
| `SUPABASE_URL`                 | server only  | Same URL, server-side                     |
| `SUPABASE_PUBLISHABLE_KEY`     | server only  | Publishable key, server-side              |
| `SUPABASE_SERVICE_ROLE_KEY`    | server only  | Admin key — webhooks / maintenance only   |

Store secrets via Lovable's secrets tooling — never commit `.env`.

## 7. Build & Deployment

```bash
bun run build       # production build
bun run build:dev   # dev-mode SSR build (for prerender debugging)
bun run preview     # preview the built app
bun run lint        # eslint
bun run format      # prettier
```

Deployment is handled by Lovable (Publish button). Custom domains attach via **Project Settings → Domains** after the first publish. The build target is Cloudflare Workers (`nodejs_compat`). Stable URLs:

- `project--{id}.lovable.app` — production
- `project--{id}-dev.lovable.app` — preview

## 8. Authentication Flow

**Current state:** no auth — mock user context only.

**Planned (v0.5+):**

1. User taps *Sign in*.
2. Supabase Auth handles email/OTP + Google + Apple.
3. Session is stored via Supabase JS client; SSR routes read it from cookies via `@supabase/ssr`.
4. Protected routes live under `src/routes/_authenticated/` and use `requireSupabaseAuth` middleware on server functions.
5. Roles are stored in a dedicated `user_roles` table (never on `profiles`) and checked via a `SECURITY DEFINER` `has_role()` function.

## 9. Database Structure

Planned schema (all in `public`, all with RLS + explicit `GRANT`s):

```text
profiles(id, handle, display_name, avatar_url, bio, tier, created_at)
vehicles(id, owner_id, make, model, year, spec_json, hero_image_url)
posts(id, author_id, kind[video|photo|telemetry|event], media_url, caption, created_at)
reactions(id, post_id, user_id, kind[like|save|share], created_at)
comments(id, post_id, author_id, body, created_at)
follows(follower_id, followee_id, created_at)
clubs(id, name, slug, banner_url, owner_id)
club_members(club_id, user_id, role)
listings(id, seller_id, vehicle_id, price_cents, currency, status)
events(id, host_id, title, starts_at, geo, cover_url)
messages(id, thread_id, sender_id, body, created_at)
notifications(id, user_id, kind, payload_json, read_at)
user_roles(user_id, role app_role)
```

Full ERD: [`/docs/database-erd.md`](docs/database-erd.md).

## 10. API Documentation

- **Internal RPC:** TanStack `createServerFn` handlers, colocated as `*.functions.ts`.
- **Public HTTP:** file-based server routes under `src/routes/api/public/*` (webhooks, cron).
- Full spec: [`/docs/api-specifications.md`](docs/api-specifications.md).

## 11. State Management

| Concern              | Tool                                                |
| -------------------- | --------------------------------------------------- |
| Server / remote data | TanStack Query (loader `ensureQueryData` + `useSuspenseQuery`) |
| Route state / params | TanStack Router                                     |
| Local UI state       | React `useState` / `useReducer`                     |
| Offline mutations    | `src/lib/interaction-queue.ts` (localStorage + emit) |
| Cross-cut hooks      | `src/hooks/*`                                       |

## 12. Third-Party Services

Prototype: none. Planned:

- **Lovable Cloud (Supabase):** Postgres, Auth, Storage, Edge.
- **Lovable AI Gateway:** captions, moderation, embeddings.
- **Stripe / Paddle:** marketplace payments.
- **Web Push / APNs / FCM:** notifications.

## 13. Push Notifications

Planned flow:

1. Register a service worker (`public/sw.js`).
2. Request `Notification.permission` on the first meaningful interaction.
3. Subscribe via `PushManager.subscribe({ applicationServerKey: VAPID_PUBLIC })`.
4. Persist subscription in `push_subscriptions` table.
5. Fan out from a server function on relevant events (new follower, DM, event RSVP).
6. Native wrappers (Capacitor) route through APNs/FCM using the same server functions.

## 14. Storage Architecture

Planned Supabase Storage buckets:

| Bucket        | Access        | Purpose                        |
| ------------- | ------------- | ------------------------------ |
| `avatars`     | public read   | Profile avatars                |
| `vehicles`    | public read   | Garage hero shots              |
| `posts`       | public read   | Feed photos / video posters    |
| `videos`      | public read   | Short-form reels (HLS)         |
| `messages`    | signed URL    | DM attachments                 |
| `listings`    | public read   | Marketplace media              |

Uploads go through a server function that validates mime/size and returns a signed upload URL.

## 15. Security

- Strict TypeScript, ESLint, no `any` in shared code.
- Tokens (color, radius, shadow) enforce theme consistency and prevent leaking dark-mode-incompatible values.
- Planned: RLS on every table; roles in `user_roles` + `has_role()`; publishable keys only in client; service-role key only in `.server.ts` files.
- Webhook routes verify HMAC signatures via `timingSafeEqual`.
- Full policy: [`/docs/security.md`](docs/security.md).

## 16. Performance

- SSR + streaming via TanStack Start.
- `defaultPreloadStaleTime: 0` with per-request QueryClient.
- Route-level code splitting (automatic).
- Backdrop-blur + will-change scoped to floating surfaces only.
- Reels use `IntersectionObserver` for autoplay + pause off-screen.
- Fonts preconnected and `display=swap`.
- Assets served from Cloudflare edge.

## 17. Testing

Current: manual QA via preview + Playwright scripts under `/tmp/browser/` during development.

Planned:

- Unit: **Vitest**.
- Component: **@testing-library/react** + jsdom.
- E2E: **Playwright**, targeting the local dev server.
- CI: run `bun run lint`, `bun run build`, and Vitest on every PR.

## 18. Troubleshooting

| Symptom                                       | Likely cause / fix                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| `Failed to resolve import`                    | File not created before import, or missing package — run `bun add`.       |
| Empty screen after navigation                 | Layout route missing `<Outlet />`.                                       |
| Build error mentioning `routeTree.gen.ts`     | Two files claiming the same URL — check for a duplicate `index.tsx`.     |
| Interaction bar stuck on `SYNCING`            | Clear `localStorage` key `zrex.interactions.queue.v1`.                    |
| Fonts flash / never load                      | Google Fonts stylesheet must be a `<link>` in root route, not `@import`. |
| `Unauthorized` at build time                  | Protected server function called from a public-route loader.             |

## 19. Roadmap

- **v0.4** Polished visual prototype (current).
- **v0.5** Auth + profiles + posts backed by Lovable Cloud.
- **v0.6** Video pipeline (upload → HLS transcode → CDN).
- **v0.7** Marketplace + Stripe.
- **v0.8** Events + geo + RSVP.
- **v0.9** Push notifications + native wrapper (Capacitor).
- **v1.0** Public launch: moderation, safety, analytics, SLOs.

---

© ZOMBIEREX. Ride. Rev. Resurrect.
