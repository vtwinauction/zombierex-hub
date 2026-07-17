import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/StatusBar";
import { InteractionBar } from "@/components/InteractionBar";
import { RiderBadge, RiderMark, type RiderTier } from "@/components/RiderBadge";
import { reels, storiesV2, listings, events, users } from "@/lib/mock-data";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZOMBIEREX — Broadcast" },
      { name: "description", content: "Editorial broadcast for motorcycle & automotive culture. Machine of the day, garage transmissions, marketplace, meets." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const featured = reels[1];
  const secondaryReel = reels[0];
  const marketFeatured = listings[0];
  const issue = "N° 047";

  return (
    <div className="pb-16">
      <StatusBar index="01" section="HOME · TRANSMISSION" />

      {/* ==================================================
         EDITORIAL MASTHEAD — Machine of the Day
         Asymmetric split: serif title over cinematic image,
         floating spec-card overlaps into next section.
         ================================================== */}
      <section className="rise relative pt-6">
        {/* Issue / date rail */}
        <div className="flex items-center gap-3 px-4">
          <span className="mono-tag">Issue {issue}</span>
          <span className="etch flex-1" />
          <span className="mono-tag" style={{ color: "var(--color-neon)" }}>● Live · {featured.location}</span>
        </div>

        {/* Serif title */}
        <div className="mt-4 px-4">
          <p className="mono-tag" style={{ color: "var(--color-silver)" }}>Machine of the day</p>
          <h1 className="mt-1.5 serif text-[52px] leading-[0.9]" style={{ color: "var(--color-ink)" }}>
            <span className="italic">The&nbsp;</span>
            <span>{featured.vehicle?.name?.split(" ")[0]}</span>
            <br />
            <span className="italic" style={{ color: "var(--color-neon)" }}>{featured.vehicle?.name?.split(" ").slice(1).join(" ") || "Widebody"}</span>
          </h1>
          <p className="mt-3 max-w-[28ch] text-[13px] leading-snug" style={{ color: "var(--color-silver)" }}>
            A widebody GT86 built between two winters in a Tempelhof hangar — 340&nbsp;hp, hand-flared arches, one obsession.
          </p>
        </div>

        {/* Cinematic asymmetric image + vertical spine label */}
        <div className="relative mt-5 pl-4">
          <Link to="/" className="tap group relative block">
            <div className="relative aspect-[4/5] w-full overflow-hidden" style={{ borderTop: "1px solid var(--color-hair)", borderLeft: "1px solid var(--color-hair)", borderBottom: "1px solid var(--color-hair)" }}>
              <img src={featured.poster} alt="" className="ken-burns h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, rgba(0,0,0,0.75) 100%)" }} />
              {/* corner ticks */}
              <span className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-white/70" />
              <span className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-white/70" />
              <span className="pointer-events-none absolute left-2 bottom-2 h-3 w-3 border-l border-b border-white/70" />
              <span className="pointer-events-none absolute right-2 bottom-2 h-3 w-3 border-r border-b border-white/70" />

              {/* caption plate */}
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="mono-tag" style={{ color: "rgba(255,255,255,0.75)" }}>◎ {featured.location}</p>
                    <p className="serif mt-1 flex items-center gap-2 italic text-lg leading-tight">
                      <span>Built by <span style={{ color: "var(--color-neon)" }}>{featured.user.handle}</span></span>
                      <RiderMark tier="APEX_REX" />
                    </p>
                  </div>
                  <span className="mono-caps px-2 py-1" style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.25)" }}>
                    Watch →
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* vertical spine */}
          <div className="pointer-events-none absolute left-0 top-0 flex h-full w-4 items-center justify-center">
            <span className="spine">Zombierex · {issue} · Tempelhof</span>
          </div>
        </div>

        {/* ── Interaction Bar (Like · Comment · Views · Share · Save) ── */}
        <div className="relative z-10 -mt-5 px-4">
          <InteractionBar
            variant="dark"
            targetId={`reel:${featured.id}`}
            counts={{
              likes: featured.likes,
              comments: featured.comments,
              views: featured.views,
              shares: featured.shares,
            }}
          />
        </div>

        {/* Floating spec card */}
        <div className="relative mt-4 px-4">
          <div className="surface-brushed lift-2 grid grid-cols-4 divide-x" style={{ borderRadius: 3, borderColor: "var(--color-hair-strong)" }}>
            <Spec k="Power" v={`${featured.vehicle?.hp}`} u="hp" />
            <Spec k="Torque" v="284" u="nm" />
            <Spec k="0–100" v="4.2" u="s" />
            <Spec k="Weight" v="1180" u="kg" accent />
          </div>
        </div>
      </section>


      {/* ==================================================
         GARAGE TRANSMISSIONS — stories rail
         ================================================== */}
      <section className="mt-10">
        <SectionHead kicker="Transmissions" title="From the garages" count={storiesV2.length} />
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {storiesV2.map((s, i) => {
            const ringClass = s.live ? "story-ring-live" : s.seen ? "story-ring-seen" : "story-ring";
            return (
              <div key={s.id} className="shrink-0" style={{ width: 76 }}>
                <div className={ringClass}>
                  <div style={{ background: "var(--color-obsidian)", padding: 2 }}>
                    <div className="relative h-[70px] w-[70px] overflow-hidden">
                      <img src={s.cover} alt="" className="h-full w-full object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-1 right-1 grid h-5 w-5 place-items-center" style={{ background: "var(--color-neon)", color: "var(--color-obsidian)", fontSize: 13, fontWeight: 700 }}>+</span>
                      )}
                      {s.live && (
                        <span className="absolute inset-x-0 bottom-0 py-0.5 text-center mono-tag" style={{ background: "var(--color-ember)", color: "white" }}>LIVE</span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="mt-1.5 truncate text-center mono-tag">
                  {i === 0 ? "You" : s.user.handle.replace("@","")}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================
         BROADCAST — Editorial reel grid (asymmetric)
         ================================================== */}
      <section className="mt-10 px-4">
        <SectionHead kicker="Broadcast" title="Watch tonight" link="/" />
        <div className="mt-4 flex flex-col gap-4">
          <ReelTile reel={secondaryReel} tall />
          <ReelTile reel={reels[2]} tall />
          <ReelTile reel={reels[3]} tall />
        </div>
      </section>

      {/* ==================================================
         THE VAULT — Editorial listing card (paper insert)
         ================================================== */}
      <section className="mt-10 px-4">
        <SectionHead kicker="The Vault" title="Fresh in the market" link="/marketplace" />
        <Link to="/marketplace" className="tap mt-4 block">
          <article className="surface-paper lift-2 relative overflow-hidden" style={{ borderRadius: 2 }}>
            <div className="grid grid-cols-5">
              <div className="col-span-3 aspect-square overflow-hidden">
                <img src={marketFeatured.image} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="col-span-2 flex flex-col justify-between p-4" style={{ borderLeft: "1px solid #d9d4c6" }}>
                <div>
                  <p className="mono-tag" style={{ color: "#8a8577" }}>Lot 001 · {marketFeatured.category}</p>
                  <p className="serif mt-2 text-[18px] italic leading-tight" style={{ color: "var(--color-obsidian)" }}>
                    {marketFeatured.title}
                  </p>
                </div>
                <div>
                  <p className="mono-tag" style={{ color: "#8a8577" }}>Asking</p>
                  <p className="serif mt-1 text-4xl" style={{ color: "var(--color-obsidian)", lineHeight: 0.9 }}>{marketFeatured.price.replace("$","$")}</p>
                  <p className="mono-tag mt-2" style={{ color: "#8a8577" }}>◎ {marketFeatured.location}</p>
                </div>
              </div>
            </div>
            {/* paper edge shadow */}
            <span className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.08), transparent)" }} />
          </article>
        </Link>
      </section>

      {/* ==================================================
         OPERATIONS — Meets timetable
         ================================================== */}
      <section className="mt-10">
        <SectionHead kicker="Operations" title="Upcoming meets" link="/events" className="px-4" />
        <div className="mt-3 hairline-t hairline-b">
          {events.slice(0, 3).map((e, i) => (
            <Link key={e.id} to="/events" className="tap grid grid-cols-[56px_1fr_auto] items-center gap-4 border-b border-hair px-4 py-4 last:border-b-0">
              <span className="serif text-3xl italic" style={{ color: "var(--color-titanium)" }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="mono-tag">{e.date} · {e.time}</p>
                <p className="serif mt-0.5 text-[17px] leading-tight" style={{ color: "var(--color-ink)" }}>{e.title}</p>
                <p className="mono-tag mt-1" style={{ color: "var(--color-silver)" }}>◎ {e.location}</p>
              </div>
              <span className="mono-num text-sm font-semibold" style={{ color: "var(--color-neon)" }}>{e.attending}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================================================
         PILOTS — Riders strip with rider status tiers
         ================================================== */}
      <section className="mt-10 px-4">
        <SectionHead kicker="Pilots" title="Signals nearby" />
        <div className="mt-4 grid grid-cols-3 gap-2">
          {users.map((u, i) => {
            const tiers: RiderTier[] = ["APEX_REX", "LEGEND", "MASTER_BUILDER"];
            const tier = tiers[i % tiers.length];
            return (
              <div key={u.id} className="surface-1 flex flex-col items-center p-3 text-center" style={{ borderRadius: 3 }}>
                <div className="relative">
                  <div className="mx-auto h-14 w-14 overflow-hidden hex-frame">
                    <img src={u.avatar} alt="" className="h-full w-full object-cover" />
                  </div>
                  <span className="absolute -bottom-1 -right-1">
                    <RiderMark tier={tier} />
                  </span>
                </div>
                <p className="mono-tag mt-2" style={{ color: "var(--color-silver)" }}>P·{String(i + 1).padStart(2, "0")}</p>
                <p className="serif mt-0.5 truncate text-[13px] italic" style={{ color: "var(--color-ink)" }}>{u.name}</p>
                <div className="mt-1.5">
                  <RiderBadge tier={tier} compact />
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* Colophon */}
      <footer className="mt-14 px-4">
        <div className="etch" />
        <div className="mt-3 flex items-center justify-between">
          <p className="mono-tag">© Zombierex · {issue}</p>
          <p className="serif italic text-sm" style={{ color: "var(--color-titanium)" }}>
            Ride. Rev. Resurrect.
          </p>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({ kicker, title, link, count, className }: { kicker: string; title: string; link?: string; count?: number; className?: string }) {
  return (
    <div className={`flex items-end justify-between px-4 ${className ?? ""}`}>
      <div>
        <p className="mono-tag">{kicker}</p>
        <h2 className="serif mt-0.5 text-[22px] italic leading-none" style={{ color: "var(--color-ink)" }}>{title}</h2>
      </div>
      {count != null && <span className="mono-num text-xs" style={{ color: "var(--color-titanium)" }}>{String(count).padStart(3, "0")}</span>}
      {link && (
        <Link to={link} className="mono-tag" style={{ color: "var(--color-neon)" }}>See all →</Link>
      )}
    </div>
  );
}

function Spec({ k, v, u, accent }: { k: string; v: string | number; u?: string; accent?: boolean }) {
  return (
    <div className="px-3 py-3">
      <p className="mono-tag" style={{ color: "var(--color-silver)", fontSize: 8.5 }}>{k}</p>
      <p className="serif mt-1 text-2xl italic" style={{ color: accent ? "var(--color-neon)" : "var(--color-ink)", lineHeight: 0.9 }}>
        {v}
        {u && <span className="mono ml-1 text-[10px]" style={{ color: "var(--color-silver)" }}>{u}</span>}
      </p>
    </div>
  );
}

function ReelTile({ reel, tall }: { reel: (typeof reels)[number]; tall?: boolean }) {
  return (
    <Link to="/" className="tap group relative block overflow-hidden" style={{ aspectRatio: tall ? "4/5" : "3/2", border: "1px solid var(--color-hair)", borderRadius: 8 }}>
      <img src={reel.poster} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="text-base font-semibold leading-tight">{reel.user.handle}</p>
        <p className="mono-num text-xs mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>{reel.views} views</p>
      </div>
      <span className="mono-caps absolute right-3 top-3 px-2 py-1" style={{ background: "rgba(0,0,0,0.55)", color: "white", fontSize: 10 }}>
        ▶ {String(reel.duration).padStart(2, "0")}s
      </span>
    </Link>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}
