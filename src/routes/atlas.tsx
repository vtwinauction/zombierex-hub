import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listPublicRoutes } from "@/lib/routes.functions";
import { BottomNav } from "@/components/BottomNav";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Search, SlidersHorizontal, Plus, Circle, MapPin, ChevronUp, ChevronDown, X, Bluetooth,
  Hotel, UtensilsCrossed, Fuel, Mountain, Wrench, Route as RouteIcon, Bookmark, Locate,
} from "lucide-react";

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

const CATEGORIES = [
  { key: "all", label: "All", Icon: RouteIcon },
  { key: "scenic", label: "Scenic", Icon: Mountain },
  { key: "hotel", label: "Hotels", Icon: Hotel },
  { key: "food", label: "Food", Icon: UtensilsCrossed },
  { key: "fuel", label: "Fuel", Icon: Fuel },
  { key: "repair", label: "Repair", Icon: Wrench },
] as const;

function AtlasPage() {
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const [surface, setSurface] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sheet, setSheet] = useState<SheetSize>("peek");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [userHeading, setUserHeading] = useState<number | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "locating" | "ok" | "denied" | "unsupported">("idle");
  const [recenterTick, setRecenterTick] = useState(0);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const nav = useNavigate();
  const hidden = useScrollDirection() === "down";

  const { data: routesRaw } = useSuspenseQuery(atlasQuery({ difficulty, surface }));
  const routes = (routesRaw ?? []) as any[];

  // Auto-request location on first mount, then watch for movement updates
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("unsupported"); return;
    }
    setGeoStatus("locating");
    const opts: PositionOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 };
    const onPos = (p: GeolocationPosition) => {
      setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude });
      if (typeof p.coords.heading === "number" && !isNaN(p.coords.heading)) setUserHeading(p.coords.heading);
      setGeoStatus("ok");
    };
    const onErr = () => setGeoStatus("denied");
    navigator.geolocation.getCurrentPosition(onPos, onErr, opts);
    const id = navigator.geolocation.watchPosition(onPos, onErr, opts);
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter((r: any) =>
      r.title?.toLowerCase().includes(q) || r.region?.toLowerCase().includes(q)
    );
  }, [routes, query]);

  const mapPois = useMemo(() =>
    filtered
      .filter((r: any) => r.start_lat && r.start_lng)
      .map((r: any) => ({ lat: r.start_lat, lng: r.start_lng, name: r.title, kind: "custom" as const })),
  [filtered]);

  const activeRoute = filtered.find((r: any) => r.id === activeId) || null;
  const mapPath = activeRoute?.path ?? [];
  const mapCenter = activeRoute?.start_lat
    ? { lat: activeRoute.start_lat, lng: activeRoute.start_lng }
    : userLoc
      ? userLoc
      : filtered[0]?.start_lat
        ? { lat: filtered[0].start_lat, lng: filtered[0].start_lng }
        : undefined;

  useEffect(() => {
    if (activeId && cardRefs.current[activeId]) {
      cardRefs.current[activeId]!.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeId]);

  function recenterMe() {
    if (userLoc) { setRecenterTick((t) => t + 1); return; }
    if (typeof navigator === "undefined" || !navigator.geolocation) { setGeoStatus("unsupported"); return; }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude });
        if (typeof p.coords.heading === "number" && !isNaN(p.coords.heading)) setUserHeading(p.coords.heading);
        setGeoStatus("ok");
        setRecenterTick((t) => t + 1);
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  const sheetHeight: Record<SheetSize, string> = {
    peek: "18svh",
    half: "44svh",
    full: "82svh",
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* LIVE MAP — full screen */}
      <div className="absolute inset-0">
        <Suspense fallback={
          <div className="grid h-full w-full place-items-center bg-muted">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={16} className="animate-pulse" />
              Loading map…
            </div>
          </div>
        }>
          <RouteMap
            path={mapPath}
            pois={mapPois}
            center={mapCenter}
            zoom={activeRoute ? 10 : userLoc ? 13 : 6}
            interactive
            theme="light"
            className="h-full w-full"
            userLocation={userLoc}
            userHeading={userHeading}
            recenterKey={recenterTick}
          />
        </Suspense>
        {/* soft top gradient for control legibility */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-background/85 via-background/40 to-transparent" />
      </div>

      {/* TOP BAR */}
      <div className="absolute inset-x-0 top-0 z-20 px-3 pt-[max(env(safe-area-inset-top),12px)]">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-full px-3 py-2 bg-card/90 backdrop-blur-xl border border-border shadow-sm">
            <Search size={16} className="text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search routes, regions…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="tap text-muted-foreground" aria-label="Clear">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="tap grid h-10 w-10 place-items-center rounded-full border border-border shadow-sm"
            style={{
              background: showFilters ? "var(--color-neon)" : "hsl(var(--card) / 0.9)",
              color: showFilters ? "var(--color-obsidian)" : "hsl(var(--foreground))",
            }}
            aria-label="Filters"
          >
            <SlidersHorizontal size={16} />
          </button>
          <Link
            to="/atlas/mine"
            className="tap grid h-10 w-10 place-items-center rounded-full bg-card/90 backdrop-blur-xl border border-border shadow-sm text-foreground"
            aria-label="My routes"
          >
            <Bookmark size={16} />
          </Link>
          <BluetoothChip />
        </div>

        {/* Category chips — horizontal, iconified */}
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(({ key, label, Icon }) => {
            const active = category === key;
            return (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className="tap inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shrink-0 border shadow-sm transition-colors"
                style={{
                  background: active ? "var(--color-neon)" : "hsl(var(--card) / 0.92)",
                  color: active ? "var(--color-obsidian)" : "hsl(var(--foreground))",
                  borderColor: active ? "var(--color-neon)" : "hsl(var(--border))",
                }}
              >
                <Icon size={14} strokeWidth={2.2} />
                {label}
              </button>
            );
          })}
        </div>

        {showFilters && (
          <div className="mt-2 rounded-2xl p-3 bg-card/95 backdrop-blur-xl border border-border shadow-md">
            <p className="mono-caps text-[9px] mb-2 text-muted-foreground">DIFFICULTY</p>
            <div className="flex flex-wrap gap-1.5">
              <Chip label="ALL" active={!difficulty} onClick={() => setDifficulty(undefined)} />
              {["easy","moderate","hard","expert"].map((d) => (
                <Chip key={d} label={d.toUpperCase()} active={difficulty===d} onClick={() => setDifficulty(d)} />
              ))}
            </div>
            <p className="mono-caps text-[9px] mt-3 mb-2 text-muted-foreground">SURFACE</p>
            <div className="flex flex-wrap gap-1.5">
              <Chip label="ANY" active={!surface} onClick={() => setSurface(undefined)} />
              {["paved","mixed","offroad"].map((s) => (
                <Chip key={s} label={s.toUpperCase()} active={surface===s} onClick={() => setSurface(s)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT-SIDE FLOATING ACTIONS */}
      <div className="absolute right-3 z-20 flex flex-col gap-2"
        style={{ top: showFilters ? "260px" : "128px" }}>
        <Link to="/atlas/new" aria-label="Plan route"
          className="tap grid h-12 w-12 place-items-center rounded-full shadow-lg"
          style={{ background: "var(--color-neon)", color: "var(--color-obsidian)" }}>
          <Plus size={22} strokeWidth={2.5} />
        </Link>
        <Link to="/atlas/record" aria-label="Record ride"
          className="tap grid h-12 w-12 place-items-center rounded-full bg-card border border-border shadow-lg"
          style={{ color: "#e11d48" }}>
          <Circle size={20} strokeWidth={2.5} fill="#e11d48" />
        </Link>
        <button
          aria-label="Recenter on my location"
          onClick={recenterMe}
          className="tap grid h-12 w-12 place-items-center rounded-full bg-card border border-border shadow-lg"
          style={{ color: geoStatus === "ok" ? "var(--color-neon-deep, #4b8f00)" : "var(--color-ink-0)" }}>
          <Locate size={18} strokeWidth={2.2} style={geoStatus === "locating" ? { animation: "pulse 1.1s ease-in-out infinite" } : undefined} />
        </button>
      </div>

      {/* BOTTOM SHEET — light theme */}
      <div
        className="absolute inset-x-0 bottom-0 z-30 rounded-t-3xl bg-card/95 backdrop-blur-2xl border-t border-border transition-[height] duration-300 ease-out"
        style={{
          height: sheetHeight[sheet],
          boxShadow: "0 -20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <button
          onClick={() => setSheet(sheet === "full" ? "peek" : sheet === "peek" ? "half" : "full")}
          className="tap flex w-full flex-col items-center pt-2 pb-1"
          aria-label="Toggle sheet"
        >
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </button>

        <div className="flex items-center justify-between px-4 pb-2">
          <div className="min-w-0">
            <p className="serif text-xl italic text-foreground leading-tight truncate">Route Atlas</p>
            <p className="mono-caps text-[9px] text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "ROUTE" : "ROUTES"}
              {difficulty && ` · ${difficulty.toUpperCase()}`}
              {surface && ` · ${surface.toUpperCase()}`}
            </p>
          </div>
          <button
            onClick={() => setSheet(sheet === "full" ? "half" : "full")}
            className="tap grid h-8 w-8 place-items-center rounded-full bg-muted text-foreground shrink-0"
            aria-label="Expand"
          >
            {sheet === "full" ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>

        {sheet === "peek" ? (
          <div className="flex gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-none">
            {filtered.length === 0 && <EmptyState />}
            {filtered.map((r: any) => (
              <div key={r.id} ref={(el) => { cardRefs.current[r.id] = el; }} className="snap-start shrink-0 w-[78%]">
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
                  <div key={r.id} ref={(el) => { cardRefs.current[r.id] = el; }}>
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
      className="tap flex gap-3 rounded-2xl p-2 transition-all border"
      style={{
        background: active ? "color-mix(in oklab, var(--color-neon) 12%, hsl(var(--card)))" : "hsl(var(--card))",
        borderColor: active ? "var(--color-neon)" : "hsl(var(--border))",
      }}
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
        {route.cover_url ? (
          <img src={route.cover_url} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground"><MapPin size={20} /></div>
        )}
        <div className="absolute inset-x-1 bottom-1 text-center">
          <span className="mono-num text-[10px] font-bold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>{km} KM</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="mono-caps text-[9px] font-bold" style={{ color: "var(--color-obsidian)", background: "var(--color-neon)", padding: "1px 6px", borderRadius: 3, display: "inline-block" }}>
          {route.difficulty?.toUpperCase()} · {route.surface?.toUpperCase()}
        </p>
        <p className="truncate text-sm font-semibold text-foreground leading-tight mt-1">{route.title}</p>
        <p className="mono-tag mt-1 truncate text-muted-foreground" style={{ fontSize: 9 }}>
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
    <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-muted/30">
      <MapPin className="mx-auto text-muted-foreground" size={22} />
      <p className="mt-2 text-sm text-foreground">No routes match.</p>
      <p className="mono-tag mt-1 text-muted-foreground" style={{ fontSize: 10 }}>Try clearing filters or plan the first one.</p>
      <Link to="/atlas/new" className="tap mt-3 inline-flex items-center gap-1.5 mono-caps text-[10px] font-bold"
        style={{ padding: "8px 14px", background: "var(--color-neon)", color: "var(--color-obsidian)", borderRadius: 999 }}>
        <Plus size={12} strokeWidth={3} /> PLAN ROUTE
      </Link>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="tap mono-caps rounded-full border"
      style={{
        fontSize: 10, padding: "5px 10px", fontWeight: 700,
        background: active ? "var(--color-neon)" : "hsl(var(--muted))",
        color: active ? "var(--color-obsidian)" : "hsl(var(--foreground))",
        borderColor: active ? "var(--color-neon)" : "hsl(var(--border))",
      }}
    >{label}</button>
  );
}
