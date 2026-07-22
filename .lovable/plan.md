# ZombieRex AI Judge — Module Plan

New optional module accessible from the main menu as **🏆 AI Show Judge**. Fully isolated: new tables, new routes under `/judge/*` and `/admin/judge/*`, new server functions in `src/lib/judge.functions.ts`. Zero changes to existing tables or features. Feature-flagged so admins can enable/disable.

## 1. Database (single migration)

New tables (all under `public`, RLS + GRANTs per project rules):

- `judge_events` — id, slug, title, description, cover_url, host_id, status (`draft|open|judging|closed|published`), registration_opens_at, registration_closes_at, judged_at, category_weights (jsonb), award_categories (jsonb), is_public bool, vehicle_types text[].
- `judge_entries` — id, event_id, user_id, vehicle_id (nullable), display_name, make, model, year, engine_cc, country, city, status (`draft|submitted|processing|scored|failed|flagged`), overall_score numeric, category_scores jsonb, defects jsonb, engine_score numeric, exhaust_score numeric, ai_comments text, awards text[], submitted_at, scored_at, fraud_score numeric.
- `judge_entry_media` — id, entry_id, kind (`exterior_360|engine_bay|suspension|wheels|exhaust|interior|walkaround_video|startup_video|exhaust_audio`), storage_path, mime, sha256 (dup detection), width, height, duration_ms, order_index.
- `judge_leaderboard_cache` — materialized snapshot: event_id (nullable = global), scope (country/city/type/brand/model), key, entry_id, rank, score, refreshed_at.
- `judge_flags` — id, entry_id, reason, created_by, resolved bool.
- Feature flag row seeded in existing `feature_flags` table: `judge.enabled` (default false).

RLS: entries readable by owner or when parent event is `published`; media same-owner-or-published; admins full via `has_role`. Insert scoped to `auth.uid()`. Events writable by admins only.

Storage: reuse existing `documents` (private) bucket under prefix `judge/{event_id}/{entry_id}/…` with per-user RLS on `storage.objects`.

Uses citext + pg_trgm (already installed) for fuzzy admin search.

## 2. Server functions (`src/lib/judge.functions.ts`)

- `judgeListEvents`, `judgeGetEvent`, `judgeGetEntry`, `judgeListEntries` (public read for published events).
- `judgeCreateEntry`, `judgeAttachMedia` (signed uploads via existing storage helpers), `judgeSubmitEntry` (locks entry + enqueues AI scoring).
- `judgeScoreEntry` (server-only) — calls Lovable AI Gateway:
  - **Vision**: `google/gemini-2.5-pro` with `image_url` blocks for each photo. Single structured JSON response with category scores (0–100), defects array (`{type, severity, media_ref, bbox?}`), highlights, suggested improvements, ai_comments.
  - **Audio**: `openai/gpt-4o-mini-transcribe` for exhaust/startup notes → then `google/gemini-3.6-flash` to derive Engine Health Score, Exhaust Quality Score, misfire/knock/leak flags.
  - Weighted overall = Σ(category_score × weight) from event `category_weights`.
  - Fraud/dup: sha256 media hash check across prior entries + basic EXIF/timestamp sanity in prompt.
- `judgeComputeAwards(eventId)` — admin RPC: ranks entries, assigns awards per event `award_categories`, writes AI-generated rationale per award.
- `judgeGetLeaderboard({ scope, key, eventId? })` — reads cache; refresh via `judgeRefreshLeaderboards` (admin).
- `judgeGenerateReport(entryId)` — returns structured JSON that the client renders as a downloadable PDF (uses existing report pattern; PDF generated client-side via existing lib or server via a `.functions.ts` returning HTML).
- Admin: `adminJudgeCreateEvent`, `adminJudgeUpdateEvent`, `adminJudgePublish`, `adminJudgeListFlags`, `adminJudgeResolveFlag`, `adminJudgeExport` (CSV).

All authenticated fns use `requireSupabaseAuth`; admin fns re-check role via `has_role`.

## 3. Routes

Public/authenticated (feature-flagged — if `judge.enabled = false` for the workspace, hide menu entry + return 404 from loaders):

- `src/routes/judge/index.tsx` — hub: active events, my entries, top leaderboard preview.
- `src/routes/judge/events.$slug.tsx` — event detail, entries grid, standings.
- `src/routes/judge/entries.$id.tsx` — entry report view (scores, defect callouts, awards, download PDF).
- `src/routes/_authenticated/judge.submit.$eventSlug.tsx` — multi-step submission wizard (vehicle info → photo sets → videos → audio → review → submit). Uses existing `MediaComposer`/upload helpers.
- `src/routes/_authenticated/judge.mine.tsx` — my entries + statuses.
- `src/routes/judge/leaderboards.tsx` — filters: country/city/type/brand/model/engine/event.

Admin:

- `src/routes/_authenticated/admin.judge.tsx` — tab in admin shell.
- `src/routes/_authenticated/admin.judge.events.tsx` + `.new.tsx` + `.$id.tsx` — CRUD, weights editor, publish, monitor processing, flags queue, export.

Menu: add "AI Show Judge" entry to `src/routes/_authenticated/menu.tsx` (conditional on flag).

## 4. UI

Matches existing Titanium/Neon design system — obsidian surfaces, hairline dividers, JetBrains Mono for scores, neon-green accent for winning categories, defect callouts in blood red. Score dials reuse the SVG gauge pattern from the Digital Garage profile.

Report page structured for on-screen review and print (`@media print`) with:
- Header (event, entry, overall score dial)
- Category score bars
- Defect gallery (thumbnail + severity chip + AI note)
- Highlights + suggested improvements
- Award ribbons if any
- Event ranking footer

## 5. Technical guardrails

- All new server fns validate input with Zod.
- AI calls wrap gateway errors (429/402 surfaced clearly).
- Long-running scoring is chunked: submission returns immediately with `processing` status; a `judgeScoreEntry` server fn is invoked by the wizard on submit and again by admin "reprocess". No cron required for MVP.
- Fraud: sha256 dedupe on `judge_entry_media`; unique(sha256, event_id) partial index; entries with dup media auto-flagged.
- Leaderboard cache refreshed inside `adminJudgePublish` and `judgeSubmitEntry` (best-effort).
- No changes to existing routes, tables, RLS, storage buckets, or start.ts.
- Feature flag gate on every route loader + menu render.

## 6. Out of scope (call out for user)

- Native CarPlay integration for the module — not needed.
- Real-time streaming of judging progress — status polling via TanStack Query is sufficient.
- Payments / paid entries — can be layered on later using existing `payments.functions.ts`.

## Deliverables order

1. Migration (tables + RLS + GRANTs + feature flag + storage prefix policy).
2. `judge.functions.ts` + admin fns.
3. Public routes + submission wizard.
4. Admin routes + tab in admin shell.
5. Menu entry (flag-gated).
6. Report renderer + print styles.
