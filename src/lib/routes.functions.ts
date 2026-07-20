/**
 * Route Atlas — plan, record, share motorcycle routes with POIs.
 */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const POI_KINDS = ["hotel","food","fuel","scenic","repair","viewpoint","custom"] as const;
export const DIFFICULTIES = ["easy","moderate","hard","expert"] as const;
export const SURFACES = ["paved","mixed","offroad"] as const;

const LatLng = z.object({ lat: z.number(), lng: z.number() });
const PoiInput = z.object({
  name: z.string().trim().min(1).max(120),
  kind: z.enum(POI_KINDS).default("custom"),
  google_place_id: z.string().max(200).optional().nullable(),
  lat: z.number(),
  lng: z.number(),
  address: z.string().max(400).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
  order_index: z.number().int().min(0).default(0),
});

const RouteInput = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().max(4000).optional().nullable(),
  visibility: z.enum(["public","private"]).default("public"),
  difficulty: z.enum(DIFFICULTIES).default("moderate"),
  surface: z.enum(SURFACES).default("paved"),
  region: z.string().max(120).optional().nullable(),
  cover_url: z.string().url().max(1000).optional().nullable(),
  path: z.array(LatLng).min(2).max(2000),
  distance_m: z.number().int().min(0).default(0),
  duration_s: z.number().int().min(0).default(0),
  source: z.enum(["planned","recorded"]).default("planned"),
  pois: z.array(PoiInput).max(60).default([]),
});

/* ------------------------------ Reads ------------------------------ */

export const listPublicRoutes = createServerFn({ method: "GET" })
  .inputValidator((d: { limit?: number; region?: string | null; difficulty?: string | null; surface?: string | null } = {}) => d)
  .handler(async ({ data }) => {
    const s = publicClient();
    let q = s.from("routes" as any)
      .select("id,title,description,visibility,distance_m,duration_s,difficulty,surface,region,cover_url,path,start_lat,start_lng,saves_count,rides_count,likes_count,owner_id,created_at")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(data.limit ?? 30, 1), 60));
    if (data.region) q = q.ilike("region", `%${data.region}%`);
    if (data.difficulty) q = q.eq("difficulty", data.difficulty);
    if (data.surface) q = q.eq("surface", data.surface);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getRoute = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const s = publicClient();
    const { data: route, error } = await s.from("routes" as any).select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!route) return null;
    const { data: pois } = await s.from("route_pois" as any).select("*").eq("route_id", data.id).order("order_index");
    const { data: owner } = await s.from("profiles").select("id,display_name,avatar_url").eq("id", (route as any).owner_id).maybeSingle();
    return { ...(route as any), pois: pois ?? [], owner };
  });

export const listMyRoutes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("routes" as any)
      .select("id,title,visibility,distance_m,duration_s,difficulty,surface,region,cover_url,saves_count,rides_count,created_at")
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listSavedRoutes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("route_saves" as any)
      .select("route_id, routes:route_id(id,title,visibility,distance_m,duration_s,difficulty,surface,region,cover_url,saves_count,rides_count,owner_id,created_at)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => r.routes).filter(Boolean);
  });

/* ------------------------------ Writes ------------------------------ */

export const createRoute = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof RouteInput>) => RouteInput.parse(d))
  .handler(async ({ data, context }) => {
    const first = data.path[0];
    const last = data.path[data.path.length - 1];
    const { data: inserted, error } = await context.supabase
      .from("routes" as any)
      .insert({
        owner_id: context.userId,
        title: data.title,
        description: data.description,
        visibility: data.visibility,
        difficulty: data.difficulty,
        surface: data.surface,
        region: data.region,
        cover_url: data.cover_url,
        path: data.path,
        distance_m: data.distance_m,
        duration_s: data.duration_s,
        source: data.source,
        start_lat: first.lat, start_lng: first.lng,
        end_lat: last.lat, end_lng: last.lng,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const routeId = (inserted as any).id as string;
    if (data.pois.length) {
      const rows = data.pois.map((p, i) => ({ ...p, route_id: routeId, order_index: p.order_index ?? i }));
      const { error: perr } = await context.supabase.from("route_pois" as any).insert(rows);
      if (perr) throw new Error(perr.message);
    }
    return { id: routeId };
  });

export const deleteRoute = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("routes" as any).delete().eq("id", data.id).eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleSaveRoute = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase.from("route_saves" as any)
      .select("route_id").eq("user_id", context.userId).eq("route_id", data.id).maybeSingle();
    if (existing) {
      await context.supabase.from("route_saves" as any).delete().eq("user_id", context.userId).eq("route_id", data.id);
      return { saved: false };
    }
    await context.supabase.from("route_saves" as any).insert({ user_id: context.userId, route_id: data.id });
    return { saved: true };
  });

export const startRide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("route_rides" as any).insert({ user_id: context.userId, route_id: data.id });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------ Places search via gateway ------------------------------ */

export const searchPlacesNearby = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { lat: number; lng: number; kind: string; query?: string; radius?: number }) =>
    z.object({
      lat: z.number(), lng: z.number(),
      kind: z.enum(POI_KINDS),
      query: z.string().max(120).optional(),
      radius: z.number().min(500).max(50000).default(15000),
    }).parse(d))
  .handler(async ({ data }) => {
    const LOVABLE = process.env.LOVABLE_API_KEY;
    const GKEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!LOVABLE || !GKEY) throw new Error("Maps not configured");
    const kindQuery: Record<string, string> = {
      hotel: "hotel motel lodging", food: "restaurant cafe diner", fuel: "gas station fuel",
      scenic: "scenic viewpoint", repair: "motorcycle repair mechanic",
      viewpoint: "viewpoint scenic overlook", custom: "point of interest",
    };
    const textQuery = (data.query?.trim() || kindQuery[data.kind]);
    const resp = await fetch("https://connector-gateway.lovable.dev/google_maps/places/v1/places:searchText", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE}`,
        "X-Connection-Api-Key": GKEY,
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating",
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: 12,
        locationBias: { circle: { center: { latitude: data.lat, longitude: data.lng }, radius: data.radius } },
      }),
    });
    if (!resp.ok) {
      const body = await resp.text();
      console.error("places search failed", resp.status, body);
      throw new Error(`Places search failed: ${resp.status}`);
    }
    const json = await resp.json() as any;
    return (json.places ?? []).map((p: any) => ({
      google_place_id: p.id,
      name: p.displayName?.text ?? "Unnamed",
      address: p.formattedAddress ?? null,
      lat: p.location?.latitude, lng: p.location?.longitude,
      rating: p.rating ?? null,
    })).filter((p: any) => typeof p.lat === "number");
  });
