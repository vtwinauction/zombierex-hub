# Backup & Recovery

## Database (planned, once Lovable Cloud is enabled)

- Supabase managed daily backups (PITR available on paid tiers).
- Nightly `pg_dump` of critical tables (`profiles`, `posts`, `vehicles`, `listings`, `messages`) to an offsite bucket via a cron server route.
- Retention: 7 daily, 4 weekly, 6 monthly.

## Restore

1. Identify target timestamp.
2. In Supabase dashboard: **Database → Backups → Restore**.
3. If restoring one table, `pg_restore --data-only --table=<name>` into a temp schema, diff, then merge.
4. Post-restore: re-run RLS smoke tests; invalidate CDN.

## Storage

Supabase Storage buckets have versioning enabled. Deleted objects retained 30 days. Cross-region replication planned pre-v1.0.

## Application state

- Interaction queue lives in the user's `localStorage`; no server-side backup required.
- Client caches (TanStack Query) are ephemeral; no backup needed.

## RTO / RPO targets

- **RTO** 1 hour (frontend rollback: seconds; DB restore: up to 1 hour).
- **RPO** 24 hours pre-v1.0; 5 minutes at v1.0 with PITR.
