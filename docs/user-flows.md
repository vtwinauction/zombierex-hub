# User Flow Diagrams

## Onboarding
```text
Landing → Sign in (email OTP / Google / Apple) → Create handle → Pick tier interests → Add first vehicle → Land on Feed
```

## Post consumption
```text
Feed → tap Reel → autoplay → InteractionBar (Like/Save/Share) → optimistic update → queue drains in background
```

## Post creation
```text
Bottom nav "+" → choose kind (video/photo/telemetry) → upload → caption + tags → publish
```

## Marketplace purchase (planned)
```text
Vault → listing detail → contact seller OR buy → Stripe checkout → order confirmed → thread opened
```

## Event RSVP (planned)
```text
Events → event detail → RSVP → calendar hold → notification 24h before
```

## Messaging
```text
Messages → thread → compose → send → optimistic bubble → delivered/read receipts
```
