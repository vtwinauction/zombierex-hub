import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBar } from "@/components/StatusBar";
import { reels, storiesV2, listings, events, users } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZOMBIEREX — Home" },
      { name: "description", content: "Curated short-form video, garage transmissions, marketplace and events for the motorcycle & automotive community." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const featured = reels[1]; // widebody hero
  const secondaryReel = reels[0];
  const marketFeatured = listings[0];

  return (
    <div>
      <StatusBar index="01" section="HOME · TRANSMISSION" />

      <div className="space-y-10 pb-8">
        {/* ============ FEATURED BUILD — cinematic ============ */}
        <section className="rise px-4 pt-4">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="mono-tag">Featured build of the day</p>
            <p className="mono-tag" style={{ color: "var(--color-signal-deep)" }}>● Live now</p>
          </div>


          <Link to="/" className="tap group block">
            <article className="relative aspect-[3/4] w-full overflow-hidden border border-hair">
              <img src={featured.poster} alt="" className="ken-burns h-full w-full object-cover" />
              <div className="absolute inset-0" style={{
                background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 40%, rgba(0,0,0,0.85) 100%)",
              }} />

              {/* corner marks */}
              <span className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-white/70" />
              <span className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-white/70" />
              <span className="pointer-events-none absolute left-2 bottom-2 h-3 w-3 border-l border-b border-white/70" />
              <span className="pointer-events-none absolute right-2 bottom-2 h-3 w-3 border-r border-b border-white/70" />

              {/* Right-rail metadata */}
              <div className="absolute right-3 top-6 flex flex-col items-end gap-4 text-white">
                <div className="text-right">
                  <p className="mono-tag" style={{ color: "rgba(255,255,255,0.6)" }}>Builder</p>
                  <p className="text-xs font-bold">{featured.user.handle.replace("@","").toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="mono-tag" style={{ color: "rgba(255,255,255,0.6)" }}>Spec</p>
                  <p className="mono-num text-xs font-bold">{featured.vehicle?.hp} HP</p>
                </div>
                <div className="text-right">
                  <p className="mono-tag" style={{ color: "rgba(255,255,255,0.6)" }}>Views</p>
                  <p className="mono-num text-xs font-bold">{featured.views}</p>
                </div>
              </div>

              {/* Editorial bottom */}
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="mono-tag" style={{ color: "rgba(255,255,255,0.7)" }}>◎ {featured.location}</p>
                <h1 className="mt-2 text-4xl display-xl" style={{ lineHeight: 0.88 }}>
                  {featured.vehicle?.name}
                </h1>
                <div className="mt-4 hairline-t flex items-center gap-4 pt-3" style={{ borderColor: "rgba(255,255,255,0.25)" }}>
                  <span className="mono-tag" style={{ color: "rgba(255,255,255,0.7)" }}>♥ {fmt(featured.likes)}</span>
                  <span className="mono-tag" style={{ color: "rgba(255,255,255,0.7)" }}>◌ {fmt(featured.comments)}</span>
                  <span className="ml-auto inline-flex items-center gap-2" style={{
                    padding: "6px 10px",
                    border: "1px solid white",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10, letterSpacing: "0.22em", fontWeight: 600,
                  }}>
                    Watch the story →
                  </span>
                </div>
              </div>
            </article>
          </Link>
        </section>

        {/* ============ GARAGE TRANSMISSIONS · stories ============ */}
        <section>
          <div className="mb-3 flex items-baseline justify-between px-4">
            <p className="mono-tag">From your garages</p>
            <span className="mono-num text-[10px] font-bold" style={{ color: "var(--color-ash)" }}>
              {String(storiesV2.length).padStart(3,"0")}
            </span>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
            {storiesV2.map((s, i) => {
              const ringClass = s.live ? "story-ring-live" : s.seen ? "story-ring-seen" : "story-ring";
              return (
                <div key={s.id} className="shrink-0" style={{ width: 74 }}>
                  <div className={ringClass}>
                    <div className="bg-bone p-[2px]">
                      <div className="relative h-[70px] w-[70px] overflow-hidden">
                        <img src={s.cover} alt="" className="h-full w-full object-cover" />
                        {i === 0 && (
                          <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center bg-ink text-bone" style={{ fontSize: 12 }}>+</span>
                        )}
                        {s.live && (
                          <span className="absolute inset-x-0 bottom-0 py-0.5 text-center mono-tag" style={{ background: "var(--color-heat)", color: "white" }}>LIVE</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="mt-1.5 truncate text-center mono-tag" style={{ color: "var(--color-ash)" }}>
                    {i === 0 ? "YOU" : s.user.handle.replace("@","").toUpperCase()}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============ WATCH · reel preview ============ */}
        <section className="px-4">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="mono-tag">Watch now</p>
            <Link to="/" className="mono-tag" style={{ color: "var(--color-signal)" }}>See all →</Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ReelTile reel={secondaryReel} tall />
            <div className="flex flex-col gap-2">
              <ReelTile reel={reels[2]} />
              <ReelTile reel={reels[3]} />
            </div>
          </div>
        </section>

        {/* ============ MARKET · featured listing ============ */}
        <section className="px-4">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="mono-tag">Fresh in the market</p>
            <Link to="/marketplace" className="mono-tag" style={{ color: "var(--color-signal)" }}>Browse all →</Link>
          </div>
          <Link to="/marketplace" className="tap block">
            <article className="hairline grid grid-cols-5 overflow-hidden">
              <div className="col-span-3 aspect-square">
                <img src={marketFeatured.image} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="col-span-2 flex flex-col justify-between border-l border-hair p-4">
                <div>
                  <p className="mono-tag" style={{ color: "var(--color-ash)" }}>{marketFeatured.condition} · {marketFeatured.category}</p>
                  <p className="mt-2 text-[13px] font-bold leading-tight">{marketFeatured.title}</p>
                </div>
                <div>
                  <p className="mono-tag" style={{ color: "var(--color-ash)" }}>Asking</p>
                  <p className="display-numeral mt-1 text-3xl">{marketFeatured.price.replace("$","")}</p>
                  <p className="mono-tag mt-1" style={{ color: "var(--color-ash)" }}>USD · {marketFeatured.location}</p>
                </div>
              </div>
            </article>
          </Link>
        </section>

        {/* ============ SIGNAL · community events ============ */}
        <section>
          <div className="mb-3 flex items-baseline justify-between px-4">
            <p className="mono-tag">Upcoming meets</p>
            <Link to="/events" className="mono-tag" style={{ color: "var(--color-signal)" }}>See all →</Link>
          </div>
          <div className="hairline-t hairline-b divide-y divide-[color:var(--color-hair)]">
            {events.slice(0,3).map((e, i) => (
              <Link key={e.id} to="/events" className="tap grid grid-cols-[64px_1fr_auto] items-center gap-4 px-4 py-4">
                <span className="display-numeral text-2xl" style={{ color: "var(--color-ash)" }}>{String(i+1).padStart(2,"0")}</span>
                <div>
                  <p className="mono-tag" style={{ color: "var(--color-ash)" }}>{e.date} · {e.time}</p>
                  <p className="mt-1 text-sm font-bold leading-tight">{e.title}</p>
                  <p className="mono-tag mt-1" style={{ color: "var(--color-ash)" }}>◎ {e.location}</p>
                </div>
                <span className="mono-num text-xs font-bold" style={{ color: "var(--color-signal)" }}>{e.attending}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ============ PILOTS · community strip ============ */}
        <section className="px-4">
          <p className="mono-tag mb-3">Riders you might like</p>
          <div className="grid grid-cols-3 gap-2">
            {users.map((u, i) => (
              <div key={u.id} className="hairline p-3 text-center">
                <div className="mx-auto h-14 w-14 overflow-hidden">
                  <img src={u.avatar} alt="" className="h-full w-full object-cover" />
                </div>
                <p className="mono-tag mt-2" style={{ color: "var(--color-ash)" }}>P·{String(i+1).padStart(2,"0")}</p>
                <p className="mt-0.5 truncate text-[11px] font-bold">{u.name}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ReelTile({ reel, tall }: { reel: (typeof reels)[number]; tall?: boolean }) {
  return (
    <Link to="/" className="tap group relative block overflow-hidden border border-hair" style={{ aspectRatio: tall ? "3/4" : "3/2" }}>
      <img src={reel.poster} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2 text-white">
        <p className="mono-tag" style={{ color: "rgba(255,255,255,0.7)" }}>{reel.user.handle.replace("@","").toUpperCase()}</p>
        <p className="mono-num text-[11px] font-bold">{reel.views}</p>
      </div>
      <span className="absolute right-2 top-2 mono-tag" style={{ color: "rgba(255,255,255,0.8)" }}>
        ▶ {String(reel.duration).padStart(2,"0")}s
      </span>
    </Link>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}
