# Vendor Flow (planned)

Vendors are marketplace sellers with `has_role(auth.uid(), 'vendor')`.

```text
Apply → verify identity + business → approved
        │
        ▼
/vendor
├── /listings       Create / edit / archive
├── /orders         Fulfill, ship, refund
├── /payouts        Stripe Connect payouts + KYC
└── /analytics      Views, conversion, revenue
```

Vendors cannot self-elevate; role is granted by an admin action which upserts into `user_roles`.
