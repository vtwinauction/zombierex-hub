# Security

## Principles

- Least privilege everywhere.
- Never trust the client; validate on the server.
- Secrets never in the repo; only via Lovable secret tooling.
- Every table has RLS + explicit `GRANT`s.
- Roles in a dedicated `user_roles` table, checked via `SECURITY DEFINER has_role()`.

## Authentication

- Supabase Auth (email OTP + Google + Apple).
- Sessions stored as httpOnly cookies (`@supabase/ssr`).
- Access tokens are short-lived; refresh rotates.

## Authorization

- RLS policies scope every read/write to `auth.uid()` or `has_role(auth.uid(),...)`.
- Server functions requiring privilege first verify role via `context.supabase` (RLS-scoped) — **never** by hitting the service-role client.
- `supabaseAdmin` is only imported inside `.server.ts` files or dynamically inside handler bodies.

## Input validation

- All server function inputs are Zod-validated via `.inputValidator()`.
- All public HTTP routes verify signatures (`timingSafeEqual`) before parsing.

## Transport

- HTTPS everywhere (Cloudflare edge).
- HSTS via response headers on published domains.

## Client hardening

- CSP: script-src 'self' plus Lovable domains; no inline scripts except React hydration.
- No hardcoded credentials in the client bundle.
- Publishable keys only in `VITE_*` vars.

## Logging & monitoring

- `reportLovableError` streams client errors to Lovable's error pipeline.
- Server functions log structured errors with request IDs.

## Secrets management

- `add_secret` for user-provided keys.
- `generate_secret` for signing keys.
- Never commit `.env`.

## Threat model highlights

| Threat                      | Control                                                    |
| --------------------------- | ---------------------------------------------------------- |
| Privilege escalation        | Roles in `user_roles`; `has_role()` SECURITY DEFINER       |
| Broken RLS on new table     | Migration template forces `GRANT` + `ENABLE RLS` + policy  |
| Webhook spoofing            | HMAC verify + `timingSafeEqual`                            |
| Token leakage via init script | `page.evaluate` only after localhost navigation           |
| XSS via user content        | React default escaping + Zod + no `dangerouslySetInnerHTML` |
| Rate abuse                  | Edge rate limits + per-user throttles on server functions   |
