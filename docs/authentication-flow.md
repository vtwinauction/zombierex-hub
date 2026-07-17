# Authentication Flow (planned, v0.5)

## Providers

- Email OTP (Supabase Auth)
- Google (managed)
- Apple (managed)

## Sequence

```text
Client                          Supabase Auth                     App (TSR)
  │  signInWithOtp(email)         │                                  │
  ├──────────────────────────────▶│                                  │
  │                               │  send OTP                        │
  │◀──────────────────────────────┤                                  │
  │  verify(otp)                  │                                  │
  ├──────────────────────────────▶│                                  │
  │  session + cookies            │                                  │
  │◀──────────────────────────────┤                                  │
  │                                                                  │
  │  navigate /_authenticated/*                                      │
  ├─────────────────────────────────────────────────────────────────▶│
  │                                            loader (server-safe)  │
  │                                            reads session cookie  │
  │◀─────────────────────────────────────────────────────────────────┤
```

## Rules

- `/_authenticated/*` layout gate redirects to `/auth` when no session.
- Server functions requiring auth attach `requireSupabaseAuth` middleware.
- Client-side `functionMiddleware` in `src/start.ts` attaches the bearer token.
- Roles live in `user_roles`; never on profiles.
- Never call a protected server function from a public route's loader — SSR has no token.

## Session

- Access token: short-lived JWT in cookie (`@supabase/ssr`).
- Refresh: rotated by Supabase JS on the client; SSR reads cookies.
- Sign-out: `supabase.auth.signOut()` + clear cookies + redirect to `/`.
