import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StatusHUD } from "@/components/StatusHUD";
import { Panel, SlashHeader, HexChip, AngularButton, DataChip } from "@/components/hud";
import { users, clubs, listings, posts } from "@/lib/mock-data";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "SCAN · ZOMBIEREX" }] }),
  component: ScanPage,
});

const CHIPS = ["RIDERS", "CREWS", "BUILDS", "PARTS", "EVENTS", "TAGS"] as const;

function ScanPage() {
  const [q, setQ] = useState("");
  return (
    <div className="pb-10">
      <StatusHUD title="SCAN" code="03" />

      <div className="space-y-5 px-3 pt-4">
        {/* Terminal-style scanner input */}
        <Panel variant="ink" className="flex items-center gap-2 p-2">
          <span className="mono-caps text-signal">◎ SCAN&gt;</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="rider, build, part…"
            className="mono-num flex-1 bg-transparent text-sm text-bone placeholder:text-bone/40 focus:outline-none"
          />
          <span className="signal-pulse block h-2 w-2 bg-signal" />
        </Panel>

        <div className="scrollbar-none flex gap-1 overflow-x-auto">
          {CHIPS.map((c, i) => (
            <AngularButton key={c} size="sm" variant={i === 0 ? "solid" : "ghost"} active={i === 0}>
              {c}
            </AngularButton>
          ))}
        </div>

        {/* TRENDING TAGS */}
        <section>
          <SlashHeader label="TRENDING SIGNALS" />
          <div className="mt-3 flex flex-wrap gap-1">
            {["#nightride", "#widebody", "#nakedbike", "#wrenchlife", "#turbolife", "#trackday", "#carbs", "#jdm"].map((t, i) => (
              <span key={t} className="clip-chamfer-sm border border-ink bg-mist px-2 py-1">
                <span className="mono-caps text-ash mr-1">#{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-xs uppercase">{t.slice(1)}</span>
              </span>
            ))}
          </div>
        </section>

        {/* RIDERS */}
        <section>
          <SlashHeader label="RIDERS" count={users.length} />
          <div className="mt-3 space-y-2">
            {users.map((u) => (
              <Panel key={u.id} className="flex items-center gap-3 p-2">
                <HexChip src={u.avatar} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm uppercase leading-none">{u.name}</p>
                  <p className="mono-caps text-ash mt-1 truncate">{u.handle} · {u.location}</p>
                </div>
                <AngularButton size="sm" variant="signal">+ TRACK</AngularButton>
              </Panel>
            ))}
          </div>
        </section>

        {/* CREWS */}
        <section>
          <SlashHeader label="CREWS" count={clubs.length} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {clubs.map((c) => (
              <Panel key={c.id} className="overflow-hidden">
                <img src={c.cover} alt="" className="h-20 w-full object-cover" />
                <div className="p-2">
                  <p className="font-display text-xs uppercase leading-tight">{c.name}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <DataChip k="TAG" v={c.tag} />
                    <DataChip k="MBR" v={c.members} tone="signal" />
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </section>

        {/* BUILDS / POSTS thumbnails */}
        <section>
          <SlashHeader label="BUILDS" count={posts.length} />
          <div className="mt-3 grid grid-cols-3 gap-1">
            {posts.map((p) => (
              <div key={p.id} className="relative aspect-square border border-ink">
                <img src={p.image} alt="" className="h-full w-full object-cover" />
                {p.vehicle && (
                  <span className="mono-num absolute bottom-0 left-0 bg-signal px-1 text-[9px] font-bold text-ink">
                    {p.vehicle.hp}HP
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* PARTS quick */}
        <section>
          <SlashHeader label="PARTS DROP" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {listings.slice(0, 2).map((l) => (
              <Panel key={l.id} className="overflow-hidden">
                <img src={l.image} alt="" className="aspect-video w-full object-cover" />
                <div className="p-2">
                  <p className="font-display line-clamp-1 text-[11px] uppercase">{l.title}</p>
                  <p className="mono-num mt-1 text-sm font-bold">{l.price}</p>
                </div>
              </Panel>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
