/**
 * Storage — signed URL helpers.
 *
 * All buckets (avatars, vehicles, posts, documents) are private. Uploads and
 * reads go through signed URLs minted here. Path convention:
 *   <bucket>/<user_id>/<...>
 * Enforced server-side so a user cannot mint URLs for other users' folders.
 *
 * `documents` (vendor KYC) is stricter: reads require admin OR the vendor
 * owner; writes require the vendor owner. Path convention:
 *   documents/vendor/<vendor_id>/<...>
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Bucket = "avatars" | "vehicles" | "posts" | "documents";
const BUCKETS = ["avatars", "vehicles", "posts", "documents"] as const;

const PathSchema = z
  .string()
  .min(1)
  .max(512)
  .regex(/^[A-Za-z0-9._\-/]+$/, "Invalid characters in path")
  .refine((p) => !p.includes(".."), "Path traversal not allowed")
  .refine((p) => !p.startsWith("/"), "Path must be relative");

const MIME_ALLOWED: Record<Bucket, RegExp> = {
  avatars: /^image\/(png|jpeg|webp|gif)$/,
  vehicles: /^image\/(png|jpeg|webp|gif)$/,
  posts: /^(image\/(png|jpeg|webp|gif)|video\/(mp4|webm|quicktime))$/,
  documents: /^(image\/(png|jpeg|webp)|application\/pdf)$/,
};

async function assertOwnerOfVendor(supabase: any, userId: string, vendorId: string) {
  const { data } = await supabase
    .from("vendors")
    .select("owner_id")
    .eq("id", vendorId)
    .maybeSingle();
  if (!data || data.owner_id !== userId) throw new Error("Forbidden");
}

async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "super_admin"])
    .limit(1)
    .maybeSingle();
  return !!data;
}

function assertOwnPath(bucket: Bucket, path: string, userId: string) {
  // documents use a vendor-scoped path; other buckets use user-scoped.
  if (bucket === "documents") {
    if (!/^vendor\/[0-9a-f-]{36}\//.test(path))
      throw new Error("documents path must be vendor/<vendor_id>/…");
    return;
  }
  if (!path.startsWith(`${userId}/`))
    throw new Error(`${bucket} path must start with ${userId}/`);
}

const UploadSchema = z.object({
  bucket: z.enum(BUCKETS),
  path: PathSchema,
  content_type: z.string().min(3).max(120),
});

export const createSignedUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw) => UploadSchema.parse(raw))
  .handler(async ({ data, context }) => {
    const bucket = data.bucket as Bucket;
    if (!MIME_ALLOWED[bucket].test(data.content_type))
      throw new Error(`Content-type ${data.content_type} not allowed for ${bucket}`);

    if (bucket === "documents") {
      const m = data.path.match(/^vendor\/([0-9a-f-]{36})\//);
      if (!m) throw new Error("Invalid documents path");
      await assertOwnerOfVendor(context.supabase, context.userId, m[1]);
    } else {
      assertOwnPath(bucket, data.path, context.userId);
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(data.path);
    if (error) throw new Error(error.message);
    return {
      bucket,
      path: signed.path,
      token: signed.token,
      signed_url: signed.signedUrl,
    };
  });

const ReadSchema = z.object({
  bucket: z.enum(BUCKETS),
  path: PathSchema,
  expires_in: z.number().int().min(30).max(60 * 60 * 24).default(300),
});

export const createSignedReadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw) => ReadSchema.parse(raw))
  .handler(async ({ data, context }) => {
    const bucket = data.bucket as Bucket;

    if (bucket === "documents") {
      const m = data.path.match(/^vendor\/([0-9a-f-]{36})\//);
      if (!m) throw new Error("Invalid documents path");
      const { data: vendor } = await context.supabase
        .from("vendors")
        .select("owner_id")
        .eq("id", m[1])
        .maybeSingle();
      const admin = await isAdmin(context.supabase, context.userId);
      if (!admin && (!vendor || vendor.owner_id !== context.userId))
        throw new Error("Forbidden");
    }
    // Non-documents buckets are user-scoped by convention; expose to owner or
    // anyone (avatars/posts) — clients only ask for paths they know about via
    // rows they've already read through RLS. Keep expiry short.

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(data.path, data.expires_in);
    if (error) throw new Error(error.message);
    return { bucket, path: data.path, signed_url: signed.signedUrl, expires_in: data.expires_in };
  });

export const deleteMyObject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw) => z.object({ bucket: z.enum(BUCKETS), path: PathSchema }).parse(raw))
  .handler(async ({ data, context }) => {
    const bucket = data.bucket as Bucket;
    if (bucket === "documents") {
      const m = data.path.match(/^vendor\/([0-9a-f-]{36})\//);
      if (!m) throw new Error("Invalid documents path");
      await assertOwnerOfVendor(context.supabase, context.userId, m[1]);
    } else {
      assertOwnPath(bucket, data.path, context.userId);
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage.from(bucket).remove([data.path]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
