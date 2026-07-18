import { Fragment, useState, type ComponentType } from "react";
import { HeartIcon, CommentIcon, EyeIcon, ShareIcon, BookmarkIcon } from "./icons/SocialIcons";
import { useInteractionState } from "@/hooks/useInteractionState";
import { CommentsSheet } from "./CommentsSheet";

export type InteractionCounts = {
  likes: number;
  comments: number;
  views: number | string;
  shares: number;
};

type ActionKey = "like" | "comment" | "views" | "share" | "save";

type IconCmp = ComponentType<{ size?: number; active?: boolean; className?: string }>;

const ACTIONS: { key: ActionKey; label: string; icon: IconCmp }[] = [
  { key: "like",    label: "Like",     icon: HeartIcon },
  { key: "comment", label: "Comment",  icon: CommentIcon },
  { key: "views",   label: "Views",    icon: EyeIcon },
  { key: "share",   label: "Share",    icon: ShareIcon },
  { key: "save",    label: "Save",     icon: BookmarkIcon },
];



export function InteractionBar({
  counts,
  variant = "dark",
  targetId,
}: {
  counts: InteractionCounts;
  variant?: "dark" | "light";
  /** Stable id for the media this bar controls; used for queue keying. */
  targetId?: string;
}) {
  const id = targetId ?? "anon";
  const {
    liked,
    saved,
    likes,
    shares,
    pending,
    hasFailed,
    isSyncing,
    online,
    toggleLike,
    toggleSave,
    share,
    retry,
  } = useInteractionState(id, { likes: counts.likes, shares: counts.shares });

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentDelta, setCommentDelta] = useState(0);

  const isDark = variant === "dark";


  const surface: React.CSSProperties = {
    background: "transparent",
    border: "none",
    boxShadow: "none",
    color: isDark ? "var(--color-ink)" : "var(--color-obsidian)",
  };

  void isDark;
  const dividerColor = "transparent";


  const values: Record<ActionKey, string> = {
    like: fmt(likes),
    comment: fmt(counts.comments + commentDelta),
    views: typeof counts.views === "string" ? counts.views : fmt(counts.views),
    share: fmt(shares),
    save: saved ? "SAVED" : "SAVE",
  };


  const queuedCount = pending.length;
  const status = getStatus({ online, hasFailed, isSyncing, queuedCount });

  return (
    <div
      className="relative"
      style={{
        ...surface,
        padding: "6px 4px",
      }}
    >


      <div className="flex items-center justify-between">
        {ACTIONS.map(({ key, label, icon: Icon }, idx) => {
          const active =
            (key === "like" && liked) || (key === "save" && saved);
          const disabled = key === "views";
          const onClick = () => {
            if (key === "like") toggleLike();
            else if (key === "save") toggleSave();
            else if (key === "share") share();
            else if (key === "comment") setCommentsOpen(true);
          };

          const iconColor = active
            ? "var(--color-neon)"
            : isDark
              ? "rgba(230,232,236,0.72)"
              : "rgba(20,22,26,0.68)";

          return (
            <Fragment key={key}>
              <button
                onClick={disabled ? undefined : onClick}
                aria-label={label}
                aria-pressed={active}
                className="tap group relative flex flex-1 flex-col items-center justify-center gap-1.5 py-1.5"
              >
                <span
                  key={active ? "on" : "off"}
                  className={`transition-transform duration-200 ease-out group-active:scale-90 ${active ? "ibar-pop" : ""}`}
                  style={{
                    color: iconColor,
                    lineHeight: 0,
                    filter: active
                      ? "drop-shadow(0 0 8px rgba(198,255,61,0.85)) drop-shadow(0 0 18px rgba(126,224,28,0.5))"
                      : "none",
                  }}
                >
                  <Icon size={22} strokeWidth={2} fill={active ? "currentColor" : "none"} />
                </span>

                <span
                  className="mono-num text-[10px] tabular-nums leading-none"
                  style={{
                    color: active ? "var(--color-neon)" : iconColor,
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                    textShadow: active ? "0 0 8px rgba(198,255,61,0.55)" : "none",
                  }}
                >
                  {values[key]}
                </span>
              </button>
              {idx < ACTIONS.length - 1 && (
                <span
                  aria-hidden
                  className="h-6 w-px shrink-0"
                  style={{ background: dividerColor }}
                />
              )}
            </Fragment>
          );
        })}
      </div>


      {/* ── Sync status rail ── */}
      {status && (
        <div
          className="mt-2 flex items-center justify-between gap-2 px-2 pt-2"
          style={{ borderTop: `1px solid ${dividerColor}` }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
              style={{
                background: status.dot,
                boxShadow: status.tone === "sync" ? `0 0 6px ${status.dot}` : undefined,
                animation: status.tone === "sync" ? "engine-pulse 1.4s ease-in-out infinite" : undefined,
              }}
            />
            <span
              className="mono-tag truncate"
              style={{ color: status.color, fontSize: 8.5, letterSpacing: "0.18em" }}
            >
              {status.text}
            </span>
          </div>
          {status.tone === "fail" && (
            <button
              onClick={retry}
              className="tap mono-tag px-2 py-1"
              style={{
                borderRadius: 6,
                fontSize: 8.5,
                letterSpacing: "0.18em",
                color: "var(--color-neon)",
                border: "1px solid rgba(198,255,61,0.45)",
                background: "rgba(198,255,61,0.08)",
              }}
            >
              RETRY
            </button>
          )}
        </div>
      )}

      <CommentsSheet
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        targetId={id}
        onSubmitted={() => setCommentDelta((n) => n + 1)}
      />

    </div>
  );
}



function getStatus({
  online,
  hasFailed,
  isSyncing,
  queuedCount,
}: {
  online: boolean;
  hasFailed: boolean;
  isSyncing: boolean;
  queuedCount: number;
}):
  | { tone: "off" | "sync" | "fail"; text: string; color: string; dot: string }
  | null {
  if (hasFailed) {
    return {
      tone: "fail",
      text: `${queuedCount} ACTION${queuedCount === 1 ? "" : "S"} FAILED · TAP TO RETRY`,
      color: "#ff6b6b",
      dot: "#ff6b6b",
    };
  }
  if (!online && queuedCount > 0) {
    return {
      tone: "off",
      text: `OFFLINE · ${queuedCount} QUEUED · WILL SYNC WHEN BACK ONLINE`,
      color: "var(--color-silver)",
      dot: "var(--color-titanium)",
    };
  }
  if (!online) {
    return {
      tone: "off",
      text: "OFFLINE · ACTIONS WILL SYNC LATER",
      color: "var(--color-silver)",
      dot: "var(--color-titanium)",
    };
  }
  if (isSyncing || queuedCount > 0) {
    return {
      tone: "sync",
      text: `SYNCING ${queuedCount} SIGNAL${queuedCount === 1 ? "" : "S"}`,
      color: "var(--color-neon)",
      dot: "var(--color-neon)",
    };
  }
  return null;
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (n >= 10_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString("en-US");
}

