import { useState, type ComponentType } from "react";
import {
  IconClaw,
  IconVisor,
  IconMechClaw,
  IconBoneMark,
  IconLens,
} from "./icons/RexIcons";

/**
 * ZOMBIEREX Interaction Bar
 * ------------------------------------------------------------------
 * A dedicated, floating "control cluster" that sits directly beneath
 * any piece of media (photo or reel poster). Replaces default social
 * icons with our fossil / mechanical / CNC-inspired glyph family.
 *
 * Visual language:
 *   - Obsidian glass surface with hairline strong border
 *   - Neon "signal" accent for the primary Like state
 *   - Machined monospace counters, precisely aligned in a grid
 *   - Subtle engine-pulse micro-animation on the primary action
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
}: {
  counts: InteractionCounts;
  variant?: "dark" | "light";
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDark = variant === "dark";

  const surface: React.CSSProperties = isDark
    ? {
        background:
          "linear-gradient(180deg, rgba(20,22,26,0.92) 0%, rgba(8,9,11,0.94) 100%)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow:
          "0 20px 40px -20px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.05) inset",
        color: "var(--color-ink)",
      }
    : {
        background: "rgba(255,255,255,0.92)",
        border: "1px solid var(--color-hair-strong)",
        boxShadow:
          "0 18px 38px -20px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.9) inset",
        color: "var(--color-obsidian)",
      };

  const mutedColor = isDark ? "var(--color-silver)" : "var(--color-titanium)";

  const values: Record<ActionKey, string> = {
    like: fmt(counts.likes + (liked ? 1 : 0)),
    comment: fmt(counts.comments),
    views: typeof counts.views === "string" ? counts.views : fmt(counts.views),
    share: fmt(counts.shares),
    save: saved ? "Saved" : "Save",
  };

  return (
    <div
      className="backdrop-blur-xl"
      style={{
        ...surface,
        borderRadius: 14,
        padding: "10px 8px",
      }}
    >
      <div className="grid grid-cols-5">
        {ACTIONS.map(({ key, label, icon: Icon }) => {
          const active =
            (key === "like" && liked) || (key === "save" && saved);
          const onClick = () => {
            if (key === "like") setLiked((v) => !v);
            if (key === "save") setSaved((v) => !v);
          };
          const accent = key === "like" && liked;
          return (
            <button
              key={key}
              onClick={onClick}
              aria-label={label}
              aria-pressed={active}
              className="tap group relative flex flex-col items-center justify-center gap-1 py-1"
            >
              <span
                className="grid h-9 w-9 place-items-center transition-transform group-active:scale-90"
                style={{
                  borderRadius: 999,
                  background: accent
                    ? "radial-gradient(circle at 30% 30%, rgba(198,255,61,0.35), rgba(198,255,61,0.05))"
                    : active
                    ? isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.05)"
                    : "transparent",
                  color: accent
                    ? "var(--color-neon)"
                    : active
                    ? isDark ? "var(--color-ink)" : "var(--color-obsidian)"
                    : isDark ? "var(--color-ink)" : "var(--color-obsidian)",
                  border: accent
                    ? "1px solid rgba(198,255,61,0.45)"
                    : "1px solid transparent",
                }}
              >
                <Icon size={17} />
                {accent && (
                  <span className="engine-pulse absolute inset-0 rounded-full" />
                )}
              </span>
              <span
                className="mono-num text-[11px] font-semibold tabular-nums leading-none"
                style={{ color: accent ? "var(--color-neon)" : undefined }}
              >
                {values[key]}
              </span>
              <span
                className="mono-tag leading-none"
                style={{ color: mutedColor, fontSize: 8.5, letterSpacing: "0.16em" }}
              >
                {label.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
