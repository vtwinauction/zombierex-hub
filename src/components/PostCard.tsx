import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, BadgeCheck, Gauge } from "lucide-react";
import { useState } from "react";
import type { Post } from "@/lib/mock-data";

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <article className="border-b border-border/60 bg-transparent">
      {/* header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <img src={post.user.avatar} alt={post.user.name} className="h-10 w-10 rounded-full border border-border object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-medium">{post.user.name}</span>
            {post.user.verified ? <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} /> : null}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="truncate">{post.user.handle}</span>
            <span>·</span>
            <span>{post.user.location}</span>
          </div>
        </div>
        <button aria-label="More" className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* media */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
        <img src={post.image} alt="" loading="lazy" className="h-full w-full object-cover" />
        {post.vehicle ? (
          <div
            className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 backdrop-blur"
          >
            <Gauge className="h-3.5 w-3.5" style={{ color: "var(--color-primary)" }} />
            <span className="font-display text-xs tracking-widest">{post.vehicle.name}</span>
            <span className="text-[11px] text-muted-foreground">· {post.vehicle.hp} HP</span>
          </div>
        ) : null}
      </div>

      {/* actions */}
      <div className="flex items-center gap-1 px-2 py-2">
        <button
          onClick={() => setLiked((v) => !v)}
          className="flex items-center gap-1.5 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted"
          style={liked ? { color: "var(--color-destructive)" } : undefined}
        >
          <Heart className={liked ? "h-6 w-6 fill-current" : "h-6 w-6"} />
          <span className="tabular-nums">{(post.likes + (liked ? 1 : 0)).toLocaleString()}</span>
        </button>
        <button className="flex items-center gap-1.5 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted">
          <MessageCircle className="h-6 w-6" />
          <span className="tabular-nums">{post.comments}</span>
        </button>
        <button className="grid h-10 w-10 place-items-center rounded-md hover:bg-muted">
          <Share2 className="h-5 w-5" />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setSaved((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-md hover:bg-muted"
          style={saved ? { color: "var(--color-primary)" } : undefined}
        >
          <Bookmark className={saved ? "h-5 w-5 fill-current" : "h-5 w-5"} />
        </button>
      </div>

      {/* caption */}
      <div className="px-4 pb-4">
        <p className="text-sm leading-relaxed">
          <span className="mr-1.5 font-medium">{post.user.handle}</span>
          {post.caption}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <span key={t} className="text-[12px]" style={{ color: "var(--color-primary)" }}>{t}</span>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">{post.timeAgo} ago</p>
      </div>
    </article>
  );
}
