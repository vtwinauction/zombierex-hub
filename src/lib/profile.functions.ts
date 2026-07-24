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

export const getMyProfileMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const uid = context.userId;
    const [profileRes, vehicleRes, uaRes, achRes] = await Promise.all([
      context.supabase
        .from("profiles")
        .select(
          "id, handle, display_name, bio, website, avatar_url, cover_url, location, tier, is_verified, is_premium, followers_count, following_count, posts_count, listings_count, xp_total, level, streak_days"
        )
        .eq("id", uid)
        .maybeSingle(),
      context.supabase
        .from("vehicles")
        .select("id, kind, make, model, year, nickname, spec, hero_image_url, is_primary")
        .eq("owner_id", uid)
        .is("deleted_at", null)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      context.supabase
        .from("user_achievements")
        .select("achievement_slug, progress, target, unlocked_at")
        .eq("user_id", uid),
      context.supabase
        .from("achievements")
        .select("slug, title, description, tier, category"),
    ]);

    if (profileRes.error) throw new Error(profileRes.error.message);

    const profile = profileRes.data;
    const vehicle = vehicleRes.data ?? null;
    const userAch = uaRes.data ?? [];
    const allAch = achRes.data ?? [];

    const earnedSlugs = new Set(userAch.filter((r) => r.unlocked_at).map((r) => r.achievement_slug));

    return {
      profile,
      vehicle,
      earnedCount: earnedSlugs.size,
      totalAchievements: allAch.length,
      achievements: allAch.map((a) => ({
        slug: a.slug,
        title: a.title,
        detail: a.description,
        tier: a.tier,
        earned: earnedSlugs.has(a.slug),
      })),
    };
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
      avatar_url: z.string().url().max(2048).optional().or(z.literal("")),
      cover_url: z.string().url().max(2048).optional().or(z.literal("")),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const payload: Record<string, string | null> = { ...data };
    if (data.website === "") payload.website = null;
    if (data.avatar_url === "") payload.avatar_url = null;
    if (data.cover_url === "") payload.cover_url = null;
    const { data: row, error } = await context.supabase
      .from("profiles")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(payload as any)
      .eq("id", context.userId)
      .select()
      .single();
    if (error) {
      if (error.code === "23505" && error.message.includes("profiles_handle_key")) {
        throw new Error("That username is already taken. Please choose another.");
      }
      throw new Error(error.message);
    }
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
