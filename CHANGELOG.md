# Changelog

All notable changes to **ZOMBIEREX** are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Version scale:

- `v0.1.0` — Foundation & scaffolding
- `v0.2.0` — First design system + core routes
- `v0.3.0` — Editorial "Obsidian & Signal" identity
- `v0.4.0` — Interaction bar, offline queue, documentation ← **current**
- `v0.5.0` — Auth + Lovable Cloud (planned)
- `v1.0.0` — Public production release (planned)

---

## [0.4.0] — 2026-07-17

### Added
- **InteractionBar** (`src/components/InteractionBar.tsx`) — floating obsidian-glass social action strip with Like / Comment / Views / Share / Save, hairline dividers, mono counters, and neon accent on active states.
- **Offline queue** (`src/lib/interaction-queue.ts`) — localStorage-backed mutation queue with optimistic updates, `navigator.onLine` detection, exponential backoff, and manual retry.
- **useInteractionState** hook (`src/hooks/useInteractionState.ts`) — subscription + optimistic counters.
- **RiderBadge** metallic status tags (TURBO, NITRO, APEX·REX, ELITE, LEGEND) replacing generic verification checks.
- **Custom icon family** (`src/components/icons/RexIcons.tsx`) — claw, visor, lens, mech-claw, bone-mark.
- Comprehensive `README.md`, `CHANGELOG.md`, and `/docs/*` documentation set.

### Changed
- Monolithic Precision redesign of the interaction bar: single-row obsidian strip, hairline top reflection, 16px radius.
- Feed masthead now embeds `InteractionBar` and `RiderMark` in the builder attribution.
- Search directory swapped inline "✓ VRF" text for `RiderBadge`.

### Fixed
- Tailwind v4 compilation error caused by an empty `@utility` block in `src/styles.css`.
- SSR guard on `localStorage` reads in the interaction queue.

### Known issues
- No real backend — all data is mocked.
- Reel autoplay may stutter on low-power devices when many videos are mounted simultaneously.

### Upcoming
- Wire the interaction queue transport to a real `createServerFn` endpoint.
- Auth + `user_roles` schema.

---

## [0.3.0] — 2026-07-16

### Added
- **Obsidian & Signal** editorial design system: Instrument Serif + Work Sans + JetBrains Mono; obsidian/neon/ink palette; hairline grids.
- `StatusBar`, `StatusHUD`, `BottomNav` floating pill-island, editorial Broadcast feed masthead.
- Route overhauls: `/marketplace` (The Vault), `/profile` (Digital Garage), `/search` (Signal Index), `/notifications` (System Log), `/events` with OP serial numbering.

### Changed
- Replaced "Titanium Bone" and prior HUD systems with the editorial identity.
- Bottom navigation reduced to a floating capsule with custom icons.

### Fixed
- Empty `@utility` block in `styles.css` that crashed Tailwind v4.

---

## [0.2.0] — 2026-07-15

### Added
- Short-form video **Reel** component with snap-scroll feed.
- `StoriesRail`, `SideRail`, `FeedHeader`, `TelemetryPost` components.
- Bento dashboard prototype and "Digital Garage" profile.
- Multiple design iterations: cream/amber warm system, luxury neutrals, terminal-grade motorsport HUD.

### Changed
- Home route restructured to blend dashboard + feed.
- Post cards redesigned as "engineered" telemetry readouts.

---

## [0.1.0] — 2026-07-14

### Added
- Initial TanStack Start scaffold (React 19, Vite 7, Tailwind v4).
- File-based routes: `/`, `/search`, `/marketplace`, `/events`, `/messages`, `/notifications`, `/profile`.
- Cinematic asset generation and initial ZOMBIEREX brand tokens.
- Mock data layer (`src/lib/mock-data.ts`).
- Error reporting and error boundaries (`src/lib/lovable-error-reporting.ts`, `__root.tsx`).

### Breaking
- N/A (initial release).
