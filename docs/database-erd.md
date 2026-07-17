# Database ERD (planned)

Prototype uses `src/lib/mock-data.ts`. The following schema is the target for v0.5 (Lovable Cloud / Supabase).

```text
profiles ─┐
          ├─< follows >─ profiles
          │
          ├─< vehicles ─< listings
          │
          ├─< posts ──< reactions
          │       └──< comments
          │
          ├─< clubs (owner)
          │       └─< club_members >─ profiles
          │
          ├─< events (host)
          │
          ├─< messages (via threads)
          │
          ├─< notifications
          │
          └─< user_roles (RBAC)
```

## Tables

### profiles
`id uuid PK` (auth.users.id) · `handle text unique` · `display_name text` · `avatar_url text` · `bio text` · `tier text` · `created_at timestamptz`

### user_roles
`id uuid PK` · `user_id uuid → auth.users` · `role app_role` (`admin|moderator|user|vendor`) · `unique(user_id, role)`
Roles are checked via `public.has_role(_user_id uuid, _role app_role) SECURITY DEFINER`.

### vehicles
`id uuid PK` · `owner_id uuid → profiles` · `make text` · `model text` · `year int` · `spec_json jsonb` · `hero_image_url text`

### posts
`id uuid PK` · `author_id uuid → profiles` · `kind text` (`video|photo|telemetry|event`) · `media_url text` · `caption text` · `created_at timestamptz`

### reactions
`id uuid PK` · `post_id uuid → posts` · `user_id uuid → profiles` · `kind text` (`like|save|share`) · `created_at timestamptz` · `unique(post_id, user_id, kind)`

### comments
`id uuid PK` · `post_id` · `author_id` · `body text` · `created_at`

### follows
`follower_id, followee_id PK` · `created_at`

### clubs / club_members
`clubs(id, name, slug unique, banner_url, owner_id)` · `club_members(club_id, user_id, role)`

### listings
`id uuid PK` · `seller_id` · `vehicle_id` · `price_cents int` · `currency text` · `status text` · `created_at`

### events
`id uuid PK` · `host_id` · `title` · `starts_at` · `geo geography(Point)` · `cover_url`

### messages / message_threads
`message_threads(id, kind[dm|club])` · `messages(id, thread_id, sender_id, body, created_at)`

### notifications
`id uuid PK` · `user_id` · `kind text` · `payload_json jsonb` · `read_at timestamptz`

## RLS policy shape

Every table enables RLS. Grants are added in the same migration:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.<table> TO authenticated;
GRANT ALL ON public.<table> TO service_role;
-- Optional: GRANT SELECT ON public.<table> TO anon; -- only for public reads
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;
```

Typical policies:

- `select` — public reads for feed/marketplace; `auth.uid()` scoped for DMs and notifications.
- `insert` — `auth.uid() = author_id / owner_id / sender_id`.
- `update / delete` — owner only, or `has_role(auth.uid(),'moderator')`.
