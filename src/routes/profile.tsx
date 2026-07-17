import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StatusHUD } from "@/components/StatusHUD";
import { Panel, SlashHeader, HexChip, GaugeRing, DataChip, AngularButton, TickBar } from "@/components/hud";
import { me, myVehicles, achievements, workshopHistory, rider, posts } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "DOSSIER · ZOMBIEREX" }] }),
  component: DossierPage,
});

const TABS = ["OVERVIEW", "GARAGE", "TROPHIES", "WORKSHOP", "POSTS"] as const;
type Tab = typeof TABS[number];

function DossierPage() {
  const [tab, setTab] = useState<Tab>("OVERVIEW");
  const bike = myVehicles[0];

  return (
    <div className="pb-10">
      <StatusHUD title="DOSSIER" code="07" />

      <div className="px-3 pt-4">
        {/* IDENTITY CARD */}
        <Panel variant="ink" className="grid grid-cols-[80px_1fr] overflow-hidden">
          <div className="flex items-center justify-center border-r border-signal/30 py-4">
            <HexChip src={me.avatar} size={64} live />
          </div>
          <div className="p-3">
            <p className="mono-caps text-signal">// RIDER · LVL {rider.level}</p>
            <p className="font-display mt-1 text-xl uppercase leading-none">{me.name}</p>
            <p className="mono-caps text-bone/60 mt-1">{me.handle} · {me.location}</p>
            <div className="mt-3">
              <div className="mono-caps text-bone/60 mb-1 flex justify-between">
                <span>{rider.title}</span>
                <span className="mono-num">{rider.xp}/{rider.xpToNext}</span>
              </div>
              <TickBar value={rider.xp} max={rider.xpToNext} />
            </div>
          </div>
        </Panel>

        {/* TAB RAIL */}
        <div className="scrollbar-none mt-4 flex gap-1 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <AngularButton key={t} size="sm" variant={tab === t ? "solid" : "ghost"} onClick={() => setTab(t)}>
              {t}
            </AngularButton>
          ))}
        </div>

        <div className="mt-4">
          {tab === "OVERVIEW" && (
            <div className="space-y-4">
              <SlashHeader label="TELEMETRY" />
              <Panel className="flex items-center justify-around p-3">
                <GaugeRing value={1245} max={2000} label="MILES · MO" unit="MI" />
                <GaugeRing value={47} max={60} label="RIDES · YR" unit="RUN" />
                <GaugeRing value={rider.level} max={30} label="LEVEL" unit="LVL" />
              </Panel>

              <SlashHeader label="STATUS" />
              <div className="grid grid-cols-2 gap-2">
                <MiniStat label="TROPHIES" value={`${achievements.filter(a => a.earned).length}/${achievements.length}`} />
                <MiniStat label="WRENCHES" value={workshopHistory.filter(w => w.status === "done").length} />
                <MiniStat label="CREWS" value="4" />
                <MiniStat label="RANK" value={`#${rider.level}`} tone />
              </div>
            </div>
          )}

          {tab === "GARAGE" && (
            <div className="space-y-3">
              <SlashHeader label="UNITS" count={myVehicles.length} />
              {myVehicles.map((v) => (
                <Panel key={v.id} className="overflow-hidden">
                  <div className="relative">
                    <img src={v.cover} alt="" className="h-40 w-full object-cover" />
                    <div className="panel-ink absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-2">
                      <span className="font-display text-sm uppercase">{v.name}</span>
                      <span className="mono-num text-signal">{v.hp}HP</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex flex-wrap gap-1">
                      <DataChip k="TYPE" v={v.type} />
                      <DataChip k="YEAR" v={v.year} />
                      <DataChip k="MODS" v={v.mods.length} tone="signal" />
                    </div>
                    <ul className="mt-3 space-y-1">
                      {v.mods.map((m) => (
                        <li key={m} className="mono-caps flex items-center gap-2 text-[10px]">
                          <span className="text-signal">▸</span>
                          <span className="text-ink">{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Panel>
              ))}
            </div>
          )}

          {tab === "TROPHIES" && (
            <div className="space-y-3">
              <SlashHeader label="TROPHIES" count={`${achievements.filter(a => a.earned).length}`} />
              <div className="grid grid-cols-3 gap-2">
                {achievements.map((a) => {
                  const rarity =
                    a.rarity === "legendary" ? "bg-warn text-bone" :
                    a.rarity === "rare" ? "bg-signal text-ink" : "bg-mist text-ink";
                  return (
                    <div key={a.id} className="flex flex-col items-center">
                      <div
                        className={`clip-hex flex h-16 w-14 items-center justify-center border border-ink ${
                          a.earned ? rarity : "bg-mist/50 text-ash grayscale"
                        }`}
                      >
                        <span className="font-display text-xl">
                          {a.icon === "trophy" ? "♆" : a.icon === "flame" ? "⌬" : a.icon === "bolt" ? "⚡" : a.icon === "route" ? "◈" : a.icon === "wrench" ? "⚙" : "✦"}
                        </span>
                      </div>
                      <p className={`font-display mt-1 text-center text-[10px] uppercase leading-tight ${a.earned ? "text-ink" : "text-ash"}`}>
                        {a.title}
                      </p>
                      <p className="mono-caps text-ash text-[8px]">{a.rarity}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "WORKSHOP" && (
            <div className="space-y-3">
              <SlashHeader label="SERVICE LOG" count={workshopHistory.length} />
              <div className="space-y-2">
                {workshopHistory.map((w) => (
                  <Panel key={w.id} className="grid grid-cols-[56px_1fr] overflow-hidden">
                    <div className={`flex flex-col items-center justify-center py-2 ${w.status === "upcoming" ? "bg-warn text-bone" : "bg-ink text-bone"}`}>
                      <span className="mono-caps text-[9px] opacity-80">{w.date.split(" ")[0]}</span>
                      <span className="font-display text-lg leading-none">{w.date.split(" ")[1]}</span>
                    </div>
                    <div className="p-2">
                      <p className="font-display text-xs uppercase leading-tight">{w.title}</p>
                      <p className="mono-caps text-ash mt-0.5">{w.shop}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <DataChip k="MI" v={w.mileage.replace(" mi", "")} />
                        <DataChip k="COST" v={w.cost} tone={w.status === "upcoming" ? "warn" : "default"} />
                        <DataChip k="STAT" v={w.status.toUpperCase()} tone={w.status === "done" ? "signal" : "warn"} />
                      </div>
                    </div>
                  </Panel>
                ))}
              </div>
            </div>
          )}

          {tab === "POSTS" && (
            <div className="grid grid-cols-3 gap-1">
              {[...posts, ...posts].map((p, i) => (
                <div key={i} className="relative aspect-square border border-ink">
                  <img src={p.image} alt="" className="h-full w-full object-cover" />
                  <span className="mono-num absolute bottom-0.5 right-0.5 bg-ink/80 px-1 text-[9px] text-bone">
                    ✚{p.likes > 999 ? `${(p.likes/1000).toFixed(1)}k` : p.likes}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-2">
          <AngularButton variant="signal" size="sm">◇ EDIT DOSSIER</AngularButton>
          <AngularButton size="sm">⚙ SETTINGS</AngularButton>
        </div>

        {/* Reference so bike var isn't unused when tab != GARAGE */}
        <p className="sr-only">{bike.name}</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string | number; tone?: boolean }) {
  return (
    <Panel variant={tone ? "signal" : "bone"} className="p-2">
      <p className="mono-caps opacity-70">{label}</p>
      <p className="font-display mono-num mt-1 text-xl leading-none">{value}</p>
    </Panel>
  );
}
