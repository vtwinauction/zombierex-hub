# Coding Standards

## Languages / tooling

- TypeScript **strict**.
- ESLint (`bun run lint`) — no warnings on `main`.
- Prettier (`bun run format`) — 2-space indent, single quotes off (defaults).

## File naming

| Kind              | Convention          | Example                     |
| ----------------- | ------------------- | --------------------------- |
| Route             | flat, dot-separated | `settings.profile.tsx`      |
| Component         | PascalCase          | `InteractionBar.tsx`        |
| Hook              | `use*` camelCase    | `useInteractionState.ts`    |
| Lib / util        | kebab-case          | `interaction-queue.ts`      |
| Server functions  | `*.functions.ts`    | `reactions.functions.ts`    |
| Server-only       | `*.server.ts`       | `client.server.ts`          |

## Folder organization

- `src/routes/` — one file per URL.
- `src/components/` — presentation only, no direct browser API reads at module scope.
- `src/components/ui/` — shadcn primitives.
- `src/hooks/` — cross-cut hooks.
- `src/lib/` — pure logic, no JSX.
- `src/assets/` — imported binary assets.

## Component structure

1. Imports (external → internal → styles).
2. Types.
3. Component (`export function Foo(...)`).
4. Local helpers.

Keep components under ~250 lines. Split when they cross that line.

## Styling

- Use CSS tokens from `src/styles.css` (`var(--color-*)`) — never hex literals in JSX/CSS.
- Tailwind utility classes for layout / spacing.
- No inline styles except when the value is computed at runtime (glass surfaces, animated colors).

## Error handling

- Server functions throw `Response` with a proper status code.
- Client boundaries: `errorComponent` per route with `router.invalidate()` + `reset()` retry.
- Client errors reported via `reportLovableError`.

## Logging

- No `console.log` in shipped code (except intentional `console.error` inside error boundaries).
- Server functions log structured objects: `{ requestId, userId, event, meta }`.

## Git commit conventions

Conventional Commits:

```
feat(interaction-bar): add offline queue
fix(styles): resolve empty @utility crash
docs(readme): initial documentation set
refactor(profile): extract garage grid
chore(deps): bump tanstack-router
```

## Dependencies

- Add only what is necessary. Prefer web-standard APIs over polyfills.
- Do not add Node-only packages to server functions (Cloudflare Workers target).
- Pin caret ranges; lockfile committed.
- Audit new deps for edge compatibility.

## Comments

- Explain **why**, not what.
- Complex algorithms get a short block comment above them.
- Public utility functions get a JSDoc header.
