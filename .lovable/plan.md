# ZOMBIEREX — Professional Reorganization

Locking in **Titanium Editorial** (light premium: #fafafa surfaces, graphite ink, single toxic-green accent) and the **industry-standard 5-tab nav** used by IG/TikTok/Snapchat: Home · Search · Create (center) · Reels · Profile. Everything else moves behind a top-bar Menu.

## 1. Design system — `src/styles.css`

Rewrite the theme layer only (keep existing utility classes wired):
- Surfaces: `--bg #fafafa`, `--surface #ffffff`, `--surface-2 #f2f2f2`, `--hair #e6e6e6`, `--hair-strong #d4d4d4`
- Ink: `--ink #0a0a0a`, `--ink-2 #3a3a3a`, `--ink-3 #8a8a8a`
- Accent: `--neon #00c853` (toned toxic green — legible on white), `--danger #e11d2a`
- Radius scale 8/12/16, single soft elevation `0 1px 2px + 0 8px 24px -12px`, hairline dividers 1px
- Type: Space Grotesk display / DM Sans body (already loaded via head); tighten tracking, add `.eyebrow` micro-label utility
- Keep `.mono-num`, `.mono-caps`, `.serif` classes and existing animations so no consumer breaks

## 2. Navigation — IG-style

Rebuild `src/components/BottomNav.tsx`:
- 5 slots: **Home /**, **Search /search**, **Create (center, elevated, filled accent)**, **Reels /reels**, **Profile /profile**
- White surface, hairline top border, safe-area padding, active state = filled ink icon + 2px underline
- Keep auto-hide on scroll-down (already wired)
- Center Create button: tap → `/post/new`, long-press → native camera (reuse existing capture logic from StatusBar)

Rebuild `src/components/StatusBar.tsx` as a clean editorial masthead:
- Left: wordmark "ZOMBIEREX" (Space Grotesk, tight tracking) + tiny section eyebrow
- Right: Search icon, Notifications, **Menu (hamburger)** → routes to `/menu` (Atlas, Crews, Vault, Events, Creators, Vendor, Settings, Admin…)
- Remove the Camera/Plus from the top bar (now lives in bottom Create)

## 3. Home restructure — `src/routes/index.tsx`

Editorial dashboard + feed hybrid:
1. Stories rail (existing)
2. **Pulse strip**: 3 compact stat tiles (Followers, XP, Rides) — light cards, mono numerals
3. **Quick actions row**: Atlas · Crews · Vault · Events (icon + label, horizontal scroll)
4. **For You** feed of TelemetryPosts + Reels + Sponsored
- Remove neon-heavy panels; use hairlines, generous whitespace, single accent

## 4. Touch-ups only (no logic changes)

- `src/components/TelemetryPost.tsx`, `Reel.tsx`, `InteractionBar.tsx`, `RouteCard.tsx`, `FeedHeader.tsx`: swap hard blacks → `--ink`, neon backgrounds → hairline + accent text where appropriate. Keep icons, keep behavior.
- `/menu`: reorder into sections (Ride, Social, Commerce, You, Admin) with hairline groups.

## 5. Out of scope

- No backend / server function / RLS changes
- No feature additions or removals
- Individual sub-routes (admin, creator, vendor, marketplace detail) inherit new tokens automatically; no per-file rewrites

## Technical notes

- All color changes flow through `src/styles.css` CSS custom properties; component `style={{ background: "var(--color-obsidian)" }}` refs remap by aliasing the old token names to the new palette (e.g. `--color-obsidian` → `--ink`) to avoid touching 40+ files.
- Typecheck + build must stay green after each file batch.
- Verify visually at 384×681 (current viewport) via preview screenshot.
