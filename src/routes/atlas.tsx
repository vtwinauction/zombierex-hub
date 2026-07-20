import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listPublicRoutes } from "@/lib/routes.functions";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { RouteCard } from "@/components/RouteCard";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useState } from "react";

const atlasQuery = (filters: { difficulty?: string; surface?: string }) =>
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
    <div className="min-h-svh grid place-items-center p-6 text-sm text-white">Failed to load atlas: {error.message}</div>
  ),
  notFoundComponent: () => <div className="p-6 text-white">Not found</div>,
});

function AtlasPage() {
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const [surface, setSurface] = useState<string | undefined>();
  const { data: routes } = useSuspenseQuery(atlasQuery({ difficulty, surface }));
  const hidden = useScrollDirection() === "down";

  return (
    <div className="min-h-svh pb-32">
      <StatusBar index="03" section="ATLAS · ROUTES" />
      <div className="px-4 pt-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="serif text-3xl italic text-white">Route Atlas</h1>
            <p className="mono-tag mt-1" style={{ color: "var(--color-titanium)", fontSize: 10 }}>
              PLAN · RECORD · SHARE
            </p>
          </div>
          <Link
            to="/atlas/mine"
            className="tap mono-caps text-[10px] font-bold text-white/70"
            style={{ padding: "6px 10px", border: "1px solid var(--color-hair-strong)" }}
          >
            MY ROUTES
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link to="/atlas/new" className="tap p-3 text-center mono-caps text-xs font-bold" style={{ background: "var(--color-neon)", color: "var(--color-obsidian)" }}>
            + PLAN ON MAP
          </Link>
          <Link to="/atlas/record" className="tap p-3 text-center mono-caps text-xs font-bold text-white" style={{ background: "var(--color-graphite)", border: "1px solid var(--color-hair-strong)" }}>
            ● RECORD RIDE
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip label="ALL" active={!difficulty} onClick={() => setDifficulty(undefined)} />
          {["easy","moderate","hard","expert"].map((d) => (
            <Chip key={d} label={d.toUpperCase()} active={difficulty===d} onClick={() => setDifficulty(d)} />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip label="ANY SURFACE" active={!surface} onClick={() => setSurface(undefined)} />
          {["paved","mixed","offroad"].map((s) => (
            <Chip key={s} label={s.toUpperCase()} active={surface===s} onClick={() => setSurface(s)} />
          ))}
        </div>

        <div className="mt-5 grid gap-3">
          {routes.length === 0 && (
            <div className="border border-dashed border-white/15 p-8 text-center">
              <p className="text-white/70 text-sm">No routes yet.</p>
              <p className="mono-tag mt-2" style={{ color: "var(--color-titanium)", fontSize: 10 }}>Be the first to publish one.</p>
            </div>
          )}
          {routes.map((r: any) => <RouteCard key={r.id} route={r} />)}
        </div>
      </div>
      <BottomNav hidden={hidden} />
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="tap mono-caps"
      style={{
        fontSize: 10, padding: "5px 10px", fontWeight: 700,
        background: active ? "var(--color-neon)" : "transparent",
        color: active ? "var(--color-obsidian)" : "var(--color-titanium)",
        border: "1px solid " + (active ? "var(--color-neon)" : "var(--color-hair-strong)"),
      }}
    >{label}</button>
  );
}
