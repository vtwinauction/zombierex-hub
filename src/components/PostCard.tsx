import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, BadgeCheck, Gauge, Eye, Flame, ThumbsUp, Zap } from "lucide-react";
import { useRef, useState } from "react";
import type { Post } from "@/lib/mock-data";

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);
  const lastTap = useRef(0);

  const views = Math.round(post.likes * 8.4).toLocaleString();

  const reactions = [
    { key: "fire", icon: Flame, color: "var(--color-primary)" },
    { key: "up", icon: ThumbsUp, color: "var(--color-foreground)" },
    { key: "zap", icon: Zap, color: "#f59e0b" },
    { key: "love", icon: Heart, color: "var(--color-destructive)" },
  ];

  const triggerLike = () => {
    setLiked(true);
    setReaction((r) => r ?? "love");
    setBurst((b) => b + 1);
  };

  const onMediaTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 320) triggerLike();
    lastTap.current = now;
  };

  return (
    <article className="rex-rise relative mx-4 mb-5 overflow-hidden rounded-[28px] border border-border bg-card shadow-[var(--shadow-soft)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <img src={post.user.avatar} alt={post.user.name} className="h-11 w-11 rounded-2xl object-cover ring-1 ring-border" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[14px] font-semibold leading-none">{post.user.name}</span>
            {post.user.verified ? <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} /> : null}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="truncate">{post.user.handle}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span>{post.user.location}</span>
          </div>
        </div>
        <button className="tap-press rounded-full bg-foreground px-4 py-2 font-display text-[11px] text-background">
          Follow
        </button>
        <button aria-label="More" className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Media — edge to edge inside card */}
      <div className="relative mx-2 overflow-hidden rounded-[20px]">
        <div className="relative aspect-[4/5] w-full bg-surface" onClick={onMediaTap}>
          <img src={post.image} alt="" loading="lazy" className="h-full w-full object-cover" />

          {/* Double-tap burst */}
          {burst > 0 ? (
            <Heart
              key={burst}
              className="pointer-events-none rex-heart-burst absolute left-1/2 top-1/2 h-24 w-24 fill-current drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
              style={{ color: "var(--color-destructive)" }}
            />
          ) : null}

          {/* Top-left views chip */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 backdrop-blur">
            <Eye className="h-3 w-3" />
            <span className="text-mono-caps">{views}</span>
          </div>

          {/* Top-right time chip */}
          <div className="absolute right-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-mono-caps backdrop-blur">
            {post.timeAgo} ago
          </div>

          {/* Vehicle spec panel */}
          {post.vehicle ? (
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5 rounded-2xl border border-white/15 bg-black/55 px-3 py-2 backdrop-blur-md">
              <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>
                <Gauge className="h-4 w-4" strokeWidth={2.4} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[13px] leading-none tracking-tight text-white">{post.vehicle.name}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/70">{post.vehicle.year} · {post.vehicle.type} · {post.vehicle.hp} HP</p>
              </div>
              <button className="tap-press rounded-full bg-white/95 px-3 py-1.5 font-display text-[11px] text-foreground">Build</button>
            </div>
          ) : null}
        </div>
      </div>


      {/* Adaptive action bar */}
      <div className="relative px-3 pt-3">
        {showReactions ? (
          <div className="absolute -top-9 left-4 z-10 flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1.5 shadow-[var(--shadow-lift)] animate-scale-in">
            {reactions.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.key}
                  onClick={() => { setReaction(r.key); setLiked(true); setShowReactions(false); }}
                  className="grid h-9 w-9 place-items-center rounded-full transition-transform hover:scale-110"
                  style={{ color: r.color }}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="flex items-center gap-1 rounded-2xl bg-muted/50 p-1">
          <ActionButton
            active={liked}
            onClick={() => { if (liked) { setLiked(false); setReaction(null); } else { triggerLike(); } }}
            onLongPress={() => setShowReactions(true)}
            label={(post.likes + (liked ? 1 : 0)).toLocaleString()}
            activeColor="var(--color-destructive)"
          >
            {reaction ? (() => {
              const R = reactions.find((r) => r.key === reaction);
              if (!R) return <Heart className="h-[18px] w-[18px] fill-current" />;
              const Ic = R.icon;
              return <Ic className="h-[18px] w-[18px] fill-current" style={{ color: R.color }} />;
            })() : <Heart className={liked ? "h-[18px] w-[18px] fill-current" : "h-[18px] w-[18px]"} />}
          </ActionButton>

          <ActionButton label={post.comments.toString()}>
            <MessageCircle className="h-[18px] w-[18px]" />
          </ActionButton>

          <ActionButton label="Share">
            <Send className="h-[18px] w-[18px]" />
          </ActionButton>

          <div className="ml-auto" />

          <button
            onClick={() => setSaved((v) => !v)}
            aria-label="Save"
            className="grid h-10 w-10 place-items-center rounded-xl transition-colors hover:bg-background"
            style={saved ? { color: "var(--color-primary)" } : undefined}
          >
            <Bookmark className={saved ? "h-[18px] w-[18px] fill-current" : "h-[18px] w-[18px]"} />
          </button>
        </div>
      </div>

      {/* Caption + tags */}
      <div className="px-5 pb-5 pt-3">
        <p className="text-[13.5px] leading-relaxed">
          <span className="mr-1.5 font-semibold">{post.user.handle}</span>
          {post.caption}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <span key={t} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium" style={{ color: "var(--color-primary)" }}>{t}</span>
          ))}
        </div>
        <button className="mt-3 text-[12px] text-muted-foreground">View all {post.comments} comments</button>
      </div>
    </article>
  );
}

function ActionButton({
  children,
  label,
  active,
  activeColor,
  onClick,
  onLongPress,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  activeColor?: string;
  onClick?: () => void;
  onLongPress?: () => void;
}) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const start = () => {
    if (!onLongPress) return;
    timer = setTimeout(() => onLongPress(), 450);
  };
  const end = () => { if (timer) clearTimeout(timer); };

  return (
    <button
      onClick={onClick}
      onMouseDown={start}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchStart={start}
      onTouchEnd={end}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium transition-all hover:bg-background active:scale-[0.97]"
      style={active ? { color: activeColor } : undefined}
    >
      {children}
      <span className="tabular-nums">{label}</span>
    </button>
  );
}
