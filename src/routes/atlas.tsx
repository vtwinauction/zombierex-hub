import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listPublicRoutes } from "@/lib/routes.functions";
import { BottomNav } from "@/components/BottomNav";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, Plus, Circle, Bookmark, MapPin, ChevronUp, ChevronDown, X } from "lucide-react";

const RouteMap = lazy(() => import("@/components/RouteMap"));

const atlasQuery = (filters: { difficulty?: string; surface?: string; region?: string }) =>
  queryOptions({
    queryKey: ["atlas", filters],
    queryFn: () => listPublicRoutes({ data: filters }),
  });

export const Route = createFileRoute("/atlas")({
  head: () => ({
    meta: [
      { title: "Route Atlas — Zombierex" },
      { name: "description", content: "Discover, save, and share motorcycle routes with hotels, restaurants, and scenic stops." },
      { property: "og:title", content: "Route Atlas — Zombierex" },
      { property: "og:description", content: "Rider-planned routes with POIs. Ride them, save them, share them." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(atlasQuery({})),
  component: AtlasPage,
  errorComponent: ({ error }) => (
    <div className="min-h-svh grid place-items-center p-6 text-sm">Failed to load atlas: {error.message}</div>
  ),
  notFoundComponent: () => <div className="p-6">Not found</div>,
});

type SheetSize = "peek" | "half" | "full";

function AtlasPage() {
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const [surface, setSurface] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sheet, setSheet] = useState<SheetSize>("half");
  const [activeId, setActiveId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const nav = useNavigate();
  const hidden = useScrollDirection() === "down";

  const { data: routes } = useSuspenseQuery(atlasQuery({ difficulty, surface }));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter((r: any) =>
      r.title?.toLowerCase().includes(q) || r.region?.toLowerCase().includes(q)
    );
  }, [routes, query]);

  // POIs = route start markers
  const mapPois = useMemo(() =>
    filtered
      .filter((r: any) => r.start_lat && r.start_lng)
      .map((r: any) => ({ lat: r.start_lat, lng: r.start_lng, name: r.title, kind: "custom" as const })),
  [filtered]);

  const activeRoute = filtered.find((r: any) => r.id === activeId) || null;
  const mapPath = activeRoute?.path ?? [];
  const mapCenter = activeRoute?.start_lat
    ? { lat: activeRoute.start_lat, lng: activeRoute.start_lng }
    : filtered[0]?.start_lat
      ? { lat: filtered[0].start_lat, lng: filtered[0].start_lng }
      : undefined;

  useEffect(() => {
    if (activeId && cardRefs.current[activeId]) {
      cardRefs.current[activeId]!.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeId]);

  const sheetHeight: Record<SheetSize, string> = {
    peek: "22svh",
    half: "52svh",
    full: "88svh",
  };

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "var(--color-obsidian)" }}>
      {/* MAP — full screen */}
      <div className="absolute inset-0">
        <Suspense fallback={<div className="h-full w-full" style={{ background: "#0b0d10" }} />}>
          <RouteMap
            path={mapPath}
            pois={mapPois}
            center={mapCenter}
            zoom={activeRoute ? 10 : 6}
            interactive
            className="h-full w-full"
          />
        </Suspense>
        {/* dim overlay for legibility of top controls */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />
      </div>

      {/* TOP BAR — search + filters */}
      <div className="absolute inset-x-0 top-0 z-20 px-4 pt-[max(env(safe-area-inset-top),12px)]">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-full px-3 py-2 backdrop-blur-xl"
            style={{ background: "rgba(15,17,20,0.75)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <Search size={16} className="text-white/70" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search routes, regions…"
              className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="tap text-white/60"><X size={14} /></button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="tap grid h-10 w-10 place-items-center rounded-full backdrop-blur-xl"
            style={{
              background: showFilters ? "var(--color-neon)" : "rgba(15,17,20,0.75)",
              color: showFilters ? "var(--color-obsidian)" : "white",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            aria-label="Filters"
          >
            <SlidersHorizontal size={16} />
          </button>
          <Link
            to="/atlas/mine"
            className="tap grid h-10 w-10 place-items-center rounded-full backdrop-blur-xl text-white"
            style={{ background: "rgba(15,17,20,0.75)", border: "1px solid rgba(255,255,255,0.12)" }}
            aria-label="My routes"
          >
            <Bookmark size={16} />
          </Link>
        </div>

        {showFilters && (
          <div className="mt-2 rounded-2xl p-3 backdrop-blur-xl"
            style={{ background: "rgba(15,17,20,0.82)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <p className="mono-caps text-[9px] mb-2" style={{ color: "var(--color-titanium)" }}>DIFFICULTY</p>
            <div className="flex flex-wrap gap-1.5">
              <Chip label="ALL" active={!difficulty} onClick={() => setDifficulty(undefined)} />
              {["easy","moderate","hard","expert"].map((d) => (
                <Chip key={d} label={d.toUpperCase()} active={difficulty===d} onClick={() => setDifficulty(d)} />
              ))}
            </div>
            <p className="mono-caps text-[9px] mt-3 mb-2" style={{ color: "var(--color-titanium)" }}>SURFACE</p>
            <div className="flex flex-wrap gap-1.5">
              <Chip label="ANY" active={!surface} onClick={() => setSurface(undefined)} />
              {["paved","mixed","offroad"].map((s) => (
                <Chip key={s} label={s.toUpperCase()} active={surface===s} onClick={() => setSurface(s)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FLOATING ACTIONS — right side */}
      <div className="absolute right-3 z-20 flex flex-col gap-2"
        style={{ top: showFilters ? "220px" : "72px" }}>
        <Link to="/atlas/new" aria-label="Plan route"
          className="tap grid h-12 w-12 place-items-center rounded-full shadow-lg"
          style={{ background: "var(--color-neon)", color: "var(--color-obsidian)" }}>
          <Plus size={22} strokeWidth={2.5} />
        </Link>
        <Link to="/atlas/record" aria-label="Record ride"
          className="tap grid h-12 w-12 place-items-center rounded-full backdrop-blur-xl"
          style={{ background: "rgba(15,17,20,0.85)", color: "#ff5c5c", border: "1px solid rgba(255,255,255,0.12)" }}>
          <Circle size={20} strokeWidth={2.5} fill="#ff5c5c" />
        </Link>
      </div>

      {/* BOTTOM SHEET */}
      <div
        className="absolute inset-x-0 bottom-0 z-30 rounded-t-3xl backdrop-blur-2xl transition-[height] duration-300 ease-out"
        style={{
          height: sheetHeight[sheet],
          background: "rgba(11,13,16,0.92)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderBottom: "none",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Grabber */}
        <button
          onClick={() => setSheet(sheet === "full" ? "peek" : sheet === "peek" ? "half" : "full")}
          className="tap flex w-full flex-col items-center pt-2 pb-1"
          aria-label="Toggle sheet"
        >
          <div className="h-1 w-10 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }} />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2">
          <div>
            <p className="serif text-xl italic text-white leading-tight">Route Atlas</p>
            <p className="mono-caps text-[9px]" style={{ color: "var(--color-titanium)" }}>
              {filtered.length} {filtered.length === 1 ? "ROUTE" : "ROUTES"}
              {difficulty && ` · ${difficulty.toUpperCase()}`}
              {surface && ` · ${surface.toUpperCase()}`}
            </p>
          </div>
          <button
            onClick={() => setSheet(sheet === "full" ? "half" : "full")}
            className="tap grid h-8 w-8 place-items-center rounded-full"
            style={{ background: "rgba(255,255,255,0.08)", color: "white" }}
            aria-label="Expand"
          >
            {sheet === "full" ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>

        {/* Content: peek = horizontal carousel, half/full = vertical list */}
        {sheet === "peek" ? (
          <div className="flex gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-none">
            {filtered.length === 0 && <EmptyState />}
            {filtered.map((r: any) => (
              <div key={r.id} ref={(el) => (cardRefs.current[r.id] = el)} className="snap-start shrink-0 w-[78%]">
                <MapRouteCard route={r} active={activeId === r.id}
                  onSelect={() => setActiveId(r.id)}
                  onOpen={() => nav({ to: "/atlas/$id", params: { id: r.id } })} />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-y-auto px-4 pb-24" style={{ height: `calc(${sheetHeight[sheet]} - 88px)` }}>
            {filtered.length === 0 ? <EmptyState /> : (
              <div className="grid gap-3">
                {filtered.map((r: any) => (
                  <div key={r.id} ref={(el) => (cardRefs.current[r.id] = el)}>
                    <MapRouteCard route={r} active={activeId === r.id}
                      onSelect={() => { setActiveId(r.id); setSheet("peek"); }}
                      onOpen={() => nav({ to: "/atlas/$id", params: { id: r.id } })} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav hidden={hidden} />
    </div>
  );
}

function MapRouteCard({ route, active, onSelect, onOpen }: { route: any; active: boolean; onSelect: () => void; onOpen: () => void }) {
  const km = (route.distance_m / 1000).toFixed(1);
  const hrs = Math.floor(route.duration_s / 3600);
  const mins = Math.round((route.duration_s % 3600) / 60);
  return (
    <div
      onClick={onSelect}
      className="tap flex gap-3 rounded-2xl p-2 transition-all"
      style={{
        background: active ? "rgba(198,255,61,0.10)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? "var(--color-neon)" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl" style={{ background: "#0f1114" }}>
        {route.cover_url ? (
          <img src={route.cover_url} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="grid h-full w-full place-items-center text-white/25"><MapPin size={20} /></div>
        )}
        <div className="absolute inset-x-1 bottom-1 text-center">
          <span className="mono-num text-[10px] font-bold text-white" style={{ textShadow: "0 1px 2px black" }}>{km} KM</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="mono-caps text-[9px]" style={{ color: "var(--color-neon)" }}>
          {route.difficulty?.toUpperCase()} · {route.surface?.toUpperCase()}
        </p>
        <p className="truncate text-sm font-semibold text-white leading-tight mt-0.5">{route.title}</p>
        <p className="mono-tag mt-1 truncate" style={{ color: "var(--color-titanium)", fontSize: 9 }}>
          {route.region ? `${route.region} · ` : ""}{hrs > 0 ? `${hrs}h ` : ""}{mins}m · ★ {route.saves_count} · ▶ {route.rides_count}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="tap mt-1.5 mono-caps text-[9px] font-bold"
          style={{ padding: "3px 8px", background: "var(--color-neon)", color: "var(--color-obsidian)", borderRadius: 4 }}
        >
          OPEN →
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed p-8 text-center" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
      <p className="text-sm text-white/80">No routes match.</p>
      <p className="mono-tag mt-1" style={{ color: "var(--color-titanium)", fontSize: 10 }}>Try clearing filters or plan the first one.</p>
      <Link to="/atlas/new" className="tap mt-3 inline-block mono-caps text-[10px] font-bold"
        style={{ padding: "6px 12px", background: "var(--color-neon)", color: "var(--color-obsidian)", borderRadius: 999 }}>
        + PLAN ROUTE
      </Link>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="tap mono-caps rounded-full"
      style={{
        fontSize: 10, padding: "5px 10px", fontWeight: 700,
        background: active ? "var(--color-neon)" : "rgba(255,255,255,0.06)",
        color: active ? "var(--color-obsidian)" : "white",
        border: `1px solid ${active ? "var(--color-neon)" : "rgba(255,255,255,0.10)"}`,
      }}
    >{label}</button>
  );
}
