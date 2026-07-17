# Admin Flow (planned)

Admin console is a role-gated set of routes under `src/routes/_authenticated/admin/*`.
Access requires `has_role(auth.uid(), 'admin')`.

```text
/admin
├── /dashboard      KPI cards: DAU, posts/day, listings, reports open
├── /moderation     Queue of reported posts/comments/users
├── /users          Search, ban, adjust roles
├── /listings       Approve, remove, feature
├── /events         Approve featured events
└── /system         Feature flags, kill switches, cache purge
```

Every mutation writes an `admin_audit_log` row (actor, action, target, timestamp, ip).
