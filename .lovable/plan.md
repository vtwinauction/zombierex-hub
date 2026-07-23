# Super Administrator (Owner) Control Center

A dedicated, MFA-protected command surface at `/owner` reserved for the single platform owner. Sits above the existing `/admin` (staff moderation) with its own role, its own gate, and its own audit trail.

## Role model

Extend `app_role` with `owner` (highest). Layering:

- `owner` — full control, only role that sees `/owner`
- `admin` — existing staff console (`/admin`)
- `moderator` — content moderation queues
- `standard` — users

Only one active owner is expected. A DB check trigger blocks demoting the last owner. Assignment is done via SQL by whoever seeds the project — never through the app UI.

## Phased delivery

### Phase 1 — Foundation (this turn)

**Database** (single migration)
- `app_role` gains `'owner'` value
- `feature_flags_v2(key, label, category, enabled, description, updated_by, updated_at)` — one row per toggleable module (marketplace, messaging, groups, events, notifications, ai, live, garage, search, registration, uploads, posting)
- `maintenance_state(id=1 singleton, global_enabled, message, scheduled_until, updated_by, updated_at)` and `module_maintenance(module_key, enabled, message)`
- `owner_audit_log(id, actor_id, action, target_type, target_id, before_value jsonb, after_value jsonb, ip, user_agent, created_at)` — searchable, exportable
- `owner_broadcasts(id, title, body, severity, active, expires_at, created_by, created_at)` — emergency banners
- `owner_mfa(user_id PK, totp_secret_enc, enabled, verified_at)` — TOTP secret encrypted with `OWNER_MFA_KEY` (auto-generated secret)
- `owner_sessions(id, user_id, mfa_passed_at, ip, user_agent, expires_at)` — 30-min re-auth window
- `is_owner(uuid)` SECURITY DEFINER helper, plus `require_owner()` for policies
- Owner-only RLS on all above; owner GRANT on every existing sensitive table for admin reads
- Trigger: prevent deleting/demoting the last remaining owner
- Trigger: any INSERT/UPDATE/DELETE by an owner on the owner-scoped tables auto-writes to `owner_audit_log`

**Server functions** (`src/lib/owner.functions.ts`, all `.middleware([requireSupabaseAuth])` + inline `is_owner` check + owner-session freshness check)
- `listUsers`, `searchUsers`, `getUserDetail`, `updateUserProfile`, `setUserRoles`, `setUserSuspension`, `setUserVerified`, `forceSignOut`, `sendPasswordReset`
- `listFlags`, `setFlag`, `setMaintenance`, `setModuleMaintenance`
- `listContent(type, filter)`, `removeContent`, `restoreContent`, `listReports`, `resolveReport`
- `getMetrics` (active users 5m/24h, signups today, posts today, messages today, listing activity, storage bytes, error count)
- `listAuditLog(filter)`, `exportAuditLogCsv`
- `broadcast(title, body, severity, expiresAt)`, `dismissBroadcast`
- `getAiUsage`, `setAiEnabled`, `getAiLogsTail`
- `enrollOwnerMfa`, `verifyOwnerMfa`, `refreshOwnerSession`

Every handler writes to `owner_audit_log` with before/after JSON.

**Client**
- `src/hooks/useFeatureFlag.ts` + `<FeatureGate module="marketplace">` — reads a live `feature_flags_v2` snapshot fetched once at boot + Supabase Realtime subscription
- `src/components/MaintenanceBanner.tsx` — root-mounted; renders global maintenance notice + active `owner_broadcasts`
- Wire `FeatureGate` around the existing Marketplace, Messaging, Groups, Events, Live, AI, Uploads, Registration, Posting entry points (disabled → friendly "temporarily unavailable" screen)

**Owner routes** (all under `src/routes/_authenticated/owner/`)
- `route.tsx` — owner-only `beforeLoad` (calls `is_owner` server-fn + checks TOTP session freshness; redirects non-owners to `/`; unverified owners to `/owner/mfa`)
- `index.tsx` — command center dashboard: live metrics, health tiles (DB/AI/Storage), quick emergency toggles
- `users.tsx` — table with search, filters, row actions (suspend/verify/reset/logout/roles)
- `users.$id.tsx` — full user dossier + edit
- `content.tsx` — tabs for posts / reels / comments / messages / listings / events with moderation actions
- `reports.tsx` — user report queue
- `features.tsx` — grid of module toggles grouped by category
- `maintenance.tsx` — global + per-module maintenance, scheduled window, custom message
- `broadcasts.tsx` — compose emergency announcement
- `ai.tsx` — AI usage, kill switch, recent gateway logs
- `security.tsx` — login history, failed logins, audit log search + CSV export
- `settings.tsx` — branding, languages, email/push, integrations pointers
- `analytics.tsx` — growth, engagement, revenue, marketplace, content
- `mfa.tsx` — TOTP enrollment (QR) + verification; forced first-visit stop

Layout is a responsive shell (rail + top bar) that collapses to a bottom tab set on mobile, dark obsidian theme distinct from `/admin`.

### Phase 2 — Deep management (next turn, on approval)
- Backup/restore hooks (manual DB snapshot request via `pg_dump`-style export endpoint, download link)
- Push/email/payments/storage configuration screens tied to existing secrets
- Detailed BI dashboards with charts (Recharts) — revenue, cohort retention, funnel
- Group / club / event / marketplace deep moderation panels
- API keys + webhooks management UI

### Phase 3 — Hardening
- Per-action confirm modals with "type OWNER to confirm" for destructive ops
- Rate limiting on owner endpoints
- IP allow-list (optional)
- Signed audit-log exports

## Security guarantees

- Every owner server fn: `requireSupabaseAuth` → `has_role(uid,'owner')` → fresh `owner_sessions` row (< 30 min since MFA) → action → audit write. Fail closed on any step.
- MFA secret stored encrypted with `OWNER_MFA_KEY` (generated via `generate_secret`, never revealed).
- `/owner/*` layout is `ssr:false` and gated by the managed `_authenticated` layout above it, so no session leaks to SSR.
- No client-side role check drives permission — flags/maintenance are read for UX only, all enforcement runs server-side against `is_owner()`.
- Destructive actions (ban, delete content, disable module) require explicit confirmation.

## Bootstrapping the first owner

After the migration, promote your account with (run via psql):

```sql
INSERT INTO public.user_roles(user_id, role) VALUES ('<your-uid>', 'owner');
```

Then sign in and visit `/owner/mfa` to enroll TOTP. All subsequent owner assignments happen through the Control Center once MFA is verified.

## Technical notes

- `feature_flags_v2` is realtime-subscribed on the client; `<FeatureGate>` re-renders instantly when the owner flips a toggle.
- `owner_audit_log` uses partial indexes on `(actor_id, created_at desc)` and `(action, created_at desc)` for fast search.
- Metrics endpoint reads from existing tables — no new counters, so it stays cheap.
- All owner UI copy is English-only for now; i18n hooks are in place for later.

Phase 1 alone is ~15 route files, 1 migration, 1 large server-fn module, and a handful of shared components. Shipping it in one turn.
