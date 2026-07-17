# Deployment Guide

## Environments

- **Preview** — `project--{id}-dev.lovable.app` (latest preview build).
- **Production** — `project--{id}.lovable.app` (published build).
- **Custom domain** — attach in Project Settings → Domains after first publish.

## Deploy flow

Frontend changes require clicking **Publish → Update** in the Lovable dialog.
Backend changes (server functions, migrations) deploy immediately on push.

## Build

```bash
bun install --frozen-lockfile
bun run build
```

Output is a Cloudflare Workers-compatible bundle (client assets + SSR worker).
`nodejs_compat` is enabled. Do **not** set `ssr.external` in `vite.config.ts`.

## Environment variables

Set via Lovable secret tooling per environment (dev / prod each have their own 100-secret cap):

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` — client + SSR.
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — server.
- Third-party keys as needed (Stripe, VAPID push).

## Rollback

Use the Lovable version history to restore any previous commit. Frontend rollback is instant; database rollbacks follow [backup-recovery.md](backup-recovery.md).

## Post-deploy checks

1. `GET /` returns 200 with the correct `<title>`.
2. `GET /api/public/health` returns 200.
3. Interaction bar submits and drains (open DevTools → Application → Local Storage).
4. Console shows no errors on any core route.
