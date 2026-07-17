import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StatusBar } from "@/components/StatusBar";
import { me, myVehicles, rider, achievements, workshopHistory, reels } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Digital Garage · ZOMBIEREX" }, { name: "description", content: "The rider's digital garage — machine, level, trophies, workshop log." }] }),
  component: ProfilePage,
});

const TABS = ["Reels", "Garage", "Trophies", "Workshop"] as const;
type Tab = typeof TABS[number];

function ProfilePage() {
  const [tab, setTab] = useState<Tab>("Reels");
  const bike = myVehicles[0];
  const xpPct = Math.min(100, (rider.xp / rider.xpToNext) * 100);

  return (
    <div className="pb-16">
      <StatusBar index="05" section="GARAGE · OPERATOR" />

      {/* ============ MACHINE — editorial hero ============ */}
      <section className="rise relative pt-4">
        <div className="px-4">
          <div className="flex items-baseline gap-3">
            <span className="mono-tag">Unit V·{bike.id.toUpperCase()}</span>
            <span className="etch flex-1" />
            <span className="mono-tag" style={{ color: "var(--color-silver)" }}>{bike.year} · {bike.type}</span>
          </div>
          <p className="mono-tag mt-4" style={{ color: "var(--color-silver)" }}>The machine</p>
          <h1 className="serif mt-1 text-[56px] leading-[0.85]" style={{ color: "var(--color-ink)" }}>
            {bike.name.split(" ").map((w, i) => (
              <span key={i} className={i === 1 ? "italic block" : "block"} style={i === 1 ? { color: "var(--color-neon)" } : undefined}>{w}</span>
            ))}
          </h1>
        </div>

        <div className="relative mt-5">
          <div className="relative aspect-[4/5] w-full overflow-hidden" style={{ borderTop: "1px solid var(--color-hair)", borderBottom: "1px solid var(--color-hair)" }}>
            <img src={bike.cover} alt="" className="ken-burns h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.75) 100%)" }} />
            <span className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-white/70" />
            <span className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-white/70" />
            <span className="pointer-events-none absolute left-2 bottom-2 h-3 w-3 border-l border-b border-white/70" />
            <span className="pointer-events-none absolute right-2 bottom-2 h-3 w-3 border-r border-b border-white/70" />
          </div>
        </div>

        {/* Floating specs card */}
        <div className="relative -mt-8 px-4">
          <div className="surface-brushed lift-2 grid grid-cols-4 divide-x" style={{ borderColor: "var(--color-hair-strong)", borderRadius: 3 }}>
            <SpecCell k="Year" v={String(bike.year)} />
            <SpecCell k="Power" v={String(bike.hp)} u="hp" />
            <SpecCell k="Type" v={bike.type === "Motorcycle" ? "Moto" : "Car"} />
            <SpecCell k="Mods" v={String(bike.mods.length)} highlight />
          </div>
        </div>
      </section>

      {/* ============ OPERATOR ============ */}
      <section className="mt-8 px-4">
        <div className="flex items-start gap-4">
          <div className="hex-frame shrink-0 overflow-hidden" style={{ width: 72, height: 72 }}>
            <img src={me.avatar} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <p className="mono-tag">Operator · Verified</p>
            <h2 className="serif mt-1 text-3xl italic leading-none" style={{ color: "var(--color-ink)" }}>{me.name}</h2>
            <p className="mono-tag mt-2" style={{ color: "var(--color-silver)" }}>{me.handle} · ◎ {me.location}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button className="btn-neon">Edit profile</button>
          <button className="btn-ghost">Share unit</button>
        </div>

        {/* Level meter */}
        <div className="surface-1 mt-6 p-4" style={{ borderRadius: 3 }}>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="mono-tag">Endurance level</p>
              <p className="serif mt-1 text-2xl italic" style={{ color: "var(--color-ink)" }}>Lv·{rider.level} — {rider.title}</p>
            </div>
            <p className="serif text-4xl italic" style={{ color: "var(--color-neon)", lineHeight: 0.9 }}>
              {Math.round(xpPct)}<span className="mono ml-0.5 text-[10px]" style={{ color: "var(--color-silver)" }}>%</span>
            </p>
          </div>
          <div className="mt-4 flex h-2 gap-[2px]">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-1" style={{
                background: i < Math.round(xpPct / 5) ? "var(--color-neon)" : "var(--color-hair-strong)",
                boxShadow: i < Math.round(xpPct / 5) ? "0 0 6px rgba(198,255,61,0.5)" : undefined,
              }} />
            ))}
          </div>
          <p className="mono-tag mt-3" style={{ color: "var(--color-silver)" }}>
            {rider.xp.toLocaleString()} / {rider.xpToNext.toLocaleString()} XP · {rider.xpToNext - rider.xp} to next
          </p>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 divide-x divide-hair surface-1" style={{ borderRadius: 3 }}>
          <StatBlock k="Followers" v="12.4K" />
          <StatBlock k="Rides" v="47" />
          <StatBlock k="Miles" v="8,912" />
        </div>
      </section>

      {/* ============ TABS ============ */}
      <div className="mt-8 hairline-t hairline-b flex">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="tap relative flex-1 py-3.5"
            style={{
              color: tab === t ? "var(--color-neon)" : "var(--color-silver)",
              background: tab === t ? "rgba(198,255,61,0.06)" : "transparent",
            }}
          >
            <span className="serif italic text-[15px]">{t}</span>
            {tab === t && (
              <span className="absolute inset-x-6 top-0 h-[2px]" style={{ background: "var(--color-neon)" }} />
            )}
          </button>
        ))}
      </div>

      <div className="px-4 pt-5">
        {tab === "Reels" && (
          <div className="grid grid-cols-3 gap-1">
            {reels.map((r, i) => (
              <div key={r.id} className="relative aspect-[3/4] overflow-hidden" style={{ border: "1px solid var(--color-hair)" }}>
                <img src={r.poster} alt="" className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                <span className="mono-tag absolute left-1.5 top-1.5" style={{ color: "rgba(255,255,255,0.85)" }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="mono-num absolute bottom-1.5 left-1.5 text-[10px] font-bold text-white">▶ {r.views}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "Garage" && (
          <div className="space-y-4">
            {myVehicles.map((v) => (
              <div key={v.id} className="surface-1 lift-1 overflow-hidden" style={{ borderRadius: 3 }}>
                <img src={v.cover} alt="" className="h-48 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="mono-tag">{v.type} · {v.year}</p>
                      <p className="serif text-xl italic" style={{ color: "var(--color-ink)" }}>{v.name}</p>
                    </div>
                    <p className="serif text-2xl italic" style={{ color: "var(--color-neon)" }}>{v.hp}<span className="mono ml-1 text-[10px]" style={{ color: "var(--color-silver)" }}>hp</span></p>
                  </div>
                  <ul className="mt-4 divide-y divide-hair hairline-t hairline-b">
                    {v.mods.map((m, i) => (
                      <li key={m} className="flex items-center gap-3 py-2">
                        <span className="mono-tag">Mod·{String(i + 1).padStart(2, "0")}</span>
                        <span className="serif text-[15px] italic" style={{ color: "var(--color-ink)" }}>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Trophies" && (
          <div className="grid grid-cols-2 gap-2">
            {achievements.map((a, i) => (
              <div key={a.id} className="surface-1 p-3" style={{ opacity: a.earned ? 1 : 0.4, borderRadius: 3 }}>
                <div className="flex items-baseline justify-between">
                  <span className="mono-tag">T·{String(i + 1).padStart(2, "0")}</span>
                  <span className="mono-tag" style={{
                    color: a.rarity === "legendary" ? "var(--color-neon)" : a.rarity === "rare" ? "var(--color-silver)" : "var(--color-titanium)",
                  }}>{a.rarity}</span>
                </div>
                <p className="serif mt-3 text-[15px] italic leading-tight" style={{ color: "var(--color-ink)" }}>{a.title}</p>
                <p className="mono-tag mt-1" style={{ color: "var(--color-silver)" }}>{a.detail}</p>
                <div className="mt-3 h-[2px]" style={{ background: a.earned ? "var(--color-neon)" : "var(--color-hair-strong)" }} />
              </div>
            ))}
          </div>
        )}

        {tab === "Workshop" && (
          <ul className="divide-y divide-hair hairline-t hairline-b">
            {workshopHistory.map((w, i) => (
              <li key={w.id} className="grid grid-cols-[52px_1fr_auto] items-start gap-3 py-4">
                <div>
                  <span className="serif text-2xl italic" style={{ color: "var(--color-titanium)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <p className="mono-tag" style={{ color: "var(--color-silver)" }}>{w.date}</p>
                </div>
                <div>
                  <p className="serif text-[15px] italic" style={{ color: "var(--color-ink)" }}>{w.title}</p>
                  <p className="mono-tag mt-1" style={{ color: "var(--color-silver)" }}>{w.shop} · {w.mileage}</p>
                </div>
                <div className="text-right">
                  <p className="mono-num text-sm font-semibold" style={{ color: "var(--color-ink)" }}>{w.cost}</p>
                  <p className="mono-tag mt-0.5" style={{
                    color: w.status === "upcoming" ? "var(--color-ember)" : "var(--color-neon)",
                  }}>{w.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SpecCell({ k, v, u, highlight }: { k: string; v: string; u?: string; highlight?: boolean }) {
  return (
    <div className="px-3 py-3">
      <p className="mono-tag" style={{ color: "var(--color-silver)", fontSize: 8.5 }}>{k}</p>
      <p className="serif mt-1 text-xl italic" style={{ color: highlight ? "var(--color-neon)" : "var(--color-ink)", lineHeight: 0.9 }}>
        {v}
        {u && <span className="mono ml-1 text-[10px]" style={{ color: "var(--color-silver)" }}>{u}</span>}
      </p>
    </div>
  );
}

function StatBlock({ k, v }: { k: string; v: string }) {
  return (
    <div className="p-4 text-center">
      <p className="serif text-2xl italic" style={{ color: "var(--color-ink)" }}>{v}</p>
      <p className="mono-tag mt-1" style={{ color: "var(--color-silver)" }}>{k}</p>
    </div>
  );
}
