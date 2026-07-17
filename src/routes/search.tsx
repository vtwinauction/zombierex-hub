import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StatusBar } from "@/components/StatusBar";
import { users, clubs, listings, posts, reels } from "@/lib/mock-data";
import { RiderBadge, RiderMark, type RiderTier } from "@/components/RiderBadge";


export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Signal · ZOMBIEREX" }, { name: "description", content: "Discover riders, builds, crews and parts across the ZOMBIEREX network." }] }),
  component: ExplorePage,
});

const CHIPS = ["FEED", "BUILDS", "RIDERS", "CREWS", "PARTS", "EVENTS", "TAGS"] as const;

function ExplorePage() {
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<(typeof CHIPS)[number]>("FEED");
  const grid = [...reels, ...posts];

  return (
    <div>
      <StatusBar index="02" section="SIGNAL · DISCOVER" />

      <div className="px-4 pt-6">
        <p className="mono-tag">NETWORK · LIVE INDEX</p>
        <h1 className="mt-2 display-xl text-5xl uppercase">Signal</h1>

        {/* Search rail */}
        <div className="mt-4 flex items-stretch hairline">
          <span className="grid place-items-center px-3 mono-tag" style={{ color: "var(--color-ash)" }}>QRY</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="riders · builds · parts · tags"
            className="flex-1 bg-transparent py-3 pr-3 text-sm placeholder:text-ash focus:outline-none"
            style={{ color: "var(--color-ink)" }}
          />
          <button className="mono-tag border-l border-hair px-4" style={{ color: "var(--color-signal)" }}>GO ▸</button>
        </div>
      </div>

      {/* Chip rail */}
      <div className="no-scrollbar mt-4 flex overflow-x-auto hairline-t hairline-b">
        {CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => setChip(c)}
            className="tap relative shrink-0 border-r border-hair px-4 py-3 mono-caps"
            style={{
              color: chip === c ? "var(--color-ink)" : "var(--color-ash)",
              background: chip === c ? "var(--color-mist)" : "transparent",
            }}
          >
            {c}
            {chip === c && <span className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: "var(--color-signal)" }} />}
          </button>
        ))}
      </div>

      <div className="space-y-8 px-4 pt-6">
        <section>
          <SectionHeader index="A" title="Frequencies · Trending Tags" />
          <div className="mt-3 flex flex-wrap gap-2">
            {["#nightride","#widebody","#nakedbike","#wrenchlife","#turbolife","#trackday","#jdm","#rally"].map((t, i) => (
              <span key={t} className="chip">
                <span style={{ color: "var(--color-ash)" }}>{String(i + 1).padStart(2, "0")}</span>
                <span>{t}</span>
              </span>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader index="B" title="Popular This Cycle" />
          <div className="mt-3 grid grid-cols-3 gap-0.5">
            {grid.map((item, i) => {
              const img = "poster" in item ? item.poster : item.image;
              const views = "views" in item ? item.views : `${((item.likes * 6.2) / 1000).toFixed(1)}K`;
              return (
                <div key={item.id} className="relative aspect-[3/4] overflow-hidden border border-hair">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                  <span className="absolute left-1.5 top-1.5 mono-tag" style={{ color: "rgba(255,255,255,0.8)" }}>{String(i+1).padStart(2,"0")}</span>
                  <span className="absolute bottom-1.5 left-1.5 mono-num text-[10px] font-bold text-white">▶ {views}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <SectionHeader index="C" title="Operators · Follow" />
          <ul className="mt-3 divide-y divide-hair hairline-t hairline-b">
            {users.map((u, i) => (
              <li key={u.id} className="flex items-center gap-3 py-3">
                <span className="display-numeral w-6 text-lg" style={{ color: "var(--color-ash)" }}>{String(i+1).padStart(2,"0")}</span>
                <img src={u.avatar} alt="" className="h-10 w-10 object-cover hairline" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[13.5px] font-bold">
                    {u.name}
                    {u.verified && <span className="mono-tag" style={{ color: "var(--color-signal)" }}>✓ VRF</span>}
                  </p>
                  <p className="mono-tag mt-0.5" style={{ color: "var(--color-ash)" }}>{u.handle} · ◎ {u.location}</p>
                </div>
                <button className="btn-ghost" style={{ padding: "8px 14px", fontSize: 10 }}>+ FOLLOW</button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionHeader index="D" title="Crews Near You" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {clubs.map((c, i) => (
              <div key={c.id} className="hairline overflow-hidden">
                <div className="relative h-24">
                  <img src={c.cover} alt="" className="h-full w-full object-cover" />
                  <span className="absolute left-2 top-2 mono-tag text-white" style={{ background: "rgba(0,0,0,0.55)", padding: "3px 6px" }}>CR·{String(i+1).padStart(2,"0")}</span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold">{c.name}</p>
                  <p className="mono-tag mt-1" style={{ color: "var(--color-ash)" }}>{c.tag} · {c.members.toLocaleString()} OPS</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader index="E" title="Fresh Drops" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {listings.slice(0, 2).map((l, i) => (
              <div key={l.id} className="hairline overflow-hidden">
                <img src={l.image} alt="" className="aspect-square w-full object-cover" />
                <div className="p-3">
                  <p className="mono-tag" style={{ color: "var(--color-ash)" }}>LOT·{String(i+1).padStart(3,"0")}</p>
                  <p className="mt-1 line-clamp-1 text-[13px] font-bold">{l.title}</p>
                  <p className="display-numeral mt-1 text-lg" style={{ color: "var(--color-signal)" }}>{l.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeader({ title, index }: { title: string; index: string }) {
  return (
    <div className="flex items-baseline justify-between hairline-b pb-2">
      <div className="flex items-baseline gap-3">
        <span className="mono-tag" style={{ color: "var(--color-signal)" }}>{index}</span>
        <h2 className="display-xl text-xl uppercase">{title}</h2>
      </div>
      <button className="mono-tag" style={{ color: "var(--color-ash)" }}>ALL →</button>
    </div>
  );
}
