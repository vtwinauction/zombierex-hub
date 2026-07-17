/**
 * Profile server functions — authenticated, RLS-scoped.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const HandleSchema = z
  .string()
  .trim()
  .min(3)
  .max(24)
  .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only");

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, handle, display_name, bio, avatar_url, cover_url, tier, is_verified, followers_count, following_count, posts_count, location, website")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({
      handle: HandleSchema.optional(),
      display_name: z.string().trim().min(1).max(80).optional(),
      bio: z.string().trim().max(500).optional(),
      location: z.string().trim().max(120).optional(),
      website: z.string().trim().url().max(255).optional().or(z.literal("")),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const payload = { ...data, website: data.website === "" ? null : data.website };
    const { data: row, error } = await context.supabase
      .from("profiles")
      .update(payload)
      .eq("id", context.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.role);
  });
