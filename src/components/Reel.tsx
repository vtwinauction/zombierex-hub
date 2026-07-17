import { useRef, useState } from "react";
import type { Reel as ReelType } from "@/lib/mock-data";
import {
  Heart, MessageCircle, Send, Bookmark, Eye, MapPin, Music2,
  ChevronDown, ChevronUp, Volume2, VolumeX, Tag, Bike, Car,
} from "lucide-react";

export function Reel({ reel }: { reel: ReelType }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [followed, setFollowed] = useState(!!reel.followed);
  const [muted, setMuted] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [burst, setBurst] = useState(0);
  const lastTap = useRef(0);

  const handleMediaTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      setLiked(true);
      setBurst((b) => b + 1);
    }
    lastTap.current = now;
  };

  const likeCount = reel.likes + (liked ? 1 : 0);
  const VehicleIcon = reel.vehicle?.type === "Car" ? Car : Bike;

  return (
    <section className="snap-item relative h-[100svh] w-full overflow-hidden bg-ink">
      {/* Media */}
      <button
        onClick={handleMediaTap}
        className="absolute inset-0 h-full w-full"
        aria-label="Play video"
      >
        <img
          src={reel.poster}
          alt=""
          className="ken-burns h-full w-full object-cover"
          draggable={false}
        />
      </button>

      {/* Vignettes */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]" style={{
        background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%)",
      }} />

      {/* Top bar: progress + mute */}
      <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center gap-2">
        <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
          <div key={burst /* replay */} className="progress-bar h-full origin-left bg-white" />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
          className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Heart burst */}
      {burst > 0 && (
        <Heart
          key={burst}
          className="heart-burst pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 fill-white text-white drop-shadow-[0_10px_40px_rgba(255,255,255,0.35)]"
        />
      )}

      {/* Right action rail */}
      <div className="absolute bottom-28 right-3 flex flex-col items-center gap-4 text-white">
        <ActionBtn
          icon={<Heart className={`h-7 w-7 ${liked ? "fill-current" : ""}`} />}
          label={fmt(likeCount)}
          onClick={() => { setLiked((v) => !v); if (!liked) setBurst((b) => b + 1); }}
          activeTone={liked ? "heat" : undefined}
        />
        <ActionBtn icon={<MessageCircle className="h-7 w-7" />} label={fmt(reel.comments)} />
        <ActionBtn icon={<Send className="h-7 w-7 -rotate-12" />} label={fmt(reel.shares)} />
        <ActionBtn
          icon={<Bookmark className={`h-7 w-7 ${saved ? "fill-current" : ""}`} />}
          label={saved ? "Saved" : "Save"}
          onClick={() => setSaved((v) => !v)}
          activeTone={saved ? "signal" : undefined}
        />
        <div className="mt-1 flex flex-col items-center gap-1 text-white/80">
          <Eye className="h-5 w-5" />
          <span className="text-[10px] font-semibold tracking-wide">{reel.views}</span>
        </div>

        {/* Spinning music disc */}
        <div className="relative mt-2 h-11 w-11 overflow-hidden rounded-full border-2 border-white/70">
          <img src={reel.user.avatar} alt="" className="h-full w-full animate-spin object-cover" style={{ animationDuration: "6s" }} />
          <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/20" />
        </div>
      </div>

      {/* Bottom info block */}
      <div className="absolute inset-x-0 bottom-24 z-10 space-y-3 px-4 text-white">
        {/* Creator row */}
        <div className="flex items-center gap-3">
          <div className="story-ring">
            <div className="rounded-full bg-ink p-[2px]">
              <img src={reel.user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              {reel.user.name}
              {reel.user.verified && (
                <span
                  className="grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold text-ink"
                  style={{ background: "var(--color-signal)" }}
                >✓</span>
              )}
            </p>
            <p className="text-[11px] text-white/70">{reel.user.handle}</p>
          </div>
          <button
            onClick={() => setFollowed((f) => !f)}
            className={`tap ml-auto rounded-full px-4 py-1.5 text-xs font-bold ${
              followed
                ? "bg-white/15 text-white backdrop-blur-md"
                : "bg-white text-ink"
            }`}
          >
            {followed ? "Following" : "Follow"}
          </button>
        </div>

        {/* Caption */}
        <div>
          <p className={`text-[13.5px] leading-snug ${expanded ? "" : "line-clamp-2"}`}>
            {reel.caption}
          </p>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-white/80"
          >
            {expanded ? "Show less" : "More"}
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {reel.hashtags.slice(0, 3).map((h) => (
            <span key={h} className="rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              {h}
            </span>
          ))}
          {reel.location && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              <MapPin className="h-3 w-3" /> {reel.location}
            </span>
          )}
        </div>

        {/* Tagged vehicle */}
        {reel.vehicle && (
          <div className="glass-dark flex items-center gap-3 rounded-2xl px-3 py-2.5">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl"
              style={{ background: "color-mix(in oklab, var(--color-signal) 30%, transparent)" }}
            >
              <VehicleIcon className="h-4.5 w-4.5 text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold">{reel.vehicle.name}</p>
              <p className="text-[10.5px] uppercase tracking-wide text-white/70">
                {reel.vehicle.year} · {reel.vehicle.hp} HP · {reel.vehicle.mods.length} mods
              </p>
            </div>
            <button className="tap rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">View</button>
          </div>
        )}

        {/* Tagged product */}
        {reel.taggedProduct && (
          <div className="glass-dark flex items-center gap-2 rounded-2xl px-3 py-2">
            <Tag className="h-4 w-4" style={{ color: "var(--color-signal)" }} />
            <p className="flex-1 truncate text-[12px] font-medium">
              {reel.taggedProduct.name}
            </p>
            <span className="text-[12px] font-bold text-white">{reel.taggedProduct.price}</span>
            <button className="tap rounded-full bg-white px-3 py-1 text-[11px] font-bold text-ink">Shop</button>
          </div>
        )}

        {/* Music */}
        <div className="flex items-center gap-2 pt-1">
          <Music2 className="h-3.5 w-3.5" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="marquee inline-flex whitespace-nowrap text-[11px] font-medium text-white/85">
              <span className="pr-6">{reel.music.title} — {reel.music.artist}</span>
              <span className="pr-6">{reel.music.title} — {reel.music.artist}</span>
            </div>
          </div>
          <Waveform />
        </div>
      </div>
    </section>
  );
}

function ActionBtn({
  icon, label, onClick, activeTone,
}: {
  icon: React.ReactNode; label: string; onClick?: () => void; activeTone?: "heat" | "signal";
}) {
  const color =
    activeTone === "heat" ? { color: "var(--color-heat)" }
    : activeTone === "signal" ? { color: "var(--color-signal)" }
    : undefined;
  return (
    <button onClick={onClick} className="tap flex flex-col items-center gap-1">
      <span
        className="grid h-11 w-11 place-items-center rounded-full bg-black/25 backdrop-blur-md"
        style={color}
      >
        {icon}
      </span>
      <span className="text-[10px] font-semibold text-white/90">{label}</span>
    </button>
  );
}

function Waveform() {
  return (
    <div className="flex h-4 items-end gap-[2px]">
      <span className="bar-1 w-[2px] rounded-full bg-white/80" />
      <span className="bar-2 w-[2px] rounded-full bg-white/80" />
      <span className="bar-3 w-[2px] rounded-full bg-white/80" />
      <span className="bar-4 w-[2px] rounded-full bg-white/80" />
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}
