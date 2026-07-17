# System Architecture

## Runtime

ZOMBIEREX is a **TanStack Start v1** application. React 19 renders on both the server (Cloudflare Workers, `nodejs_compat`) and the client. Vite 7 builds a single graph containing:

- Client bundle (React + routes + components).
- SSR bundle (route loaders, root shell, server functions).
- Server-route bundle (`src/routes/api/**`, planned).

```text
┌────────────────────────────────────────────────────────────┐
│                     Cloudflare Worker                      │
│  ┌─────────────┐   ┌───────────────┐   ┌────────────────┐  │
│  │  SSR entry  │──▶│ Route loaders │──▶│ Server fns /   │  │
│  │  server.ts  │   │  (TSR)        │   │ API routes     │  │
│  └─────────────┘   └───────────────┘   └────────────────┘  │
│         │                  │                     │         │
│         ▼                  ▼                     ▼         │
│   HTML shell         Preloaded data       Lovable Cloud    │
└─────────────────────────────┼──────────────────────────────┘
                              ▼
                       Browser (React 19)
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              TanStack Query    Interaction queue
                    │                   │
                    ▼                   ▼
              Mock data /        localStorage +
              Lovable Cloud      background drain
```

## Modules

- **Router (`src/router.tsx`)** — factory that creates a `QueryClient` per request and a router with `defaultPreloadStaleTime: 0`.
- **Root route (`src/routes/__root.tsx`)** — sets `<head>`, wraps app in `QueryClientProvider`, defines `errorComponent`, `notFoundComponent`, and renders `BottomNav`.
- **Routes** — one file per screen. All page-level metadata (`head()`) lives in each route.
- **Components** — presentation only; do not read `window`/`localStorage` at module scope.
- **Hooks** — cross-cut behavior (viewport, interaction state).
- **Lib** — pure logic: mock fixtures, offline queue, error reporting, utils.

## Request lifecycle

1. Browser hits `/` (or any route).
2. Worker runs SSR: matches route → runs loaders (server-safe) → renders HTML.
3. HTML streams with preloaded Query cache.
4. Client hydrates React; TanStack Router takes over navigation.
5. Post-hydration, `useInteractionState` mounts and rehydrates the offline queue from `localStorage`.

## Offline mutation pipeline

`InteractionBar` → `useInteractionState` → `interaction-queue.ts` → (mock) `sendMock` → success drops action / failure retries with exponential backoff or marks failed for manual retry. Emit → subscribers → UI updates.
