import { type ComponentType } from "react";
import {
  IconClaw,
  IconVisor,
  IconMechClaw,
  IconBoneMark,
  IconLens,
} from "./icons/RexIcons";
import { useInteractionState } from "@/hooks/useInteractionState";

/**
 * ZOMBIEREX Interaction Bar
 * ------------------------------------------------------------------
 * Floating control cluster beneath any piece of media (photo/reel).
 * All actions are optimistic:
 *   - counters + toggle state update instantly
 *   - the mutation is enqueued in a persistent offline-friendly queue
 *   - a status rail exposes syncing / queued-offline / failed states
 *     with a one-tap retry when something couldn't be delivered.
 */

export type InteractionCounts = {
  likes: number;
  comments: number;
  views: number | string;
  shares: number;
};

type ActionKey = "like" | "comment" | "views" | "share" | "save";

const ACTIONS: {
  key: ActionKey;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}[] = [
  { key: "like",    label: "Like",     icon: IconClaw },
  { key: "comment", label: "Comment",  icon: IconVisor },
  { key: "views",   label: "Views",    icon: IconLens },
  { key: "share",   label: "Share",    icon: IconMechClaw },
  { key: "save",    label: "Save",     icon: IconBoneMark },
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

  const isDark = variant === "dark";

  const surface: React.CSSProperties = isDark
    ? {
        background: "rgba(8,9,11,0.72)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 20px 50px -18px rgba(0,0,0,0.75), 0 1px 0 rgba(255,255,255,0.06) inset",
        color: "var(--color-ink)",
      }
    : {
        background: "rgba(255,255,255,0.82)",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow:
          "0 18px 40px -20px rgba(0,0,0,0.20), 0 1px 0 rgba(255,255,255,0.9) inset",
        color: "var(--color-obsidian)",
      };

  const idleColor = isDark ? "rgba(230,232,236,0.62)" : "rgba(8,9,11,0.55)";
  const dividerColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const hairlineColor = isDark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.4)";

  const values: Record<ActionKey, string> = {
    like: fmt(likes),
    comment: fmt(counts.comments),
    views: typeof counts.views === "string" ? counts.views : fmt(counts.views),
    share: fmt(shares),
    save: saved ? "SAVED" : "SAVE",
  };

  const queuedCount = pending.length;
  const status = getStatus({ online, hasFailed, isSyncing, queuedCount });

  return (
    <div
      className="backdrop-blur-2xl relative"
      style={{
        ...surface,
        borderRadius: 16,
        padding: "10px 6px",
      }}
    >
      {/* precision hairline reflection */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${hairlineColor}, transparent)`,
        }}
      />

      <div className="flex items-center justify-between">
        {ACTIONS.map(({ key, label, icon: Icon }, idx) => {
          const active =
            (key === "like" && liked) || (key === "save" && saved);
          const accent =
            (key === "like" && liked) || (key === "save" && saved);
          const disabled = key === "comment" || key === "views";
          const onClick = () => {
            if (key === "like") toggleLike();
            else if (key === "save") toggleSave();
            else if (key === "share") share();
          };
          return (
            <Fragment key={key}>
              <button
                onClick={disabled ? undefined : onClick}
                aria-label={label}
                aria-pressed={active}
                className="tap group relative flex flex-1 flex-col items-center justify-center gap-1.5 py-1.5"
              >
                <span
                  className="transition-transform duration-200 ease-out group-active:scale-90"
                  style={{ color: accent ? "var(--color-neon)" : idleColor, lineHeight: 0 }}
                >
                  <Icon size={18} />
                </span>
                <span
                  className="mono-num text-[10px] tabular-nums leading-none"
                  style={{
                    color: accent ? "var(--color-neon)" : idleColor,
                    letterSpacing: "0.02em",
                    fontWeight: 500,
                    fontStyle: key === "save" && !accent ? "normal" : accent ? "italic" : "normal",
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
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
