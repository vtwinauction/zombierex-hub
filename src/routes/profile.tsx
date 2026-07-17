import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Settings, Share2, MapPin, Trophy, Wrench, Flame, Bolt, Route as RouteIcon, Medal, Grid3x3, Play } from "lucide-react";
import { me, myVehicles, rider, achievements, workshopHistory, reels } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Garage · ZOMBIEREX" }] }),
  component: ProfilePage,
});

const TABS = ["Reels", "Garage", "Trophies", "Workshop"] as const;
type Tab = (typeof TABS)[number];

const ACH_ICON = { trophy: Trophy, flame: Flame, bolt: Bolt, route: RouteIcon, wrench: Wrench, medal: Medal };

function ProfilePage() {
  const [tab, setTab] = useState<Tab>("Reels");
  const bike = myVehicles[0];
  const xpPct = Math.min(100, (rider.xp / rider.xpToNext) * 100);

  return (
    <div className="pb-28">
      {/* Cover / hero */}
      <div className="relative h-52 w-full overflow-hidden">
        <img src={bike.cover} alt="" className="ken-burns h-full w-full object-cover" />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 40%, var(--color-bone) 100%)",
        }} />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)]">
          <button className="tap grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur">
            <Share2 className="h-[18px] w-[18px]" />
          </button>
          <button className="tap grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur">
            <Settings className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      <div className="-mt-14 px-4">
        <div className="flex items-end gap-3">
          <div className="story-ring">
            <div className="rounded-full bg-bone p-[3px]">
              <img src={me.avatar} alt="" className="h-[92px] w-[92px] rounded-full object-cover" />
            </div>
          </div>
          <div className="mb-2 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{me.name}</h1>
              <span className="grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold text-ink" style={{ background: "var(--color-signal)" }}>✓</span>
            </div>
            <p className="text-[12px] text-ash">{me.handle} · <MapPin className="inline h-3 w-3" /> {me.location}</p>
          </div>
        </div>

        {/* Level card */}
        <div className="card-surface mt-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ash">Rider Level</p>
              <p className="text-lg font-semibold">Lv {rider.level} · {rider.title}</p>
            </div>
            <span className="mono-num text-[12px] font-semibold text-ash">
              {rider.xp.toLocaleString()} / {rider.xpToNext.toLocaleString()} XP
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist">
            <div className="h-full rounded-full" style={{ width: `${xpPct}%`, background: "linear-gradient(90deg, var(--color-signal), var(--color-signal-deep))" }} />
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Followers" value="12.4K" />
          <Stat label="Rides" value="47" />
          <Stat label="Miles" value="8,912" />
        </div>

        <div className="mt-4 flex gap-2">
          <button className="tap flex-1 rounded-full bg-ink py-2.5 text-[13px] font-semibold text-bone">Edit profile</button>
          <button className="tap flex-1 rounded-full border border-hair bg-white py-2.5 text-[13px] font-semibold">Share</button>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-1 border-b border-hair">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative flex-1 py-2.5 text-[12.5px] font-semibold transition ${tab === t ? "text-ink" : "text-ash"}`}
            >
              {t}
              {tab === t && <span className="absolute inset-x-4 -bottom-px h-[2px] rounded-full bg-ink" />}
            </button>
          ))}
        </div>

        {tab === "Reels" && (
          <div className="mt-4 grid grid-cols-3 gap-1.5">
            {reels.map((r) => (
              <div key={r.id} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-ink">
                <img src={r.poster} alt="" className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-white">
                  <Play className="h-3 w-3 fill-white" /> {r.views}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "Garage" && (
          <div className="mt-4 space-y-3">
            {myVehicles.map((v) => (
              <div key={v.id} className="overflow-hidden rounded-3xl border border-hair bg-white">
                <img src={v.cover} alt="" className="h-40 w-full object-cover" />
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold">{v.name}</p>
                    <span className="chip">{v.year}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <MiniStat k="HP" v={v.hp} />
                    <MiniStat k="Type" v={v.type} />
                    <MiniStat k="Mods" v={v.mods.length} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {v.mods.map((m) => (
                      <span key={m} className="chip"><Grid3x3 className="h-3 w-3 text-ash" />{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Trophies" && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {achievements.map((a) => {
              const Icon = ACH_ICON[a.icon];
              const tone = a.rarity === "legendary" ? "var(--color-signal)"
                : a.rarity === "rare" ? "var(--color-cool)"
                : "var(--color-mist)";
              return (
                <div key={a.id} className={`rounded-2xl border border-hair bg-white p-3 text-center ${a.earned ? "" : "opacity-45"}`}>
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl" style={{ background: tone }}>
                    <Icon className="h-6 w-6 text-ink" />
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-tight">{a.title}</p>
                  <p className="mt-0.5 text-[10px] text-ash">{a.detail}</p>
                </div>
              );
            })}
          </div>
        )}

        {tab === "Workshop" && (
          <ul className="mt-4 space-y-2">
            {workshopHistory.map((w) => (
              <li key={w.id} className="flex items-start gap-3 rounded-2xl border border-hair bg-white p-3">
                <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{
                  background: w.status === "upcoming" ? "color-mix(in oklab, var(--color-heat) 15%, white)" : "var(--color-mist)",
                }}>
                  <Wrench className="h-5 w-5 text-ink" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold">{w.title}</p>
                    <span className="text-[11px] font-semibold text-ash">{w.date}</span>
                  </div>
                  <p className="text-[11px] text-ash">{w.shop} · {w.mileage}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wide`} style={{ color: w.status === "upcoming" ? "var(--color-heat)" : "var(--color-signal-deep)" }}>
                      {w.status}
                    </span>
                    <span className="text-[12px] font-bold">{w.cost}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-surface p-3 text-center">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ash">{label}</p>
    </div>
  );
}

function MiniStat({ k, v }: { k: string; v: string | number }) {
  return (
    <div className="rounded-xl bg-mist p-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ash">{k}</p>
      <p className="text-sm font-semibold">{v}</p>
    </div>
  );
}
