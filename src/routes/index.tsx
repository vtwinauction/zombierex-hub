import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusHUD } from "@/components/StatusHUD";
import { TelemetryPost } from "@/components/TelemetryPost";
import { Panel, SlashHeader, DataChip, HexChip, TickBar } from "@/components/hud";
import { posts, events, myVehicles, rider, clubs } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "COMMAND DECK · ZOMBIEREX" },
      { name: "description", content: "Live telemetry, missions and community stream." },
    ],
  }),
  component: DeckPage,
});

function DeckPage() {
  const primary = myVehicles[0];
  const nextEvent = events[0];

  return (
    <div className="pb-10">
      <StatusHUD title="COMMAND" code="01" />

      {/* Marquee ticker */}
      <div className="overflow-hidden border-b border-ink bg-ink text-bone">
        <div className="marquee mono-caps flex whitespace-nowrap py-1 text-[10px]">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex shrink-0">
              {[
                "◇ CANYON DEVILS · SAT 20:00",
                "▲ 3 NEW ARSENAL DROPS",
                "◈ 12 SIGNALS PENDING",
                "⌘ WIDEBODY MEET · BERLIN",
                "⬢ WORKSHOP DUE · 20K MI",
              ].map((t) => (
                <span key={t} className="px-6 text-signal">{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-5 px-3 pt-4">
        {/* PRIMARY UNIT */}
        <section>
          <SlashHeader label="PRIMARY UNIT" right={
            <Link to="/profile" className="mono-caps text-ash tap">GARAGE →</Link>
          } />
          <Panel className="mt-3 grid grid-cols-[1fr_112px] overflow-hidden">
            <div className="relative">
              <img src={primary.cover} alt="" className="h-40 w-full object-cover" />
              <div className="scanline absolute inset-0" />
              <div className="absolute left-2 top-2 flex flex-col gap-1">
                <span className="clip-tag mono-caps bg-signal px-2 py-0.5 text-[9px] font-bold text-ink">
                  ACTIVE
                </span>
                <span className="mono-caps bg-ink/80 px-2 py-0.5 text-[9px] text-bone">{primary.type.toUpperCase()}</span>
              </div>
              <div className="panel-ink absolute inset-x-0 bottom-0 flex items-center justify-between px-2 py-1.5">
                <span className="font-display text-xs uppercase">{primary.name}</span>
                <span className="mono-num text-signal text-[10px]">{primary.year}</span>
              </div>
            </div>
            <div className="flex flex-col items-stretch justify-between border-l border-ink bg-mist p-2">
              <Stat k="HP" v={primary.hp} />
              <Stat k="MI" v="17,840" />
              <Stat k="MODS" v={primary.mods.length} accent />
            </div>
          </Panel>
        </section>

        {/* TELEMETRY GRID */}
        <section className="grid grid-cols-3 gap-2">
          <MetricTile label="RIDES" value="47" hint="+3 WK" />
          <MetricTile label="MILES" value="1.2k" hint="THIS MO" />
          <MetricTile label="RANK" value={`#${rider.level}`} hint={rider.title} tone="signal" />
        </section>

        {/* NEXT MISSION */}
        <section>
          <SlashHeader label="NEXT MISSION" right={
            <Link to="/events" className="mono-caps text-ash tap">ALL →</Link>
          } />
          <Panel variant="ink" className="mt-3 grid grid-cols-[70px_1fr] overflow-hidden">
            <div className="flex flex-col items-center justify-center border-r border-signal/40 py-3">
              <span className="mono-caps text-signal">{nextEvent.date.split(" · ")[0]}</span>
              <span className="font-display text-signal text-3xl leading-none">{nextEvent.date.split(" · ")[1].split(" ")[1]}</span>
              <span className="mono-caps text-bone/60 mt-1">{nextEvent.time}</span>
            </div>
            <div className="flex flex-col justify-between p-3">
              <div>
                <p className="font-display text-base uppercase leading-tight">{nextEvent.title}</p>
                <p className="mono-caps text-bone/60 mt-1">{nextEvent.location}</p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <DataChip k="DIST" v={nextEvent.distance.replace(" away", "")} tone="signal" />
                <DataChip k="RIDR" v={nextEvent.attending} />
              </div>
            </div>
          </Panel>
        </section>

        {/* CLUBS */}
        <section>
          <SlashHeader label="CREWS" count={clubs.length} />
          <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto">
            {clubs.map((c) => (
              <div key={c.id} className="panel clip-chamfer-sm w-40 shrink-0">
                <img src={c.cover} alt="" className="h-16 w-full object-cover" />
                <div className="p-2">
                  <p className="font-display text-xs uppercase leading-tight">{c.name}</p>
                  <div className="mono-caps text-ash mt-1 flex items-center justify-between">
                    <span>{c.tag}</span>
                    <span className="mono-num">{c.members}</span>
                  </div>
                  <TickBar value={Math.min(c.members, 3500)} max={3500} className="mt-1.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SIGNAL STREAM (feed) */}
        <section>
          <SlashHeader label="SIGNAL STREAM" count={posts.length} right={
            <span className="mono-caps text-ash">LIVE</span>
          } />
          <div className="mt-3 space-y-4">
            {posts.map((p, i) => (
              <TelemetryPost key={p.id} post={p} index={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ k, v, accent }: { k: string; v: string | number; accent?: boolean }) {
  return (
    <div className={`border-b border-ink/20 py-1 last:border-b-0 ${accent ? "text-warn" : ""}`}>
      <p className="mono-caps text-ash">{k}</p>
      <p className="mono-num text-lg font-bold leading-tight">{v}</p>
    </div>
  );
}

function MetricTile({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: "signal" }) {
  return (
    <Panel variant={tone === "signal" ? "signal" : "bone"} className="p-2">
      <p className="mono-caps opacity-70">{label}</p>
      <p className="font-display mt-1 text-2xl leading-none">{value}</p>
      <p className="mono-caps mt-1 opacity-60">{hint}</p>
    </Panel>
  );
}
