import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StatusBar } from "@/components/StatusBar";
import { me, myVehicles, rider, achievements, workshopHistory, reels } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Garage · ZOMBIEREX" }, { name: "description", content: "The rider's digital garage — machine, level, trophies, workshop log." }] }),
  component: ProfilePage,
});

const TABS = ["REELS", "GARAGE", "TROPHIES", "WORKSHOP"] as const;
type Tab = typeof TABS[number];

function ProfilePage() {
  const [tab, setTab] = useState<Tab>("REELS");
  const bike = myVehicles[0];
  const xpPct = Math.min(100, (rider.xp / rider.xpToNext) * 100);

  return (
    <div>
      <StatusBar index="05" section="GARAGE · OPERATOR" />

      {/* =========== THE MACHINE — hero =========== */}
      <section className="relative">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <img src={bike.cover} alt="" className="ken-burns h-full w-full object-cover" />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 30%, rgba(5,5,5,0.9) 88%, var(--color-bone) 100%)",
          }} />

          {/* Corner marks */}
          <span className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l border-t border-white/70" />
          <span className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r border-t border-white/70" />

          {/* Right vertical serial */}
          <div className="absolute right-3 top-16 text-right text-white">
            <p className="mono-tag" style={{ color: "rgba(255,255,255,0.55)" }}>UNIT · V·{bike.id.toUpperCase()}</p>
            <p className="mono-tag mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>REG · {bike.year}·CA</p>
          </div>

          {/* Machine name — editorial */}
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="mono-tag" style={{ color: "rgba(255,255,255,0.7)" }}>THE MACHINE</p>
            <h1 className="mt-2 display-xl text-4xl uppercase leading-[0.85]">
              {bike.name.split(" ").map((w, i) => (
                <span key={i} className="block">{w}</span>
              ))}
            </h1>
          </div>
        </div>

        {/* Spec strip beneath hero */}
        <div className="grid grid-cols-4 divide-x divide-hair hairline-b" style={{ background: "var(--color-bone)" }}>
          <SpecCell k="YEAR" v={String(bike.year)} />
          <SpecCell k="HP" v={String(bike.hp)} />
          <SpecCell k="TYPE" v={bike.type === "Motorcycle" ? "MOTO" : "CAR"} />
          <SpecCell k="MODS" v={String(bike.mods.length)} highlight />
        </div>
      </section>

      {/* =========== THE RIDER — secondary =========== */}
      <section className="px-4 pt-6">
        <div className="flex items-start gap-4">
          <div className="hairline shrink-0 overflow-hidden" style={{ width: 72, height: 72 }}>
            <img src={me.avatar} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <p className="mono-tag" style={{ color: "var(--color-ash)" }}>OPERATOR · VERIFIED</p>
            <h2 className="mt-1 text-2xl display-xl uppercase leading-none">{me.name}</h2>
            <p className="mono-tag mt-2" style={{ color: "var(--color-ash)" }}>{me.handle} · ◎ {me.location}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button className="btn-solid">EDIT PROFILE</button>
          <button className="btn-ghost">SHARE UNIT</button>
        </div>

        {/* Level meter — technical */}
        <div className="mt-6 hairline p-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="mono-tag" style={{ color: "var(--color-ash)" }}>ENDURANCE LEVEL</p>
              <p className="mt-1 display-xl text-2xl uppercase">LV·{rider.level} — {rider.title}</p>
            </div>
            <p className="display-numeral text-3xl" style={{ color: "var(--color-signal)" }}>{Math.round(xpPct)}<span className="text-sm" style={{ color: "var(--color-ash)" }}>%</span></p>
          </div>
          {/* Segmented progress */}
          <div className="mt-3 flex h-2 gap-[2px]">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-1" style={{
                background: i < Math.round(xpPct / 5) ? "var(--color-signal)" : "var(--color-hair)",
              }} />
            ))}
          </div>
          <p className="mono-tag mt-2" style={{ color: "var(--color-ash)" }}>
            {rider.xp.toLocaleString()} / {rider.xpToNext.toLocaleString()} XP · {rider.xpToNext - rider.xp} TO NEXT
          </p>
        </div>

        {/* Stats grid */}
        <div className="mt-4 grid grid-cols-3 divide-x divide-hair border border-hair">
          <StatBlock k="FOLLOWERS" v="12.4K" />
          <StatBlock k="RIDES" v="47" />
          <StatBlock k="MILES" v="8,912" />
        </div>
      </section>

      {/* =========== TAB BAR =========== */}
      <div className="mt-8 hairline-t hairline-b flex">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="tap relative flex-1 py-3 mono-caps"
            style={{
              color: tab === t ? "var(--color-ink)" : "var(--color-ash)",
              background: tab === t ? "var(--color-mist)" : "transparent",
            }}
          >
            {t}
            {tab === t && (
              <span className="absolute inset-x-6 top-0 h-[2px]" style={{ background: "var(--color-signal)" }} />
            )}
          </button>
        ))}
      </div>

      <div className="px-4 pt-5">
        {tab === "REELS" && (
          <div className="grid grid-cols-3 gap-0.5">
            {reels.map((r, i) => (
              <div key={r.id} className="relative aspect-[3/4] overflow-hidden border border-hair">
                <img src={r.poster} alt="" className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                <span className="absolute left-1.5 top-1.5 mono-tag" style={{ color: "rgba(255,255,255,0.85)" }}>{String(i+1).padStart(2,"0")}</span>
                <span className="absolute bottom-1.5 left-1.5 mono-num text-[10px] font-bold text-white">▶ {r.views}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "GARAGE" && (
          <div className="space-y-4">
            {myVehicles.map((v) => (
              <div key={v.id} className="hairline overflow-hidden">
                <img src={v.cover} alt="" className="h-48 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="mono-tag" style={{ color: "var(--color-ash)" }}>{v.type.toUpperCase()} · {v.year}</p>
                      <p className="text-lg font-bold">{v.name}</p>
                    </div>
                    <p className="display-numeral text-2xl" style={{ color: "var(--color-signal)" }}>{v.hp}<span className="mono-tag ml-1" style={{ color: "var(--color-ash)" }}>HP</span></p>
                  </div>
                  <ul className="mt-4 divide-y divide-hair hairline-t hairline-b">
                    {v.mods.map((m, i) => (
                      <li key={m} className="flex items-center gap-3 py-2">
                        <span className="mono-tag" style={{ color: "var(--color-ash)" }}>MOD·{String(i+1).padStart(2,"0")}</span>
                        <span className="text-[13px] font-medium">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "TROPHIES" && (
          <div className="grid grid-cols-2 gap-2">
            {achievements.map((a, i) => (
              <div
                key={a.id}
                className="hairline p-3"
                style={{ opacity: a.earned ? 1 : 0.35 }}
              >
                <div className="flex items-baseline justify-between">
                  <span className="mono-tag" style={{ color: "var(--color-ash)" }}>T·{String(i+1).padStart(2,"0")}</span>
                  <span className="mono-tag" style={{
                    color: a.rarity === "legendary" ? "var(--color-signal)" : a.rarity === "rare" ? "var(--color-cool)" : "var(--color-ash)",
                  }}>{a.rarity.toUpperCase()}</span>
                </div>
                <p className="mt-3 text-[13px] font-bold leading-tight">{a.title}</p>
                <p className="mono-tag mt-1" style={{ color: "var(--color-ash)" }}>{a.detail}</p>
                <div className="mt-3 h-[2px]" style={{ background: a.earned ? "var(--color-signal)" : "var(--color-hair)" }} />
              </div>
            ))}
          </div>
        )}

        {tab === "WORKSHOP" && (
          <ul className="divide-y divide-hair hairline-t hairline-b">
            {workshopHistory.map((w, i) => (
              <li key={w.id} className="grid grid-cols-[52px_1fr_auto] items-start gap-3 py-4">
                <div>
                  <span className="display-numeral text-lg">{String(i+1).padStart(2,"0")}</span>
                  <p className="mono-tag" style={{ color: "var(--color-ash)" }}>{w.date}</p>
                </div>
                <div>
                  <p className="text-[13px] font-bold leading-tight">{w.title}</p>
                  <p className="mono-tag mt-1" style={{ color: "var(--color-ash)" }}>{w.shop} · {w.mileage}</p>
                </div>
                <div className="text-right">
                  <p className="mono-num text-sm font-bold">{w.cost}</p>
                  <p className="mono-tag mt-0.5" style={{
                    color: w.status === "upcoming" ? "var(--color-heat)" : "var(--color-signal)",
                  }}>{w.status.toUpperCase()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SpecCell({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="p-3">
      <p className="mono-tag" style={{ color: "var(--color-ash)" }}>{k}</p>
      <p className="display-numeral mt-1 text-xl" style={{ color: highlight ? "var(--color-signal)" : "var(--color-ink)" }}>{v}</p>
    </div>
  );
}

function StatBlock({ k, v }: { k: string; v: string }) {
  return (
    <div className="p-4 text-center">
      <p className="display-numeral text-2xl">{v}</p>
      <p className="mono-tag mt-1" style={{ color: "var(--color-ash)" }}>{k}</p>
    </div>
  );
}
