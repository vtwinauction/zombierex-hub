
# Plan — Route Atlas + Reel Speed Upgrades

Two shipments in one turn. Both are additive and won't touch existing feature logic.

## Decisions locked in

- **Route creation:** support both **plan-on-map** and **live GPS record**. Live recording runs only while the user is on the "Record" screen (foreground only) — no background tracking service, so battery and app health stay clean.
- **Map provider:** Google Maps Platform (Lovable-managed connector). Used for map rendering, Places (hotels, restaurants, fuel, scenic), and directions.
- **Sharing (my recommendation):** **per-route visibility** — every route is either `private` (link only) or `public` (discoverable in the Atlas). Riders pick when saving. Others can "Ride this route" which clones it into their own garage. Best of both worlds, minimal extra UI.

## Shipment 1 — Route Atlas (new feature)

### New routes (pages)
- `/atlas` — discovery hub: featured + nearby public routes, filters (difficulty, distance, region, surface).
- `/atlas/$id` — route detail: map preview, elevation-ish stats, POIs list, "Ride this route", "Save", comments.
- `/_authenticated/atlas/new` — plan mode: tap map to add waypoints, search Places to add POIs, save with visibility toggle.
- `/_authenticated/atlas/record` — live record mode: Start / Pause / Stop with live distance + duration; on Stop, jumps to save screen prefilled with the tracked path.
- `/_authenticated/atlas/mine` — my saved + created routes.

### Data model (new tables, all with GRANTs + RLS)
- `routes` — id, owner_id, title, description, visibility (`public`/`private`), distance_m, duration_s, difficulty, surface, region, cover_url, path (jsonb: array of `{lat,lng}`), start/end point, stats, counters (saves, rides, likes), created_at.
- `route_pois` — id, route_id, name, kind (`hotel`/`food`/`fuel`/`scenic`/`repair`/`custom`), google_place_id, lat, lng, note, order_index.
- `route_saves` — user_id + route_id (bookmark).
- `route_rides` — user_id + route_id + started_at (increments "ride count" when someone follows a route).
- `route_comments` — id, route_id, user_id, body, created_at.

Public policies: anyone can SELECT `routes` where `visibility='public'`; owners can SELECT/INSERT/UPDATE/DELETE their own. POIs/comments inherit route visibility via join checks.

### Server functions (`src/lib/routes.functions.ts`)
- `listPublicRoutes` (publishable client) — Atlas hub feed.
- `getRoute` — public if public, else owner-only.
- `listMyRoutes`, `createRoute`, `updateRoute`, `deleteRoute` (auth).
- `saveRoute` / `unsaveRoute`, `startRide` (auth).
- `searchPlacesNearby` (auth) — calls Google Places via gateway to find hotels/food/fuel around a point.
- `addComment` / `listComments`.

### Client components
- `RouteMap.tsx` — loads Google Maps JS API via managed browser key (`loading=async` + callback), draws polyline + markers. Uses standard `google.maps.Marker` (no mapId).
- `RoutePlanner.tsx` — wraps RouteMap in edit mode; waypoint list + POI search sheet.
- `RouteRecorder.tsx` — uses `navigator.geolocation.watchPosition` only while mounted; downsamples points; shows live HUD (distance, duration, avg speed).
- `RouteCard.tsx` — Atlas hub tile, obsidian-glass style consistent with existing HUD.
- Add "Atlas" entry to `BottomNav` (replacing the least-used slot, TBD with you post-ship).

### Performance guardrails
- Map component is `React.lazy` + `<ClientOnly>` — never loaded on SSR, doesn't touch bundle of other pages.
- Geolocation watcher unmounts cleanly on route change.
- Path polylines are downsampled (Douglas-Peucker) before insert — capped at 2k points per route.
- Places lookups are debounced 400ms and cached per session.
- Atlas hub uses standard `useSuspenseQuery` with `ensureQueryData` in the loader.

## Shipment 2 — Reel speed upgrades

- **Camera-first "+":** long-press opens native camera (`<input capture>` on mobile); tap opens existing composer.
- **Double-tap-to-like** in `Reel.tsx` with heart burst animation, wired to existing `useInteractionState`.
- **Preload next 2 reels:** create hidden `<video preload="metadata">` for `items[i+1]` and `items[i+2]` on index change; free them when they slide past.

## Files touched

New:
- `src/lib/routes.functions.ts`
- `src/components/RouteMap.tsx`, `RoutePlanner.tsx`, `RouteRecorder.tsx`, `RouteCard.tsx`
- `src/routes/atlas.tsx`, `atlas.$id.tsx`
- `src/routes/_authenticated/atlas.new.tsx`, `atlas.record.tsx`, `atlas.mine.tsx`
- One Supabase migration for the 5 new tables + policies + GRANTs.

Modified:
- `src/components/BottomNav.tsx` — add Atlas entry.
- `src/components/Reel.tsx` — double-tap + preload.
- `src/routes/reels.tsx` — thread preload indices.
- `src/components/StatusBar.tsx` — long-press on "+" for camera-first.

## What I need from you
Just approval. I'll also need to link the **Google Maps (managed by Lovable)** connector — I'll trigger that step during build; you click "Connect" once in the popup.

## Not in this shipment (call out for later)
- Turn-by-turn voice navigation (needs native or heavy JS overlay).
- Offline map tiles.
- Live "group ride" tracking (multiple riders on one map in real time).
- Elevation profiles from Google Elevation API (easy add-on next round).
