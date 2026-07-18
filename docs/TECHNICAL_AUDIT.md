# ZOMBIEREX — Technical Audit Report

_Read-only audit. No new features were added during this phase._

## 1. Overall Project Health — **A- (Release Candidate)**

| Area | Status | Notes |
|---|---|---|
| Build | ✅ Pass | `bun run build` completes in ~600ms, 0 errors |
| Typecheck | ✅ Pass | `tsgo --noEmit` clean |
| Dependency scan | ✅ Pass | 0 high / critical CVEs (`code--dependency_scan`) |
| Supply-chain scan | ✅ Pass | 0 findings |
| Supabase linter | ⚠️ 12 WARN | No ERROR-level findings; itemised below |
| Runtime console | ✅ Clean | Only a benign HMR "server connection lost" during rebuild |
| Routes | 38 route files, all resolve; `_authenticated` gate managed by integration |
| Server functions | 27 `*.functions.ts` modules; consistent shape (`createServerFn` + `requireSupabaseAuth` / `publicClient`) |
| Tables | 74 tables, RLS enabled across the board, GRANTs present |

## 2. Code Quality Assessment

- **Structure** — `src/routes/`, `src/components/`, `src/lib/*.functions.ts`, `src/hooks/`, `src/integrations/supabase/*` follow the TanStack Start conventions. No `src/pages/`, no rogue `App.tsx` router.
- **Server/client separation** — Every DB write is behind `createServerFn`. `client.server.ts` is only imported inside handler bodies. No `SERVICE_ROLE_KEY` leaks to the client bundle (verified via `rg`).
- **Duplication** — Interaction state, optimistic queue, and comments sheet each have exactly one owner. Icon set is centralised in `src/components/icons/`.
- **Dead code** — Minor: `mock-data.ts` is still imported by a few demo surfaces (Reels seed). Acceptable while backend seeding is optional; recommend gating behind `import.meta.env.DEV` before GA.
- **Console noise** — `console.log/warn/error` usages are confined to `error-capture.ts` and `lovable-error-reporting.ts` (intentional).
- **Naming / conventions** — Consistent kebab-case files, PascalCase components, `.functions.ts` for RPC modules.

## 3. Architecture Assessment

- TanStack Start v1 SSR + Cloudflare Worker runtime.
- Data pattern: loader → `ensureQueryData` → `useSuspenseQuery` (canonical).
- Auth: integration-managed `_authenticated/route.tsx` gate (`ssr: false`) + bearer `functionMiddleware` in `src/start.ts`.
- Realtime: Supabase channels used in communities feed and challenges — subscriptions cleaned up in effect returns.
- Storage: 5 private buckets (`avatars`, `posts`, `vehicles`, `marketplace`, `documents`) served via signed-URL helper.

## 4. Security Assessment

**Dependency scan:** clean.  
**Supabase linter — 12 WARN findings (no ERROR):**

1. `Function Search Path Mutable` × 1 — one helper missing `SET search_path`. Non-exploitable but should be tightened.
2. `Extension in Public` × 2 — `citext` and `pg_trgm` installed in `public`. Cosmetic; moving them requires downtime and rewrites; acceptable.
3. `Public Can Execute SECURITY DEFINER Function` × 2 — trigger helpers still executable by `anon`. Revoke recommended.
4. `Signed-In Users Can Execute SECURITY DEFINER Function` × 6 — counter/bump triggers callable directly by `authenticated`. Revoke recommended (triggers still fire on writes).
5. `Leaked Password Protection` (HIBP) — not verified; recommend enabling before GA.

**RLS:** every user-data table enforces `auth.uid()` scoping; `has_role` / `is_club_member` / `is_conversation_member` use `SECURITY DEFINER` with fixed `search_path`.  
**Secrets:** `SUPABASE_SERVICE_ROLE_KEY`, `PAYMENTS_WEBHOOK_SECRET`, `LOVABLE_API_KEY` stored server-side only; no VITE_ leaks.  
**Webhooks:** `/api/public/*` handlers verify HMAC with `timingSafeEqual`.

## 5. Performance Assessment

- Client bundle split by route; largest server chunk `react-router+…` 662 kB (gzip 139 kB) — expected for TSR SSR.
- Bottom nav auto-hides on scroll (`useScrollDirection`) to keep viewport clean.
- Reels use snap-scroll + intersection-observer autoplay (single active `<video>`).
- Images compressed client-side via `MediaComposer` before upload.
- No N+1 queries observed in server functions (checked feed, communities, marketplace, events).

## 6. Build Status

- **Build:** ✅ success, 596 ms
- **Typecheck:** ✅ success
- **Bundler warnings:** none blocking

## 7. Issues Found vs Fixed

| # | Issue | Severity | Status |
|---|---|---|---|
| 1 | 8 `SECURITY DEFINER` helpers still granted EXECUTE to `anon` / `authenticated` | Low | **Open** (recommendation) |
| 2 | 1 function missing `SET search_path` | Low | **Open** |
| 3 | `citext` / `pg_trgm` extensions in `public` schema | Info | **Open** (cosmetic) |
| 4 | HIBP leaked-password protection not confirmed enabled | Low | **Open** — one-click via Cloud → Users → Auth Settings |
| 5 | Mock-data seeds still imported in production build | Info | **Open** (gate behind `DEV`) |

No **critical**, **high**, or **runtime-blocking** issues were found. All previous critical fixes (comments sheet static composer, interaction bar functionality, admin/verification, payments webhook signing, signed URL helper, RLS recursion in clubs) remain in place and verified.

## 8. Remaining Known Issues

Same as §7. All are advisory hardening — none block beta.

## 9. Production Readiness Score — **93 / 100**

Deductions:
- −4 Supabase linter warnings pending
- −2 HIBP not confirmed
- −1 dev-only mock seeds still importable in prod bundle

## 10. Recommendations Before Public Release

1. Run the small migration to `REVOKE EXECUTE ... FROM anon, authenticated` on the 8 trigger helper functions and add `SET search_path = public` to the one function missing it.
2. Enable HIBP (Password HIBP Check) in Cloud → Users → Auth Settings.
3. Gate `src/lib/mock-data.ts` imports behind `if (import.meta.env.DEV)`.
4. Configure `og:image` on leaf routes that still fall back to root metadata (marketplace listing detail, event detail, creator profile) — text OG tags are already correct.
5. Add basic Playwright smoke tests for the 5 golden flows (signup → post, comment, RSVP, marketplace publish, subscribe).
6. Set up scheduled `supabase--linter` + `code--dependency_scan` runs (weekly) after launch.

---

**Verdict:** ZOMBIEREX is **stable, secure, and ready for closed beta**. The remaining items are hardening polish, not blockers. No new development is required to ship a private beta today; addressing items 1–3 above is recommended before opening public signups.
