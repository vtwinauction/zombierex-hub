import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { me, myVehicles, posts, clubs, achievements, workshopHistory, rider } from "@/lib/mock-data";
import { Settings, MapPin, Gauge, Wrench, Plus, Users2, Trophy, Route as RouteIcon, Zap, ArrowUpRight, Flame, Medal, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Garage — ZOMBIEREX" },
      { name: "description", content: "Your digital garage: vehicles, achievements, ride stats, workshop history." },
    ],
  }),
  component: ProfilePage,
});

const tabs = ["Garage", "Rides", "Trophies", "Workshop", "Gallery", "Clubs"] as const;
type Tab = (typeof tabs)[number];

function ProfilePage() {
  const [tab, setTab] = useState<Tab>("Garage");
  const myPosts = posts.slice(0, 2);

  return (
    <>
      <TopBar title="Garage" />

      {/* Cockpit header */}
      <section className="px-5">
        <div className="rex-rise overflow-hidden rounded-[28px] border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative">
                <img src={me.avatar} alt={me.name} className="h-16 w-16 rounded-2xl object-cover" />
                <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full ring-2 ring-card" style={{ background: "var(--color-primary)" }}>
                  <Zap className="h-3 w-3" style={{ color: "var(--color-primary-foreground)" }} strokeWidth={3} />
                </span>
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-[22px] leading-none tracking-tight">Marcus V.</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">{me.handle}</p>
                <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {me.location}
                </p>
              </div>
            </div>
            <button aria-label="Settings" className="tap-press grid h-10 w-10 place-items-center rounded-full border border-border">
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {/* Level bar */}
          <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg font-display text-[11px]" style={{ background: "var(--color-foreground)", color: "var(--color-background)" }}>
                  L{rider.level}
                </span>
                <div>
                  <p className="font-display text-[13px] leading-none">{rider.title}</p>
                  <p className="mt-1 text-mono-caps text-muted-foreground">{rider.xp.toLocaleString()} / {rider.xpToNext.toLocaleString()} xp</p>
                </div>
              </div>
              <span className="text-mono-caps" style={{ color: "var(--color-primary)" }}>Next: L{rider.level + 1}</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full" style={{ width: `${(rider.xp / rider.xpToNext) * 100}%`, background: "var(--gradient-toxic)" }} />
            </div>
          </div>

          {/* Cockpit stats */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            <Cockpit label="Rides" value="37" />
            <Cockpit label="Miles" value="18k" />
            <Cockpit label="Bikes" value="1" />
            <Cockpit label="Trophies" value="12" accent />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button className="tap-press flex-1 rounded-full py-2.5 font-display text-[13px]" style={{ background: "var(--color-foreground)", color: "var(--color-background)" }}>
              Edit profile
            </button>
            <button className="tap-press rounded-full border border-border px-5 py-2.5 font-display text-[13px]">Share</button>
          </div>
        </div>
      </section>


      {/* Tabs — horizontally scrollable pill row */}
      <div className="mt-4">
        <div className="scrollbar-none flex gap-2 overflow-x-auto px-5 pb-1">
          {tabs.map((t) => {
            const on = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="tap-press shrink-0 rounded-full border px-4 py-2 font-display text-[12px] transition-colors"
                style={on
                  ? { background: "var(--color-foreground)", color: "var(--color-background)", borderColor: "var(--color-foreground)" }
                  : { color: "var(--color-muted-foreground)", borderColor: "var(--color-border)", background: "var(--color-card)" }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>


      {/* Tab content */}
      {tab === "Garage" ? (
        <section className="flex flex-col gap-3 p-5">
          {myVehicles.map((v) => (
            <article key={v.id} className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-soft)]">
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img src={v.cover} alt={v.name} loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-mono-caps backdrop-blur">Primary</span>
              </div>
              <div className="p-4">
                <p className="text-mono-caps text-muted-foreground">{v.year} · {v.type}</p>
                <h3 className="mt-1 font-display text-[22px] leading-tight tracking-tight">{v.name}</h3>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-muted/60 p-3 text-center">
                  <SpecPod label="Power" value={`${v.hp}`} unit="hp" />
                  <SpecPod label="Mods" value={`${v.mods.length}`} unit="fitted" />
                  <SpecPod label="Health" value="98" unit="%" />
                </div>

                <div className="mt-3">
                  <p className="text-mono-caps text-muted-foreground">Mods installed</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {v.mods.map((m) => (
                      <span key={m} className="rounded-full border border-border px-3 py-1 text-[12px]">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}

          <button className="flex items-center justify-center gap-2 rounded-[24px] border border-dashed border-border py-8 font-display text-[13px] text-muted-foreground transition-colors hover:text-foreground">
            <Plus className="h-4 w-4" />
            Add vehicle
          </button>
        </section>
      ) : null}

      {tab === "Rides" ? (
        <section className="p-5">
          <div className="overflow-hidden rounded-[24px] border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-mono-caps text-muted-foreground">Last 30 days</span>
              <span className="inline-flex items-center gap-1 text-mono-caps" style={{ color: "var(--color-primary)" }}>
                <RouteIcon className="h-3.5 w-3.5" /> +18%
              </span>
            </div>
            <p className="mt-3 font-display text-[44px] leading-none tracking-tight">1,284<span className="ml-1 text-[16px] text-muted-foreground">mi</span></p>

            <div className="mt-5 flex h-24 items-end gap-1.5">
              {[0.3, 0.5, 0.4, 0.8, 0.6, 0.9, 0.7, 0.5, 1, 0.8, 0.6, 0.9].map((v, i) => (
                <span key={i} className="flex-1 rounded-t-md" style={{ height: `${v * 100}%`, background: i === 8 ? "var(--color-primary)" : "var(--color-foreground)" }} />
              ))}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <StatCard icon={<Trophy className="h-4 w-4" />} label="Achievements" value="12" />
            <StatCard icon={<Gauge className="h-4 w-4" />} label="Top speed" value="147 mph" />
            <StatCard icon={<RouteIcon className="h-4 w-4" />} label="Longest ride" value="284 mi" />
            <StatCard icon={<Wrench className="h-4 w-4" />} label="Service due" value="2,300 mi" />
          </div>
        </section>
      ) : null}

      {tab === "Gallery" ? (
        <div className="grid grid-cols-3 gap-1 p-1">
          {[...myPosts, ...myPosts, ...myPosts].map((p, i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-md bg-muted">
              <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      ) : null}

      {tab === "Clubs" ? (
        <div className="flex flex-col gap-3 p-5">
          {clubs.map((c) => (
            <article key={c.id} className="flex items-center gap-3 rounded-[20px] border border-border bg-card p-3">
              <img src={c.cover} alt="" loading="lazy" className="h-14 w-14 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-[16px] leading-none tracking-tight">{c.name}</h3>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Users2 className="h-3 w-3" /> {c.members.toLocaleString()} · {c.city}
                </p>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </article>
          ))}
        </div>
      ) : null}

      {tab === "Trophies" ? (
        <section className="p-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <span className="text-mono-caps text-muted-foreground">Earned</span>
              <p className="mt-1 font-display text-[20px] leading-none tracking-tight">
                {achievements.filter((a) => a.earned).length}<span className="ml-1 text-[13px] text-muted-foreground">/ {achievements.length}</span>
              </p>
            </div>
            <span className="text-mono-caps" style={{ color: "var(--color-primary)" }}>2 in progress</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((a) => <AchievementCard key={a.id} a={a} />)}
          </div>
        </section>
      ) : null}

      {tab === "Workshop" ? (
        <section className="p-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <span className="text-mono-caps text-muted-foreground">Service log</span>
              <p className="mt-1 font-display text-[20px] leading-none tracking-tight">Nightshade MT-09</p>
            </div>
            <button className="tap-press rounded-full border border-border px-3 py-1.5 font-display text-[11px]">+ Log</button>
          </div>
          <ol className="relative ml-3 border-l border-border">
            {workshopHistory.map((w) => (
              <li key={w.id} className="relative mb-4 pl-5">
                <span
                  className="absolute -left-[7px] top-1 grid h-3 w-3 place-items-center rounded-full ring-2 ring-background"
                  style={{ background: w.status === "upcoming" ? "var(--color-primary)" : "var(--color-foreground)" }}
                />
                <div className="rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-soft)]">
                  <div className="flex items-center justify-between">
                    <span className="text-mono-caps text-muted-foreground">{w.date} · {w.mileage}</span>
                    <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: w.status === "upcoming" ? "var(--color-primary)" : "var(--color-muted-foreground)" }}>
                      {w.status === "upcoming" ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                      {w.status === "upcoming" ? "Upcoming" : "Done"}
                    </span>
                  </div>
                  <h4 className="mt-1.5 font-display text-[15px] leading-tight tracking-tight">{w.title}</h4>
                  <div className="mt-2 flex items-center justify-between text-[12px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Wrench className="h-3 w-3" /> {w.shop}</span>
                    <span className="font-display tabular-nums">{w.cost}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

    </>
  );
}

function Cockpit({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl px-2 py-3 text-center"
      style={accent
        ? { background: "var(--color-foreground)", color: "var(--color-background)" }
        : { background: "var(--color-muted)" }}
    >
      <p className="font-display text-[20px] leading-none tracking-tight">{value}</p>
      <p className="mt-1 text-mono-caps opacity-70">{label}</p>
    </div>
  );
}

function SpecPod({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <p className="font-display text-[20px] leading-none tracking-tight">
        {value}<span className="ml-0.5 text-[11px] text-muted-foreground">{unit}</span>
      </p>
      <p className="mt-1 text-mono-caps text-muted-foreground">{label}</p>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-border bg-card p-4">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-muted">{icon}</span>
      <p className="mt-3 font-display text-[18px] leading-none tracking-tight">{value}</p>
      <p className="mt-1 text-mono-caps text-muted-foreground">{label}</p>
    </div>
  );
}

function AchievementCard({ a }: { a: typeof achievements[number] }) {
  const IconMap = { trophy: Trophy, flame: Flame, bolt: Zap, route: RouteIcon, wrench: Wrench, medal: Medal };
  const Icon = IconMap[a.icon];
  const rarityColor = a.rarity === "legendary"
    ? "var(--color-primary)"
    : a.rarity === "rare"
      ? "var(--color-foreground)"
      : "var(--color-muted-foreground)";
  return (
    <div
      className="depth-lift relative overflow-hidden rounded-[20px] border border-border bg-card p-4"
      style={a.earned ? undefined : { opacity: 0.55 }}
    >
      <div className="flex items-start justify-between">
        <span
          className="grid h-11 w-11 place-items-center rounded-2xl"
          style={{
            background: a.earned ? "var(--color-foreground)" : "var(--color-muted)",
            color: a.earned ? "var(--color-background)" : "var(--color-muted-foreground)",
          }}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <span className="text-mono-caps" style={{ color: rarityColor }}>{a.rarity}</span>
      </div>
      <h4 className="mt-3 font-display text-[15px] leading-tight tracking-tight">{a.title}</h4>
      <p className="mt-1 text-[11px] text-muted-foreground">{a.detail}</p>
      {a.earned ? (
        <span className="absolute right-3 bottom-3 h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-primary)", boxShadow: "0 0 8px var(--color-primary)" }} />
      ) : null}
    </div>
  );
}

