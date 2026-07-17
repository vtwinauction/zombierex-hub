import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { PostCard } from "@/components/PostCard";
import { events, listings, myVehicles, posts, clubs, me } from "@/lib/mock-data";
import { ArrowUpRight, Flame, Gauge, MapPin, Sparkles, TrendingUp, Users2, Wrench, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HubPage,
});

function HubPage() {
  const featuredBuild = posts[1];
  const nextEvent = events[0];
  const marketPick = listings[1];
  const featuredClub = clubs[0];
  const myBike = myVehicles[0];

  return (
    <>
      <TopBar showLogo />

      {/* Greeting */}
      <section className="px-5 pt-2">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-mono-caps text-muted-foreground">Friday · Nov 21</p>
            <h1 className="mt-2 font-display text-[32px] leading-[1.05] tracking-[-0.02em]">
              Good morning,<br />
              <span className="text-muted-foreground">rider_x.</span>
            </h1>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-primary)", boxShadow: "0 0 8px var(--color-primary)" }} />
            <span className="text-mono-caps">Live</span>
          </span>
        </div>
      </section>

      {/* BENTO GRID */}
      <section className="mt-6 grid grid-cols-6 gap-3 px-5">
        {/* MY GARAGE — hero tile */}
        <Link
          to="/profile"
          className="group relative col-span-6 overflow-hidden rounded-[28px] bg-foreground p-5 text-background"
          style={{ minHeight: 220 }}
        >
          <div
            className="absolute inset-0 opacity-70"
            style={{ backgroundImage: `url(${myBike.cover})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.12 0.01 240 / 0.3), oklch(0.08 0.01 240 / 0.85))" }} />
          <div className="relative flex h-full flex-col justify-between" style={{ minHeight: 190 }}>
            <div className="flex items-start justify-between">
              <span className="text-mono-caps text-white/70">Your garage · 1 bike</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 backdrop-blur">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
            <div>
              <p className="text-mono-caps" style={{ color: "var(--color-primary)" }}>{myBike.year} · {myBike.type}</p>
              <h2 className="mt-1 font-display text-[30px] leading-none tracking-tight">{myBike.name}</h2>
              <div className="mt-4 flex items-center gap-4 text-[12px]">
                <StatChip icon={<Gauge className="h-3.5 w-3.5" />} label={`${myBike.hp} HP`} />
                <StatChip icon={<Wrench className="h-3.5 w-3.5" />} label={`${myBike.mods.length} mods`} />
                <StatChip icon={<Zap className="h-3.5 w-3.5" />} label="18k mi" />
              </div>
            </div>
          </div>
        </Link>

        {/* NEXT RIDE */}
        <Link to="/events" className="col-span-4 overflow-hidden rounded-[24px] border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-mono-caps text-muted-foreground">Next ride</span>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-muted">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-3 font-display text-[13px] leading-none" style={{ color: "var(--color-primary)" }}>{nextEvent.date}</p>
          <h3 className="mt-1.5 font-display text-[19px] leading-tight tracking-tight">{nextEvent.title}</h3>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{nextEvent.location}</span>
            <span>·</span>
            <span>{nextEvent.attending} going</span>
          </div>
        </Link>

        {/* WEEK STATS */}
        <div className="col-span-2 flex flex-col justify-between overflow-hidden rounded-[24px] p-4" style={{ background: "var(--color-foreground)", color: "var(--color-background)" }}>
          <span className="text-mono-caps opacity-60">This week</span>
          <div>
            <p className="font-display text-[36px] leading-none tracking-tight">247</p>
            <p className="mt-1 text-[11px] opacity-70">miles ridden</p>
            <div className="mt-3 flex h-1 w-full items-center gap-1">
              {[0.4, 0.7, 0.3, 0.9, 0.5, 0.8, 1].map((v, i) => (
                <span key={i} className="w-full rounded-full" style={{ height: `${v * 20}px`, background: "var(--color-primary)", opacity: 0.4 + v * 0.6 }} />
              ))}
            </div>
          </div>
        </div>

        {/* TRENDING BUILD */}
        <div className="col-span-6 overflow-hidden rounded-[24px] border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="inline-flex items-center gap-1.5 text-mono-caps text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" style={{ color: "var(--color-primary)" }} /> Trending build
            </span>
            <span className="text-mono-caps text-muted-foreground">{featuredBuild.likes.toLocaleString()} ❤</span>
          </div>
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <img src={featuredBuild.image} alt="" loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
              <div className="max-w-[70%]">
                <p className="font-display text-[11px]" style={{ color: "var(--color-primary)", textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{featuredBuild.vehicle?.year} · {featuredBuild.vehicle?.hp} HP</p>
                <h3 className="mt-1 font-display text-[22px] leading-tight tracking-tight text-white" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}>{featuredBuild.vehicle?.name}</h3>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/95 backdrop-blur">
                <ArrowUpRight className="h-4 w-4 text-foreground" />
              </span>
            </div>
          </div>
          <p className="px-4 py-3 text-[13px] leading-snug text-muted-foreground">"{featuredBuild.caption}"</p>
        </div>

        {/* MARKETPLACE PICK */}
        <Link to="/marketplace" className="col-span-3 overflow-hidden rounded-[24px] border border-border bg-card">
          <div className="relative aspect-square w-full overflow-hidden">
            <img src={marketPick.image} alt="" loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute left-2.5 top-2.5 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium backdrop-blur">
              {marketPick.condition}
            </span>
          </div>
          <div className="p-3">
            <span className="text-mono-caps text-muted-foreground">Market pick</span>
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-tight">{marketPick.title}</p>
            <p className="mt-2 font-display text-[18px] leading-none tracking-tight">{marketPick.price}</p>
          </div>
        </Link>

        {/* CLUB */}
        <Link to="/profile" className="col-span-3 flex flex-col overflow-hidden rounded-[24px] p-4" style={{ background: "var(--color-surface-2)" }}>
          <span className="text-mono-caps text-muted-foreground">Your club</span>
          <div className="mt-2 flex-1">
            <img src={featuredClub.cover} alt="" loading="lazy" className="h-16 w-16 rounded-2xl object-cover" />
            <h3 className="mt-3 font-display text-[19px] leading-tight tracking-tight">{featuredClub.name}</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">{featuredClub.city}</p>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Users2 className="h-3 w-3" />{featuredClub.members.toLocaleString()}</span>
            <span className="text-mono-caps" style={{ color: "var(--color-primary)" }}>3 new</span>
          </div>
        </Link>

        {/* FRIENDS ACTIVITY */}
        <div className="col-span-6 overflow-hidden rounded-[24px] border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-mono-caps text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--color-primary)" }} /> Friends activity
            </span>
            <button className="text-mono-caps text-muted-foreground">See all</button>
          </div>
          <ul className="mt-3 space-y-3">
            {posts.slice(0, 3).map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <img src={p.user.avatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px]"><span className="font-medium">{p.user.name}</span> <span className="text-muted-foreground">posted a new build</span></p>
                  <p className="text-mono-caps text-muted-foreground">{p.timeAgo} ago · {p.likes.toLocaleString()} ❤</p>
                </div>
                <img src={p.image} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
              </li>
            ))}
          </ul>
        </div>

        {/* WORKSHOPS RECO */}
        <div className="col-span-6 overflow-hidden rounded-[24px] p-5" style={{ background: "linear-gradient(135deg, oklch(0.82 0.2 152 / 0.18), oklch(0.82 0.2 152 / 0.04))" }}>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full" style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>
              <Wrench className="h-4 w-4" />
            </span>
            <span className="text-mono-caps">Workshops near {me.location.split(",")[0]}</span>
          </div>
          <h3 className="mt-3 font-display text-[22px] leading-tight tracking-tight">Book your next service — 3 verified shops within 5 mi</h3>
          <div className="mt-4 flex items-center gap-2">
            <button className="rounded-full bg-foreground px-5 py-2.5 font-display text-[13px] text-background">Browse workshops</button>
            <button className="rounded-full border border-border bg-card/60 px-4 py-2.5 font-display text-[13px]">Later</button>
          </div>
        </div>
      </section>

      <div className="mt-10 flex items-center justify-center gap-2 px-5">
        <Flame className="h-3.5 w-3.5" style={{ color: "var(--color-primary)" }} />
        <p className="text-mono-caps text-muted-foreground">End of feed · Pull for more</p>
      </div>
    </>
  );
}

function StatChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 backdrop-blur">
      {icon}
      <span className="text-mono-caps">{label}</span>
    </span>
  );
}
