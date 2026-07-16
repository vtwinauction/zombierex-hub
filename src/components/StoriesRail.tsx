import { stories, me } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export function StoriesRail() {
  return (
    <div className="scrollbar-none flex gap-3 overflow-x-auto px-4 py-3">
      <button className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
        <span className="relative grid h-16 w-16 place-items-center rounded-full border border-dashed border-border bg-surface">
          <img src={me.avatar} alt="" className="h-full w-full rounded-full object-cover opacity-70" />
          <span className="absolute -bottom-0.5 -right-0.5 grid h-6 w-6 place-items-center rounded-full border-2 border-background" style={{ background: "var(--color-primary)" }}>
            <Plus className="h-3.5 w-3.5" style={{ color: "var(--color-primary-foreground)" }} strokeWidth={3} />
          </span>
        </span>
        <span className="text-[11px] text-muted-foreground">Your story</span>
      </button>

      {stories.map((s) => (
        <button key={s.id} className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
          <span
            className="relative grid h-16 w-16 place-items-center rounded-full p-[2px]"
            style={{
              background: s.live
                ? "conic-gradient(from 180deg, oklch(0.62 0.25 27), oklch(0.86 0.28 140), oklch(0.62 0.25 27))"
                : "linear-gradient(135deg, oklch(0.86 0.28 140), oklch(0.4 0.15 150))",
            }}
          >
            <img src={s.user.avatar} alt={s.user.name} className="h-full w-full rounded-full border-2 border-background object-cover" />
            {s.live ? (
              <span
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-sm px-1.5 py-0.5 font-display text-[9px] tracking-widest"
                style={{ background: "var(--color-destructive)", color: "var(--color-destructive-foreground)" }}
              >
                LIVE
              </span>
            ) : null}
          </span>
          <span className="w-full truncate text-center text-[11px] text-muted-foreground">{s.user.name.split(" ")[0]}</span>
        </button>
      ))}
    </div>
  );
}
