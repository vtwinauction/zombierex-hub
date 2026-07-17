# API Specifications

Two API surfaces are planned:

1. **Server functions** — typed RPC for the app itself.
2. **Public HTTP routes** — webhooks, cron, public reads.

## Server functions (`createServerFn`)

Colocated as `*.functions.ts` next to consumers. All authenticated actions use the `requireSupabaseAuth` middleware.

```ts
// src/lib/reactions.functions.ts
export const react = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    postId: z.string().uuid(),
    kind: z.enum(["like", "save", "share"]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("reactions").upsert({
      post_id: data.postId, user_id: userId, kind: data.kind,
    });
    if (error) throw new Response(error.message, { status: 400 });
    return { ok: true };
  });
```

### Planned endpoints

| Function        | Method | Auth | Purpose                             |
| --------------- | ------ | ---- | ----------------------------------- |
| `getFeed`       | GET    | opt  | Paginated feed for user/topic       |
| `getPost`       | GET    | opt  | Single post + comments              |
| `createPost`    | POST   | yes  | Publish photo / video / telemetry   |
| `deletePost`    | POST   | yes  | Owner or moderator                  |
| `react`         | POST   | yes  | Like / save / share upsert          |
| `unreact`       | POST   | yes  | Remove reaction                     |
| `comment`       | POST   | yes  | Add comment                         |
| `follow`        | POST   | yes  | Follow / unfollow                   |
| `getProfile`    | GET    | opt  | Public profile + garage             |
| `updateProfile` | POST   | yes  | Owner edits profile                 |
| `getListings`   | GET    | opt  | Marketplace listings                |
| `createListing` | POST   | yes  | Seller creates a listing            |
| `rsvp`          | POST   | yes  | Event RSVP                          |
| `sendMessage`   | POST   | yes  | DM / club message                   |

## Public HTTP routes (`src/routes/api/public/*`)

| Path                              | Method | Auth              | Purpose                            |
| --------------------------------- | ------ | ----------------- | ---------------------------------- |
| `/api/public/health`              | GET    | none              | Liveness probe                     |
| `/api/public/webhooks/stripe`     | POST   | HMAC (Stripe sig) | Payment lifecycle                  |
| `/api/public/webhooks/push`       | POST   | HMAC              | Push provider callbacks            |
| `/api/public/cron/digest`         | POST   | shared secret     | Daily digest fan-out               |

All public routes verify signatures with `timingSafeEqual` before processing.

## Error contract

- Server functions throw `Response` with HTTP status codes.
- `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `422 Validation`, `429 Too Many Requests`, `500 Server Error`.
- Errors surface in the client via TanStack Query and are logged through `reportLovableError`.
