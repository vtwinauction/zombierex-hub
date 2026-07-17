import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { InteractionBar } from "@/components/InteractionBar";
import { RiderMark } from "@/components/RiderBadge";
import {
  IconClaw,
  IconVisor,
  IconMechClaw,
  IconBoneMark,
  IconGauge,
} from "@/components/icons/RexIcons";
import brandLogo from "@/assets/zombierex-logo.png.asset.json";
import { reels, storiesV2, posts, chats, users, clubs } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZOMBIEREX — Feed" },
      { name: "description", content: "Stories, reels & garage posts for motorcycle and automotive culture." },
    ],
  }),
  component: HomePage,
});

const TRENDING_TAGS = [
  { tag: "#nightride", posts: "48.2K" },
  { tag: "#widebody", posts: "31.6K" },
  { tag: "#trackday", posts: "22.9K" },
  { tag: "#wrenchlife", posts: "18.4K" },
  { tag: "#jdm", posts: "72.1K" },
  { tag: "#turbolife", posts: "14.8K" },
];

function HomePage() {
  const [tab, setTab] = useState<"for_you" | "following">("for_you");
  const featured = reels[1];
  const gridReels = [reels[0], reels[2], reels[3]];
  const suggestedCreators = users.slice(0, 6);
  const suggestedClubs = clubs.slice(0, 4);
  const feedPosts = tab === "following" ? posts.filter((_, i) => i % 2 === 0) : posts;


  return (
    <div className="pb-24">
      {/* ==================================================
         TOP BAR — Instagram-style masthead
         Logo left · camera + chat right (Snap DNA)
         ================================================== */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 pb-3 pt-[max(env(safe-area-inset-top),12px)]"
        style={{
          background: "color-mix(in oklab, var(--color-obsidian) 82%, transparent)",
          backdropFilter: "blur(18px) saturate(160%)",
          borderBottom: "1px solid var(--color-hair)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="grid h-8 w-8 place-items-center overflow-hidden rounded-full"
            style={{ boxShadow: "0 0 0 1px rgba(198,255,61,0.35), 0 0 16px -4px rgba(198,255,61,0.45)" }}
          >
            <img src={brandLogo.url} alt="ZOMBIEREX" className="h-full w-full object-cover" />
          </div>
          <h1 className="serif text-[26px] italic leading-none" style={{ color: "var(--color-ink)" }}>
            Zombierex
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <IconChip label="Capture"><IconLens18 /></IconChip>
          <Link to="/notifications" aria-label="Signals" className="tap relative grid h-9 w-9 place-items-center rounded-full" style={{ border: "1px solid var(--color-hair)" }}>
            <IconClaw size={16} />
            <span className="engine-pulse absolute right-1 top-1 h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-ember)" }} />
          </Link>
          <Link to="/messages" aria-label="Messages" className="tap grid h-9 w-9 place-items-center rounded-full" style={{ border: "1px solid var(--color-hair)" }}>
            <IconGauge size={16} />
          </Link>
        </div>
      </header>

      {/* ==================================================
         STORIES RAIL — IG + Snap hybrid
         First tile is a camera-first "Your story" (Snap DNA)
         Ring gradients use logo colors (neon → ember)
         ================================================== */}
      <section className="mt-3">
        <div className="no-scrollbar flex gap-3.5 overflow-x-auto px-4 pb-3">
          {storiesV2.map((s, i) => {
            const isYou = i === 0;
            const ringClass = s.live ? "story-ring-live" : s.seen ? "story-ring-seen" : "story-ring";
            return (
              <button key={s.id} className="tap shrink-0 flex flex-col items-center" style={{ width: 68 }}>
                <div className={ringClass}>
                  <div style={{ background: "var(--color-obsidian)", padding: 2, borderRadius: 999 }}>
                    <div className="relative h-[60px] w-[60px] overflow-hidden rounded-full">
                      <img src={s.cover} alt="" className="h-full w-full object-cover" />
                      {isYou && (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full text-[13px] font-bold leading-none"
                          style={{ background: "var(--color-neon)", color: "var(--color-obsidian)", boxShadow: "0 0 0 2px var(--color-obsidian)" }}
                        >
                          +
                        </span>
                      )}
                      {s.live && (
                        <span
                          className="absolute inset-x-1 bottom-1 rounded-sm py-[1px] text-center"
                          style={{ background: "var(--color-ember)", color: "white", fontSize: 8, letterSpacing: "0.14em", fontWeight: 700, fontFamily: "var(--font-mono)" }}
                        >
                          LIVE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="mt-1.5 max-w-[64px] truncate text-[11px]" style={{ color: "var(--color-silver)" }}>
                  {isYou ? "Your story" : s.user.handle.replace("@", "")}
                </p>
              </button>
            );
          })}
        </div>
        <div style={{ height: 1, background: "var(--color-hair)" }} />
      </section>

      {/* ==================================================
         FEATURED REEL — TikTok DNA
         Edge-to-edge vertical media, side action rail,
         music ticker along the bottom.
         ================================================== */}
      <section className="mt-4 px-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="mono-tag" style={{ color: "var(--color-neon)" }}>● For you · Reels</p>
          <Link to="/" className="mono-tag" style={{ color: "var(--color-silver)" }}>See all →</Link>
        </div>
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "9/14", borderRadius: 18, border: "1px solid var(--color-hair)" }}
        >
          <img src={featured.poster} alt="" className="ken-burns h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 30%, rgba(0,0,0,0.85) 100%)" }} />

          {/* top row — user + follow */}
          <div className="absolute inset-x-3 top-3 flex items-center gap-2">
            <img src={featured.user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" style={{ boxShadow: "0 0 0 1.5px var(--color-neon)" }} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
                {featured.user.handle} <RiderMark tier="APEX_REX" />
              </p>
              <p className="mono-tag" style={{ color: "rgba(255,255,255,0.7)" }}>◎ {featured.location}</p>
            </div>
            <button
              className="tap rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
              style={{ background: "var(--color-ember)", color: "white", letterSpacing: "0.14em" }}
            >
              Follow
            </button>
          </div>

          {/* TikTok-style right action rail */}
          <div className="absolute bottom-20 right-3 flex flex-col items-center gap-4 text-white">
            <RailBtn Icon={IconClaw} count={fmt(featured.likes)} active tint="var(--color-ember)" />
            <RailBtn Icon={IconVisor} count={fmt(featured.comments)} />
            <RailBtn Icon={IconBoneMark} count="Save" />
            <RailBtn Icon={IconMechClaw} count={fmt(featured.shares)} />
            <div className="mt-1 h-9 w-9 overflow-hidden rounded-full border-2 border-white" style={{ animation: "ken-burns 18s linear infinite" }}>
              <img src={featured.user.avatar} alt="" className="h-full w-full object-cover" />
            </div>
          </div>

          {/* caption + music ticker */}
          <div className="absolute inset-x-3 bottom-3 pr-16 text-white">
            <p className="text-[13px] leading-snug">
              {featured.caption}
            </p>
            <p className="mt-1.5 text-[11px]" style={{ color: "rgba(255,255,255,0.75)" }}>
              {featured.hashtags.slice(0, 3).join(" ")}
            </p>
            <div className="mt-2.5 flex items-center gap-2 overflow-hidden">
              <span
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px]"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
              >
                ♫
              </span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="marquee whitespace-nowrap text-[11px]" style={{ color: "rgba(255,255,255,0.9)" }}>
                  {featured.music.title} — {featured.music.artist} · original sound · {featured.views} views · &nbsp;
                  {featured.music.title} — {featured.music.artist} ·&nbsp;
                </p>
              </div>
            </div>
          </div>

          {/* play indicator */}
          <span className="absolute left-3 top-14 mono-tag" style={{ color: "rgba(255,255,255,0.75)" }}>
            ▶ Autoplay · {featured.duration}s
          </span>
        </div>
      </section>

      {/* ==================================================
         QUICK CHATS — Snap-style horizontal chat strip
         ================================================== */}
      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between px-4">
          <div>
            <p className="mono-tag" style={{ color: "var(--color-silver)" }}>Comms</p>
            <h2 className="serif text-[20px] italic leading-none" style={{ color: "var(--color-ink)" }}>Recent chats</h2>
          </div>
          <Link to="/messages" className="mono-tag" style={{ color: "var(--color-neon)" }}>Open →</Link>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
          {chats.map((c) => (
            <Link
              key={c.id}
              to="/messages"
              className="tap shrink-0"
              style={{ width: 168 }}
            >
              <div
                className="flex flex-col items-start gap-2 p-3"
                style={{
                  background: c.unread > 0 ? "linear-gradient(160deg, rgba(198,255,61,0.10), rgba(255,91,58,0.06))" : "var(--color-graphite)",
                  border: `1px solid ${c.unread > 0 ? "rgba(198,255,61,0.35)" : "var(--color-hair)"}`,
                  borderRadius: 14,
                }}
              >
                <div className="flex w-full items-center gap-2">
                  <div className="relative">
                    <img src={c.user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                    {c.online && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full"
                        style={{ background: "var(--color-neon)", boxShadow: "0 0 0 2px var(--color-graphite)" }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold" style={{ color: "var(--color-ink)" }}>
                      {c.user.name}
                    </p>
                    <p className="mono-tag" style={{ fontSize: 8.5, color: "var(--color-titanium)" }}>{c.timeAgo}</p>
                  </div>
                  {c.unread > 0 && (
                    <span
                      className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold"
                      style={{ background: "var(--color-ember)", color: "white" }}
                    >
                      {c.unread}
                    </span>
                  )}
                </div>
                <p className="line-clamp-2 text-[11.5px] leading-snug" style={{ color: "var(--color-silver)" }}>
                  {c.lastMessage}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================================================
         FEED — Instagram DNA
         Square media · caption · InteractionBar
         ================================================== */}
      <section className="mt-8 space-y-6">
        {posts.map((p, idx) => (
          <article key={p.id} className="rise" style={{ animationDelay: `${idx * 40}ms` }}>
            {/* post header */}
            <div className="flex items-center gap-2.5 px-4 pb-2.5">
              <div className="story-ring">
                <div style={{ background: "var(--color-obsidian)", padding: 1.5, borderRadius: 999 }}>
                  <img src={p.user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold" style={{ color: "var(--color-ink)" }}>
                  {p.user.handle}
                  {p.user.verified && <RiderMark tier="LEGEND" />}
                </p>
                <p className="mono-tag" style={{ fontSize: 8.5 }}>◎ {p.user.location} · {p.timeAgo}</p>
              </div>
              <button aria-label="More" className="tap px-2 text-lg leading-none" style={{ color: "var(--color-silver)" }}>⋯</button>
            </div>

            {/* square media */}
            <div className="relative">
              <img src={p.image} alt="" className="block aspect-square w-full object-cover" />
              {p.vehicle && (
                <div
                  className="absolute left-3 bottom-3 flex items-center gap-1.5 rounded-full px-2 py-1"
                  style={{ background: "rgba(8,9,11,0.7)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.14)" }}
                >
                  <span style={{ color: "var(--color-neon)" }}>◇</span>
                  <span className="text-[11px] font-semibold text-white">{p.vehicle.name}</span>
                  <span className="mono-num text-[10px]" style={{ color: "var(--color-neon)" }}>{p.vehicle.hp}hp</span>
                </div>
              )}
            </div>

            {/* interaction bar */}
            <div className="px-4 pt-3">
              <InteractionBar
                variant="dark"
                targetId={`post:${p.id}`}
                counts={{
                  likes: p.likes,
                  comments: p.comments,
                  views: fmt(Math.round(p.likes * 6.2)),
                  shares: Math.round(p.likes * 0.08),
                }}
              />
            </div>

            {/* caption */}
            <div className="mt-3 px-4">
              <p className="text-[13.5px] leading-snug" style={{ color: "var(--color-ink)" }}>
                <span className="font-semibold">{p.user.handle}</span>{" "}
                {p.caption}
              </p>
              <p className="mt-1 text-[12.5px]" style={{ color: "var(--color-neon)" }}>
                {p.tags.join(" ")}
              </p>
              {p.comments > 0 && (
                <button className="mt-1.5 text-[12px]" style={{ color: "var(--color-titanium)" }}>
                  View all {p.comments} comments
                </button>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* ==================================================
         REEL GRID — TikTok "For You" tail
         ================================================== */}
      <section className="mt-10 px-4">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="mono-tag" style={{ color: "var(--color-silver)" }}>Discover</p>
            <h2 className="serif text-[20px] italic leading-none" style={{ color: "var(--color-ink)" }}>More reels</h2>
          </div>
          <Link to="/search" className="mono-tag" style={{ color: "var(--color-neon)" }}>Explore →</Link>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {gridReels.map((r) => (
            <Link key={r.id} to="/" className="tap relative block overflow-hidden" style={{ aspectRatio: "9/16", borderRadius: 8 }}>
              <img src={r.poster} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.85))" }} />
              <div className="absolute inset-x-1.5 bottom-1.5 text-white">
                <div className="flex items-center gap-1">
                  <IconClaw size={11} />
                  <span className="mono-num text-[10px]">{fmt(r.likes)}</span>
                </div>
              </div>
              <span className="absolute right-1.5 top-1.5 mono-tag" style={{ background: "rgba(0,0,0,0.55)", color: "white", padding: "1px 4px", fontSize: 8 }}>
                ▶ {r.duration}s
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/* -------- helpers -------- */

function RailBtn({
  Icon,
  count,
  active,
  tint,
}: {
  Icon: React.ComponentType<{ size?: number }>;
  count: string;
  active?: boolean;
  tint?: string;
}) {
  return (
    <button className="tap flex flex-col items-center gap-1">
      <span
        className="grid h-11 w-11 place-items-center rounded-full"
        style={{
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: active ? tint : "white",
        }}
      >
        <Icon size={20} />
      </span>
      <span className="mono-num text-[10.5px] font-semibold" style={{ color: "white" }}>{count}</span>
    </button>
  );
}

function IconChip({ children }: { children: React.ReactNode; label?: string }) {
  return (
    <button
      aria-label="Capture"
      className="tap grid h-9 w-9 place-items-center rounded-full"
      style={{
        background: "linear-gradient(140deg, var(--color-neon) 0%, var(--color-neon-deep) 55%, var(--color-ember) 130%)",
        color: "var(--color-obsidian)",
        boxShadow: "0 6px 18px -6px rgba(198,255,61,0.6)",
      }}
    >
      {children}
    </button>
  );
}

function IconLens18() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
