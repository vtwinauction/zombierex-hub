import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StatusBar } from "@/components/StatusBar";
import { me, myVehicles, rider, achievements, workshopHistory, reels } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Digital Garage · ZOMBIEREX" },
      { name: "description", content: "The rider's digital garage — machine, dossier, telemetry, workshop log." },
    ],
  }),
  component: ProfilePage,
});

const TABS = ["REELS", "GARAGE", "TROPHIES", "LOG"] as const;
type Tab = typeof TABS[number];

function ProfilePage() {
  const [tab, setTab] = useState<Tab>("REELS");
  const bike = myVehicles[0];
  const xpPct = Math.min(100, Math.round((rider.xp / rider.xpToNext) * 100));
  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <div className="pb-16" style={{ background: "var(--color-obsidian, #0a0a0a)" }}>
      <StatusBar index="05" section="GARAGE · OPERATOR" />

      {/* ============ DOSSIER HEADER ============ */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 border-b border-hair px-4 py-4"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03), transparent)" }}>
        <div className="min-w-0">
          <p className="mono-tag" style={{ color: "var(--color-titanium)", letterSpacing: "0.18em" }}>
            PROFILE // ID-{me.id.toUpperCase()}-ZR
          </p>
          <h1 className="serif mt-1 text-2xl italic leading-none" style={{ color: "var(--color-ink)" }}>
            Digital Garage
          </h1>
        </div>
        <div className="shrink-0 text-right">
          <p className="mono-tag font-bold" style={{ color: "var(--color-titanium)" }}>STATUS</p>
          <div className="mt-1 flex items-center justify-end gap-1.5">
            <span className="signal-pulse block h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-neon)" }} />
            <span className="mono-tag font-bold" style={{ color: "var(--color-neon)" }}>ACTIVE</span>
          </div>
        </div>
      </header>

      {/* ============ MACHINE HERO ============ */}
      <section className="relative h-72 w-full overflow-hidden border-b border-hair">
        <img src={bike.cover} alt="" className="ken-burns h-full w-full object-cover" style={{ filter: "grayscale(0.35) contrast(1.15)", opacity: 0.9 }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 30%, rgba(10,10,10,0.75) 75%, var(--color-obsidian,#0a0a0a) 100%)" }} />
        {/* corner ticks */}
        <span className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t" style={{ borderColor: "var(--color-neon)" }} />
        <span className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t" style={{ borderColor: "var(--color-neon)" }} />
        <span className="pointer-events-none absolute left-2 bottom-2 h-3 w-3 border-l border-b" style={{ borderColor: "rgba(255,255,255,0.25)" }} />
        <span className="pointer-events-none absolute right-2 bottom-2 h-3 w-3 border-r border-b" style={{ borderColor: "rgba(255,255,255,0.25)" }} />

        {/* designation */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="mono-tag font-bold" style={{ color: "var(--color-neon)" }}>DESIGNATION</p>
          <h2 className="serif mt-1 text-2xl italic leading-none" style={{ color: "var(--color-ink)" }}>
            {bike.name}
          </h2>
        </div>
        {/* mark tag */}
        <div className="absolute right-3 top-3 border px-2 py-1 backdrop-blur"
          style={{ borderColor: "var(--color-hair-strong)", background: "rgba(0,0,0,0.55)" }}>
          <p className="mono-tag font-bold" style={{ color: "var(--color-silver)" }}>
            {bike.year} · {bike.type === "Motorcycle" ? "MOTO / CUSTOM" : "AUTO / CUSTOM"}
          </p>
        </div>
      </section>

      {/* ============ OPERATOR CARD ============ */}
      <section className="relative border-b border-hair px-4 py-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 border p-[2px]" style={{ borderColor: "var(--color-neon)" }}>
              <img src={me.avatar} alt="" className="h-12 w-12 object-cover" style={{ filter: "grayscale(0.2)" }} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-tight" style={{ color: "var(--color-ink)" }}>
                {me.handle.replace("@", "")}
              </p>
              <p className="mono-tag font-bold" style={{ color: "var(--color-titanium)" }}>VETERAN RIDER</p>
              <p className="mono-tag mt-0.5" style={{ color: "var(--color-silver)" }}>◎ {me.location}</p>
            </div>
          </div>
          <div className="shrink-0 px-2 py-1 text-[10px] font-black italic"
            style={{ background: "var(--color-neon)", color: "#0a0a0a" }}>
            LVL {rider.level}
          </div>
        </div>

        {/* XP */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
            <span style={{ color: "var(--color-titanium)" }}>EXPERIENCE PROGRESSION</span>
            <span style={{ color: "var(--color-ink)" }}>{xpPct}%</span>
          </div>
          <div className="h-1 w-full" style={{ background: "var(--color-hair)" }}>
            <div className="relative h-full" style={{ width: `${xpPct}%`, background: "var(--color-neon)" }}>
              <div className="absolute -right-1 top-0 bottom-0 w-[2px]" style={{ background: "var(--color-ink)" }} />
            </div>
          </div>
          <p className="mono-tag mt-1" style={{ color: "var(--color-silver)" }}>
            {rider.xp.toLocaleString()} / {rider.xpToNext.toLocaleString()} XP · {rider.title}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <button className="btn-neon">Edit profile</button>
          <button className="btn-ghost">Share unit</button>
          <Link to="/settings" className="btn-ghost text-center">Settings</Link>
        </div>
      </section>

      {/* ============ SPEEDO TELEMETRY ============ */}
      <section className="border-b border-hair px-4 pt-5 pb-4" style={{ background: "radial-gradient(ellipse at 50% 120%, rgba(163,255,26,0.06), transparent 60%)" }}>
        <div className="mb-3 flex items-center gap-2">
          <span className="signal-pulse block h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-neon)" }} />
          <span className="mono-tag font-bold" style={{ color: "var(--color-titanium)" }}>LIVE TELEMETRY</span>
          <span className="etch flex-1" />
          <span className="mono-tag" style={{ color: "var(--color-silver)" }}>UNIT V·{bike.id.toUpperCase()}</span>
        </div>
        <Speedo topSpeed={bike.hp + 45} hp={bike.hp} />
        <div className="mt-3 grid grid-cols-4 gap-px" style={{ background: "var(--color-hair)" }}>
          <StatCell k="NETWORK" v="12.4K" />
          <StatCell k="SORTIES" v="47" />
          <StatCell k="ODO" v="8.9K" u="mi" />
          <StatCell k="TROPHIES" v={`${earnedCount}/${achievements.length}`} />
        </div>
      </section>


      {/* ============ ACHIEVEMENT RIBBONS ============ */}
      <section className="border-b border-hair px-4 py-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="mono-tag font-bold" style={{ color: "var(--color-titanium)" }}>BADGES</span>
          <span className="etch flex-1" />
          <span className="mono-tag" style={{ color: "var(--color-silver)" }}>{earnedCount} EARNED</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {achievements.map((a) => (
            <div
              key={a.id}
              className="flex flex-none items-center gap-2 border px-3 py-1.5"
              style={{
                borderColor: a.earned ? "var(--color-hair-strong)" : "var(--color-hair)",
                background: "rgba(255,255,255,0.02)",
                opacity: a.earned ? 1 : 0.4,
              }}
            >
              <div className="h-3 w-1" style={{
                background: a.earned
                  ? a.rarity === "legendary" ? "var(--color-neon)" : a.rarity === "rare" ? "var(--color-ink)" : "var(--color-silver)"
                  : "var(--color-hair-strong)"
              }} />
              <span className="mono-tag font-bold whitespace-nowrap" style={{
                color: a.earned ? "var(--color-ink)" : "var(--color-titanium)",
              }}>
                {a.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ TABS ============ */}
      <nav className="flex border-b border-hair" style={{ background: "rgba(255,255,255,0.02)" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="tap flex-1 border-b-2 py-3 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{
              borderColor: tab === t ? "var(--color-neon)" : "transparent",
              color: tab === t ? "var(--color-ink)" : "var(--color-titanium)",
            }}
          >
            {t}
          </button>
        ))}
      </nav>

      {/* ============ TAB CONTENT ============ */}
      <div style={{ background: "var(--color-obsidian, #0a0a0a)" }}>
        {tab === "REELS" && (
          <div className="grid grid-cols-2 gap-px" style={{ background: "var(--color-hair)" }}>
            {reels.map((r, i) => (
              <div key={r.id} className="relative aspect-square" style={{ background: "var(--color-slate)" }}>
                <img src={r.poster} alt="" className="h-full w-full object-cover"
                  style={{ filter: "grayscale(0.3) brightness(0.85)" }} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute left-2 top-2 border px-1 text-[8px] font-bold tracking-widest"
                  style={{ borderColor: "var(--color-hair-strong)", background: "rgba(0,0,0,0.75)", color: "var(--color-ink)" }}>
                  LOG_{String(i + 1).padStart(3, "0")}
                </div>
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  <span className="h-1 w-1" style={{ background: "var(--color-neon)" }} />
                  <span className="mono-num text-[10px] font-bold text-white">▶ {r.views}</span>
                </div>
              </div>
            ))}
            <button className="flex aspect-square items-center justify-center border border-dashed"
              style={{ borderColor: "var(--color-hair-strong)", background: "var(--color-slate)" }}>
              <div className="text-center">
                <div className="text-xl font-thin" style={{ color: "var(--color-neon)" }}>+</div>
                <span className="mono-tag font-bold" style={{ color: "var(--color-titanium)" }}>DATA LINK</span>
              </div>
            </button>
          </div>
        )}

        {tab === "GARAGE" && (
          <div className="space-y-3 p-3">
            {myVehicles.map((v) => (
              <article key={v.id} className="overflow-hidden border" style={{ borderColor: "var(--color-hair-strong)", background: "var(--color-slate)" }}>
                <div className="relative h-44 w-full">
                  <img src={v.cover} alt="" className="h-full w-full object-cover" style={{ filter: "grayscale(0.25)" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-2 left-3">
                    <p className="mono-tag font-bold" style={{ color: "var(--color-neon)" }}>UNIT V·{v.id.toUpperCase()}</p>
                    <p className="serif text-lg italic" style={{ color: "var(--color-ink)" }}>{v.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-px" style={{ background: "var(--color-hair)" }}>
                  <SubCell k="YEAR" v={String(v.year)} />
                  <SubCell k="POWER" v={String(v.hp)} u="hp" accent />
                  <SubCell k="MODS" v={String(v.mods.length)} />
                </div>
                <ul>
                  {v.mods.map((m, i) => (
                    <li key={m} className="flex items-center gap-3 border-t px-3 py-2" style={{ borderColor: "var(--color-hair)" }}>
                      <span className="mono-tag" style={{ color: "var(--color-titanium)" }}>M·{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[13px]" style={{ color: "var(--color-ink)" }}>{m}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}

        {tab === "TROPHIES" && (
          <div className="grid grid-cols-2 gap-px" style={{ background: "var(--color-hair)" }}>
            {achievements.map((a, i) => (
              <div key={a.id} className="p-3" style={{ background: "var(--color-slate)", opacity: a.earned ? 1 : 0.45 }}>
                <div className="flex items-center justify-between">
                  <span className="mono-tag font-bold" style={{ color: "var(--color-titanium)" }}>T·{String(i + 1).padStart(2, "0")}</span>
                  <span className="mono-tag font-bold" style={{
                    color: a.rarity === "legendary" ? "var(--color-neon)"
                      : a.rarity === "rare" ? "var(--color-ink)" : "var(--color-silver)",
                  }}>{a.rarity.toUpperCase()}</span>
                </div>
                <p className="serif mt-3 text-[15px] italic leading-tight" style={{ color: "var(--color-ink)" }}>{a.title}</p>
                <p className="mono-tag mt-1" style={{ color: "var(--color-silver)" }}>{a.detail}</p>
                <div className="mt-3 h-[2px]" style={{ background: a.earned ? "var(--color-neon)" : "var(--color-hair-strong)" }} />
              </div>
            ))}
          </div>
        )}

        {tab === "LOG" && (
          <ul className="divide-y" style={{ borderColor: "var(--color-hair)" }}>
            {workshopHistory.map((w, i) => (
              <li key={w.id} className="grid grid-cols-[44px_1fr_auto] items-start gap-3 border-b px-4 py-3"
                style={{ borderColor: "var(--color-hair)" }}>
                <div>
                  <span className="serif text-xl italic" style={{ color: "var(--color-titanium)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <p className="mono-tag" style={{ color: "var(--color-silver)" }}>{w.date}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium" style={{ color: "var(--color-ink)" }}>{w.title}</p>
                  <p className="mono-tag mt-0.5" style={{ color: "var(--color-silver)" }}>{w.shop} · {w.mileage}</p>
                </div>
                <div className="text-right">
                  <p className="mono-num text-sm font-bold" style={{ color: "var(--color-ink)" }}>{w.cost}</p>
                  <p className="mono-tag mt-0.5 font-bold" style={{
                    color: w.status === "upcoming" ? "var(--color-ember)" : "var(--color-neon)",
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

function StatCell({ k, v, u, accent }: { k: string; v: string; u?: string; accent?: boolean }) {
  return (
    <div className="p-4 text-center" style={{ background: "var(--color-obsidian, #0a0a0a)" }}>
      <p className="mono-tag font-bold" style={{ color: "var(--color-titanium)" }}>{k}</p>
      <p className="serif mt-1 text-xl italic leading-none"
        style={{ color: accent ? "var(--color-neon)" : "var(--color-ink)" }}>
        {v}
        {u && <span className="mono ml-1 text-[10px]" style={{ color: "var(--color-silver)" }}>{u}</span>}
      </p>
    </div>
  );
}

function SubCell({ k, v, u, accent }: { k: string; v: string; u?: string; accent?: boolean }) {
  return (
    <div className="p-2.5 text-center" style={{ background: "var(--color-slate)" }}>
      <p className="mono-tag" style={{ color: "var(--color-titanium)", fontSize: 8.5 }}>{k}</p>
      <p className="serif mt-0.5 text-lg italic leading-none"
        style={{ color: accent ? "var(--color-neon)" : "var(--color-ink)" }}>
        {v}
        {u && <span className="mono ml-1 text-[10px]" style={{ color: "var(--color-silver)" }}>{u}</span>}
      </p>
    </div>
  );
}

/* ============ SPEEDO ============ */
function Speedo({ topSpeed, hp }: { topSpeed: number; hp: number }) {
  // Half-circle gauge 0..300 mph, needle sweeps to topSpeed on mount
  const MAX = 300;
  const [value, setValue] = useState(0);
  const [rpm, setRpm] = useState(0);

  useEffect(() => {
    const t1 = requestAnimationFrame(() => setValue(topSpeed));
    const t2 = setTimeout(() => setRpm(Math.min(100, Math.round((hp / 250) * 100))), 400);
    return () => { cancelAnimationFrame(t1); clearTimeout(t2); };
  }, [topSpeed, hp]);

  const pct = Math.min(1, value / MAX);
  const angle = -90 + pct * 180; // -90deg (left) → +90deg (right)

  // Build tick marks around the arc
  const ticks = Array.from({ length: 31 }, (_, i) => {
    const a = -90 + (i / 30) * 180;
    const major = i % 5 === 0;
    return { a, major, label: major ? String(Math.round((i / 30) * MAX)) : null };
  });

  const cx = 130, cy = 130, r = 108;

  return (
    <div className="relative overflow-hidden border" style={{ borderColor: "var(--color-hair-strong)", background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.35))" }}>
      {/* corner ticks */}
      <span className="pointer-events-none absolute left-1.5 top-1.5 h-2 w-2 border-l border-t" style={{ borderColor: "var(--color-neon)" }} />
      <span className="pointer-events-none absolute right-1.5 top-1.5 h-2 w-2 border-r border-t" style={{ borderColor: "var(--color-neon)" }} />

      <div className="mx-auto flex justify-center pt-3">
        <svg viewBox="0 0 260 160" className="h-[168px] w-full max-w-[320px]" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="arcTrack" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="rgba(255,255,255,0.12)" />
              <stop offset="0.7" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="1" stopColor="rgba(255,80,80,0.35)" />
            </linearGradient>
            <linearGradient id="arcFill" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="var(--color-silver)" />
              <stop offset="0.65" stopColor="var(--color-neon)" />
              <stop offset="1" stopColor="#ff3d3d" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Track arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke="url(#arcTrack)" strokeWidth="10" strokeLinecap="butt"
          />
          {/* Filled arc up to needle */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke="url(#arcFill)" strokeWidth="10"
            strokeDasharray={`${Math.PI * r}`}
            strokeDashoffset={`${Math.PI * r * (1 - pct)}`}
            style={{ transition: "stroke-dashoffset 1600ms cubic-bezier(.2,.7,.15,1)" }}
            filter="url(#glow)"
          />

          {/* Ticks */}
          {ticks.map((t, i) => {
            const rad = (t.a * Math.PI) / 180;
            const r1 = r - (t.major ? 16 : 8);
            const r2 = r - 2;
            const x1 = cx + Math.cos(rad) * r1;
            const y1 = cy + Math.sin(rad) * r1;
            const x2 = cx + Math.cos(rad) * r2;
            const y2 = cy + Math.sin(rad) * r2;
            const stroke = t.major ? "var(--color-ink)" : "rgba(255,255,255,0.35)";
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={t.major ? 1.4 : 1} />
                {t.label && (
                  <text
                    x={cx + Math.cos(rad) * (r - 28)}
                    y={cy + Math.sin(rad) * (r - 28) + 3}
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    fill="var(--color-titanium)"
                  >
                    {t.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Needle */}
          <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: "transform 1600ms cubic-bezier(.2,.7,.15,1)" }}>
            <line x1={cx} y1={cy} x2={cx} y2={cy - r + 10} stroke="var(--color-neon)" strokeWidth="2.4" strokeLinecap="round" filter="url(#glow)" />
            <circle cx={cx} cy={cy - r + 12} r="3" fill="var(--color-neon)" />
          </g>
          {/* Hub */}
          <circle cx={cx} cy={cy} r="10" fill="#0a0a0a" stroke="var(--color-hair-strong)" />
          <circle cx={cx} cy={cy} r="3" fill="var(--color-neon)" />

          {/* Labels under the arc */}
          <text x={cx} y={cy + 22} textAnchor="middle" fontSize="8" letterSpacing="2" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fill="var(--color-titanium)">
            MPH · TOP SPEED
          </text>
        </svg>
      </div>

      {/* Digital readouts */}
      <div className="grid grid-cols-3 gap-px border-t" style={{ borderColor: "var(--color-hair)", background: "var(--color-hair)" }}>
        <ReadoutCell label="SPEED" value={String(Math.round(value))} unit="mph" accent />
        <ReadoutCell label="POWER" value={String(hp)} unit="hp" />
        <ReadoutCell label="TACH">
          <div className="mt-1 flex h-3 items-end gap-[2px]">
            {Array.from({ length: 14 }).map((_, i) => {
              const active = i < Math.round((rpm / 100) * 14);
              const hot = i >= 11;
              return (
                <span key={i} className="w-full"
                  style={{
                    height: `${40 + i * 4}%`,
                    background: active ? (hot ? "#ff3d3d" : "var(--color-neon)") : "rgba(255,255,255,0.08)",
                    transition: `background 200ms ease ${i * 40}ms`,
                  }} />
              );
            })}
          </div>
        </ReadoutCell>
      </div>
    </div>
  );
}

function ReadoutCell({
  label, value, unit, accent, children,
}: { label: string; value?: string; unit?: string; accent?: boolean; children?: React.ReactNode }) {
  return (
    <div className="px-3 py-2.5" style={{ background: "var(--color-obsidian, #0a0a0a)" }}>
      <p className="mono-tag font-bold" style={{ color: "var(--color-titanium)" }}>{label}</p>
      {children ?? (
        <p className="mono-num mt-0.5 text-lg font-bold leading-none tabular-nums"
          style={{ color: accent ? "var(--color-neon)" : "var(--color-ink)", letterSpacing: "0.02em" }}>
          {value}
          {unit && <span className="mono ml-1 text-[10px] font-normal" style={{ color: "var(--color-silver)" }}>{unit}</span>}
        </p>
      )}
    </div>
  );
}

