# ZombieRex — Engineering Recovery Audit (Phase 1–9 Report)

Status: **Report only. No code changes made in this pass** (per Phase 9: "Before making changes, generate a detailed report").
Build: `bun run build` ✅ passes in ~1s. Bundle largest chunk (client route): `drag.race` ~60 kB gz.
Scope surveyed: 90 route files, 53 server/lib modules, 40 SQL migrations, ~25 shared components.

---

## 1. Bug Inventory

### CRITICAL (blocks core flows / data integrity)
| # | Area | Symptom | Root cause (suspected) | Evidence |
|---|---|---|---|---|
| C1 | Auth gate | Intermittent "AUTHENTICATING" spinner on protected routes | `_authenticated/route.tsx` was rewritten multiple times mixing sync `localStorage` scan + async race; still relies on `sb-*-auth-token` heuristic instead of managed integration gate | User screenshots, prior turns |
| C2 | Vite runtime | `jsx-runtime.js does not provide an export named 'jsx'` in preview | Custom `optimizeDeps`/`cacheDir` overrides in `vite.config.ts` conflict with TanStack Start plugin | runtime-errors in context |
| C3 | Drag race flow | "CONTINUE" button did nothing until routed via `<Link>` | Hydration failure caused by C2; fix is symptomatic not causal | Prior session replay |
| C4 | Server fn security | `payments.functions.ts` contains `TODO` markers around webhook verification | grep hit; needs review of signature check + idempotency | rg TODO |
| C5 | RLS coverage | 40 migrations, table count large; no automated coverage report — unverified whether every `public.*` table has both GRANTs and RLS policies | Manual sampling only | migration count |

### HIGH
| # | Area | Issue |
|---|---|---|
| H1 | Immersive routes | `/drag/race`, `/atlas/cockpit`, `/atlas/ride` hide bottom nav — no consistent "exit" affordance audited across all of them |
| H2 | Media upload | `media-upload.ts` compression path not verified against >10 MB videos / HEIC on iOS Safari |
| H3 | Realtime | Feed + messages both subscribe; no central channel manager → potential duplicate subscriptions on route revisit |
| H4 | Owner console | `/owner` uses `is_owner()` — no rate limit or audit-log write on destructive actions verified |
| H5 | GPS | `drag-recorder.ts` and `crash-detection.ts` both request geolocation; no coordination — can double-drain battery |
| H6 | Error boundaries | Not every route with a loader defines both `errorComponent` + `notFoundComponent` (TanStack requirement) |
| H7 | Forms | Post/listing/event composers — client-side Zod present in some, absent in others; server-side validation coverage uneven |
| H8 | Images | No `loading="lazy"` / `decoding="async"` audit; feed can allocate large decoded bitmaps on low-end Android |

### MEDIUM
| # | Area | Issue |
|---|---|---|
| M1 | Duplicate components | `SpeedoHUD.tsx`, `RaceHUD.tsx`, `StatusHUD.tsx`, `hud.tsx` — overlapping responsibilities |
| M2 | Dead code | `mock-data.ts` still imported in some routes; audit and remove from production paths |
| M3 | i18n | `i18n.ts` exists but coverage is partial across new routes |
| M4 | Notifications | Web-push service worker (`sw.js`) present, but VAPID key wiring + permission UX not verified |
| M5 | Empty/error states | Several list routes render blank on empty; no illustration or CTA |
| M6 | Toast/UX consistency | Mix of inline banners and toasts; no single feedback pattern |
| M7 | Analytics | No event taxonomy doc; ad-hoc events across routes |

### LOW / Cosmetic
| # | Issue |
|---|---|
| L1 | Typography scale drifts across `atlas.*` vs `drag.*` vs `communities.*` |
| L2 | Iconography mixes custom `RexIcons` and Lucide inconsistently |
| L3 | Focus rings missing on several custom buttons (a11y) |
| L4 | Some route `head()` blocks repeat generic title/description |

---

## 2. Performance Report
| Metric | Observation |
|---|---|
| Cold build | ~1s (excellent) |
| Largest client route chunk | `drag.race` 60 kB gz — acceptable |
| Largest server chunk | `@tanstack/react-router` 140 kB gz — framework baseline |
| Suspected slow screens | `/reels` (media prefetch), `/atlas` (Google Maps init), `/messages/$id` (realtime + attachments) |
| Not measured | TTI on 4G, memory on low-end Android, GPS battery drain — **needs device profiling** |

---

