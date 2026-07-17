# Component Library

Custom components live in `src/components/`. shadcn primitives live in `src/components/ui/`.

## Layout & chrome

| Component     | File                     | Purpose                                          |
| ------------- | ------------------------ | ------------------------------------------------ |
| `BottomNav`   | `BottomNav.tsx`          | Floating pill navigation (five slots).           |
| `StatusBar`   | `StatusBar.tsx`          | Top status strip on primary routes.              |
| `StatusHUD`   | `StatusHUD.tsx`          | Compact HUD overlay for reels.                   |
| `FeedHeader`  | `FeedHeader.tsx`         | Editorial masthead atop the feed.                |
| `SideRail`    | `SideRail.tsx`           | Right-hand vertical action rail.                 |
| `StoriesRail` | `StoriesRail.tsx`        | Horizontal stories carousel.                     |

## Content

| Component        | File                  | Purpose                                             |
| ---------------- | --------------------- | --------------------------------------------------- |
| `Reel`           | `Reel.tsx`            | Full-viewport short-form video with autoplay.       |
| `TelemetryPost`  | `TelemetryPost.tsx`   | Photo/telemetry card with spec readouts.            |
| `RiderBadge`     | `RiderBadge.tsx`      | Metallic status tag (TURBO / APEX·REX / LEGEND).    |
| `InteractionBar` | `InteractionBar.tsx`  | Offline-capable social action strip (see below).    |

## Icons

`src/components/icons/RexIcons.tsx` exports the custom SVG family:

- `IconClaw` — Like.
- `IconVisor` — Comment.
- `IconLens` — Views.
- `IconMechClaw` — Share.
- `IconBoneMark` — Save.

All icons accept `{ size?: number; className?: string }` and inherit `currentColor`.

## HUD primitives

`src/components/hud.tsx` — chamfered panels, hairline dividers, tags used across the platform.

## InteractionBar contract

```ts
type InteractionCounts = {
  likes: number;
  comments: number;
  views: number | string;
  shares: number;
};

<InteractionBar
  counts={counts}
  variant="dark" | "light"
  targetId="stable-media-id" // used for queue keying
/>
```

Behavior:

- Optimistic updates on Like / Save / Share.
- All mutations queued via `interaction-queue.ts` (see `docs/system-architecture.md`).
- Status rail shows `SYNCING`, `OFFLINE · N QUEUED`, or `N FAILED · TAP TO RETRY`.

## Hooks

| Hook                    | File                            | Purpose                                     |
| ----------------------- | ------------------------------- | ------------------------------------------- |
| `useInteractionState`   | `hooks/useInteractionState.ts`  | Optimistic state + queue subscription.      |
| `useIsMobile`           | `hooks/use-mobile.tsx`          | Viewport breakpoint.                        |

## Utilities

| Module                                 | Purpose                                          |
| -------------------------------------- | ------------------------------------------------ |
| `lib/interaction-queue.ts`             | localStorage-backed mutation queue.              |
| `lib/mock-data.ts`                     | Prototype fixtures.                              |
| `lib/error-capture.ts`                 | Global error listeners.                          |
| `lib/error-page.ts`                    | SSR error page helper.                           |
| `lib/lovable-error-reporting.ts`       | `reportLovableError(error, ctx)`.                |
| `lib/utils.ts`                         | `cn()` class merger + misc.                      |
