import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Sparkles, Flame } from "lucide-react";
import { users, clubs, listings, posts, reels } from "@/lib/mock-data";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Explore · ZOMBIEREX" }] }),
  component: ExplorePage,
});

const CHIPS = ["For You", "Rides", "Builds", "Creators", "Parts", "Events", "Tags"] as const;

function ExplorePage() {
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<(typeof CHIPS)[number]>("For You");
  const grid = [...reels, ...posts];

  return (
    <div className="pb-28">
      <div className="sticky top-0 z-30 bg-bone/70 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-lg">
        <div className="px-4 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight">Explore</h1>
          <div className="mt-3 flex items-center gap-2 rounded-full border border-hair bg-white px-4 py-2.5 shadow-sm">
            <Search className="h-4 w-4 text-ash" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search riders, builds, parts…"
              className="flex-1 bg-transparent text-sm placeholder:text-ash focus:outline-none"
            />
          </div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => setChip(c)}
                className={`tap shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold transition ${
                  chip === c ? "bg-ink text-bone" : "border border-hair bg-white text-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 pt-4">
        <section>
          <SectionHeader icon={<Sparkles className="h-4 w-4" />} title="Trending tags" />
          <div className="mt-3 flex flex-wrap gap-2">
            {["#nightride","#widebody","#nakedbike","#wrenchlife","#turbolife","#trackday","#jdm","#rally"].map((t, i) => (
              <span key={t} className="chip">
                <span className="mono-caps text-ash">{String(i + 1).padStart(2, "0")}</span>
                <span>{t}</span>
              </span>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader icon={<Flame className="h-4 w-4" style={{ color: "var(--color-heat)" }} />} title="Popular this week" />
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {grid.map((item) => {
              const img = "poster" in item ? item.poster : item.image;
              const views = "views" in item ? item.views : `${((item.likes * 6.2) / 1000).toFixed(1)}K`;
              return (
                <div key={item.id} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold text-white">▶ {views}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <SectionHeader title="Creators to follow" />
          <div className="mt-3 space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-2xl border border-hair bg-white p-3">
                <div className="story-ring">
                  <div className="rounded-full bg-white p-[2px]">
                    <img src={u.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-[13.5px] font-semibold">
                    {u.name}
                    {u.verified && <span className="grid h-3.5 w-3.5 place-items-center rounded-full text-[9px] font-bold text-ink" style={{ background: "var(--color-signal)" }}>✓</span>}
                  </p>
                  <p className="text-[11px] text-ash">{u.handle} · {u.location}</p>
                </div>
                <button className="tap rounded-full bg-ink px-3.5 py-1.5 text-[11px] font-bold text-bone">Follow</button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Crews near you" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            {clubs.map((c) => (
              <div key={c.id} className="overflow-hidden rounded-2xl border border-hair bg-white">
                <img src={c.cover} alt="" className="h-24 w-full object-cover" />
                <div className="p-3">
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-[11px] text-ash">{c.tag} · {c.members.toLocaleString()} members</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Fresh drops" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            {listings.slice(0, 2).map((l) => (
              <div key={l.id} className="overflow-hidden rounded-2xl border border-hair bg-white">
                <img src={l.image} alt="" className="aspect-square w-full object-cover" />
                <div className="p-3">
                  <p className="line-clamp-1 text-[13px] font-medium">{l.title}</p>
                  <p className="mt-1 text-sm font-bold">{l.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
    </div>
  );
}
