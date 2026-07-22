# Atlas 3.0 — Premium Rider Suite

Enhancement of the existing ZOMBIEREX Atlas + Reels/Feed foundation. Everything ships as modular, opt-in features layered onto the current TanStack Start PWA — nothing already built gets removed. Native-only APIs (Apple CarPlay, Android Auto, OBD-II) that a web PWA cannot access are delivered through the best available web equivalent and clearly labeled so you know what runs where.

## Scope by feature

### 1. CarPlay / Android Auto (web equivalent: "Ride Mode")
- True CarPlay/Android Auto SDKs require a native shell (not available in a PWA). We deliver **Ride Mode** — a distraction-free, high-contrast, glove-friendly fullscreen route at `/atlas/ride` with 64px tap targets, voice cues, and screen-wake lock.
- Ready to wrap in a Capacitor shell later for real CarPlay/AA — the Ride Mode UI is designed to that spec.

### 2. Turn-by-turn navigation
- Google Directions via the connector gateway (motorcycle-friendly: avoid highways / tolls / unpaved toggles).
- Voice-guided cues using Web Speech API (`speechSynthesis`).
- Live re-route on 40m deviation, ETA + distance-remaining HUD.
- Offline: cache last route polyline + step list in IndexedDB so navigation continues without signal (tiles remain online-only in web).

### 3. Ride recording (upgraded)
- Auto-start option (motion + speed threshold) plus manual.
- Captures: path, distance, duration, avg/max speed, elevation (Elevation API), moving time.
- Ride detail page: replay animation, share, save as route, GPX export, photos + notes.
- New table `rides` (owner-scoped RLS) — separate from published `routes` so private telemetry stays private.

### 4. Live group ride tracking
- New tables `ride_groups`, `ride_group_members`, `ride_positions` with Supabase Realtime.
- Create/join by code, QR, or share link.
- Live map of all riders, per-rider status (moving/stopped/offline via last-ping age), pairwise distance, ETA to destination.
- Leader controls: set destination, pause sharing, remove rider.
- Positions retained only while group is active; encrypted in transit (HTTPS + RLS group membership check).

### 5. Motorcycle diagnostics (Web Bluetooth OBD-II)
- Chromium-based Android/Desktop only (Web Bluetooth). iOS Safari unsupported — labeled clearly.
- Pair ELM327 adapter, read: RPM, coolant temp, battery voltage, fuel level (if supported), DTC fault codes.
- `maintenance_log` table for service reminders + history + PDF-ready diagnostic report.

### 6. Fuel station alerts
- Places API (New) `searchNearby` for fuel category along active route.
- Distance, hours, rating, one-tap navigate.
- Alerts: after 150km continuous ride, or when OBD fuel < 15%, or manual "find fuel".

### 7. Emergency SOS
- Floating SOS button in Ride Mode + Atlas.
- Crash heuristic: sudden deceleration (DeviceMotion accelerometer) + speed drop to 0 + no movement for 20s → 15s countdown → auto-send.
- Sends live location link + rider profile + medical info to contacts via SMS share sheet / WhatsApp share / email.
- `emergency_contacts` table in profile settings.

### 8. Helmet voice commands
- Web Speech Recognition (Chromium) with wake phrase "Hey Rex".
- Commands: start/stop nav, record ride, call SOS, find fuel, find workshop, open garage, start group ride, end ride.
- Voice replies via `speechSynthesis`. Fully hands-free once Ride Mode is active.

## Technical section

Stack stays TanStack Start + Supabase (Lovable Cloud) + Google Maps connector (already linked).

New/updated files:
- `src/routes/_authenticated/atlas.ride.tsx` — Ride Mode fullscreen HUD
- `src/routes/_authenticated/rides.index.tsx`, `rides.$id.tsx` — ride history + replay
- `src/routes/_authenticated/groups.$id.tsx`, `groups.new.tsx` — live group ride
- `src/components/TurnByTurn.tsx`, `RideHUD.tsx`, `SosButton.tsx`, `VoiceCommander.tsx`, `ObdPanel.tsx`, `FuelAlerts.tsx`
- `src/lib/nav.functions.ts` — Directions proxy through gateway
- `src/lib/rides.functions.ts`, `groups.functions.ts`, `sos.functions.ts`, `obd.functions.ts`
- `src/lib/voice.ts`, `src/lib/gpx.ts`, `src/lib/crash-detect.ts`, `src/lib/web-bluetooth-obd.ts`
- Migration: `rides`, `ride_groups`, `ride_group_members`, `ride_positions`, `emergency_contacts`, `maintenance_log` (all with GRANTs + RLS scoped to `auth.uid()`; realtime enabled on `ride_positions`)

Performance & safety:
- GPS uses `watchPosition` with adaptive throttling (1s moving, 10s stopped) to preserve battery.
- Wake Lock API keeps screen on in Ride Mode.
- Voice + crash detection run only while Ride Mode active.
- All new routes lazy-loaded; no impact on feed/reels startup.
- Feature detection gates (Web Bluetooth, Speech, Wake Lock) with graceful fallbacks and clear "not supported on this device" messaging.

## Rollout order

1. Rides schema + Ride Mode HUD + turn-by-turn + voice cues
2. Ride history / replay / GPX export
3. Live group rides (realtime)
4. SOS + emergency contacts + crash detection
5. Fuel alerts along route
6. Voice commands (hands-free)
7. Web Bluetooth OBD-II diagnostics + maintenance log

Approve to start with step 1, or tell me a different order.