## 3. Code Quality Report
- **Technical debt hotspots:** HUD components (M1), auth guard (C1), Vite config (C2), payment webhook (C4).
- **Duplicate logic:** GPS smoothing lives in both `drag-recorder.ts` and `atlas.record.tsx`; media compression logic partially duplicated.
- **Large files:** `drag.race.tsx` >600 lines — split HUD, tree, strip, replay panel into siblings.
- **Naming:** mostly consistent; `hud.tsx` (lowercase) breaks component naming convention.
- **Folder structure:** `src/lib/*.functions.ts` pattern is clean; `src/components/` is flat — introduce `components/drag/`, `components/atlas/`, `components/feed/`.

---

## 4. Security Report
| Severity | Finding | Recommendation |
|---|---|---|
| High | Webhook TODOs in `payments.functions.ts` | Enforce HMAC signature check + timing-safe compare + idempotency key before any DB write |
| High | Unverified RLS/GRANT coverage across 40 migrations | Run `supabase--linter` + write a coverage check script |
| Medium | `owner` role — destructive endpoints (suspend user, flag toggle) need mandatory audit-log insert in the same transaction | Wrap in SQL function with `security definer` |
| Medium | Storage buckets are private (good) — verify signed-URL TTL and that no client code requests public URLs for private buckets | Grep for `getPublicUrl` on private buckets |
| Medium | Input validation coverage uneven | Enforce Zod at every `.inputValidator()` boundary |
| Low | Leaked-password HIBP check not confirmed enabled | `configure_auth` with `password_hibp_enabled: true` |

---

## 5. UI/UX Report
- **Needs redesign / polish:** empty states across `communities`, `marketplace`, `judge` lists (M5); `settings` sub-pages typography; onboarding flow visual continuity with signed-in shell.
- **Inconsistent components:** primary button variants across `drag.*` vs `marketplace.*`; card radii differ (12/16/20 px used interchangeably).
- **Accessibility:** color contrast on toxic-green over cream needs WCAG AA verification; focus indicators (L3); no `aria-live` on race HUD timer changes.
- **Dark mode:** design tokens exist but not every screen honors them — audit needed.

---

## 6. What Could Not Be Verified This Pass
| Item | Blocker |
|---|---|
| End-to-end auth (register → login → forgot pw → OAuth) | Requires interactive session in preview + provider config; no automated Playwright suite yet |
| Payments (checkout, webhook) | Requires Stripe test keys + tunnel |
| Push notifications delivery | Requires VAPID keys + real device |
| GPS accuracy on device | Sandbox has no GPS; needs physical phone test |
| Google Maps quota / billing status | Managed via connector; no read access to usage |
| Email deliverability (`notify.zombierex.com`) | Requires DNS propagation confirmation |

---

## 7. Controlled Fix Plan (Phase 10)

Recommended order — one PR per group, each shipped with regression evidence.

### Group A — CRITICAL stabilization (do first)
1. **C2 Vite config**: revert to TanStack Start defaults; remove custom `cacheDir`/`optimizeDeps.force`; restart dev server; verify `/drag/run` and `/atlas` hydrate cleanly.
2. **C1 Auth gate**: replace bespoke `localStorage` scan with the integration-managed `_authenticated/route.tsx` pattern (client-only `getUser()`, redirect to `/auth`); delete competing gates.
3. **C4 Payments webhook**: enforce HMAC + idempotency; add unit test with signed + unsigned payload.
4. **C5 RLS coverage script**: emit a report of every `public.*` table without an RLS policy or without a GRANT; fix gaps.

### Group B — HIGH
- H1 immersive exit affordance (floating back chip on all immersive routes).
- H3 central realtime channel manager (`src/lib/realtime.ts`).
- H5 single geolocation broker used by drag + atlas + crash-detection.
- H6 sweep every route with a loader → add `errorComponent` + `notFoundComponent`.
- H7 Zod on every server-fn input + form.

### Group C — MEDIUM
- Consolidate HUDs (M1), remove `mock-data` from prod paths (M2), standardize empty states (M5), unify toasts (M6).

### Group D — LOW / Polish
- Typography + icon pass, focus rings, per-route metadata refresh.

### Group E — Verification Infrastructure
- Playwright smoke suite: auth, feed load, post create, marketplace list, atlas record start/stop, drag demo run, messages send.
- CI check: `bun run build` + `tsgo` + Playwright smoke on every change.

---

## 8. Quality Bar for "Done"
A group is complete only when:
- Every changed file has a targeted manual test recorded (screenshot or Playwright trace).
- No previously-green route regresses (smoke suite green).
- `bun run build` green, no new TypeScript errors, no new console errors on the touched routes.
- Security-sensitive changes have an accompanying migration/linter run.

---

## 9. Recommendation

Approve **Group A** to start immediately. It is the smallest set of changes that unblocks every downstream verification — without stable hydration and a trustworthy auth gate, no other audit item can be conclusively tested.

I will not begin code changes until you confirm the group (A only, or A+B, etc.) so we honor the "no fix-everything-at-once" rule you set.
