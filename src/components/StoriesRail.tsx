import { storiesV2, type Story } from "@/lib/mock-data";
import { Plus, Radio, Route, BarChart3, MessageCircleQuestion, CalendarDays, Play, Image as ImageIcon } from "lucide-react";
import type { ComponentType } from "react";

const KIND_ICON: Record<Story["kind"], ComponentType<{ className?: string }>> = {
  photo: ImageIcon,
  video: Play,
  poll: BarChart3,
  question: MessageCircleQuestion,
  ride: Route,
  event: CalendarDays,
};

export function StoriesRail() {
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 py-3">
      {storiesV2.map((s, i) => {
        const isMe = i === 0;
        return (
          <button key={s.id} className="tap group flex w-[74px] flex-col items-center gap-1.5">
            <div className="relative">
              <div className={s.seen ? "story-ring-seen" : "story-ring"}>
                <div className="rounded-full bg-bone p-[3px]">
                  <div className="relative h-[62px] w-[62px] overflow-hidden rounded-full">
                    <img src={s.cover} alt="" className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>

              {isMe ? (
                <span className="absolute -bottom-0.5 -right-0.5 grid h-6 w-6 place-items-center rounded-full border-2 border-bone bg-ink text-bone">
                  <Plus className="h-3.5 w-3.5" />
                </span>
              ) : s.live ? (
                <span
                  className="mono-caps absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-0.5 text-[8px] font-bold text-bone"
                  style={{ background: "var(--color-heat)" }}
                >
                  <span className="inline-flex items-center gap-1">
                    <Radio className="h-2.5 w-2.5" /> LIVE
                  </span>
                </span>
              ) : (
                <StoryKindBadge kind={s.kind} />
              )}
            </div>
            <span className="line-clamp-1 max-w-[74px] text-[11px] font-medium text-ink/80">
              {isMe ? "You" : s.user.name.split(" ")[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function StoryKindBadge({ kind }: { kind: Story["kind"] }) {
  const Icon = KIND_ICON[kind];
  const tone =
    kind === "video" ? "bg-ink text-bone"
    : kind === "ride" ? "text-bone" // colored via style
    : kind === "event" ? "text-ink"
    : kind === "poll" ? "text-ink"
    : "text-ink";
  const styleOverride =
    kind === "ride" ? { background: "var(--color-cool)" }
    : kind === "event" ? { background: "var(--color-signal)" }
    : kind === "poll" ? { background: "var(--color-signal)" }
    : kind === "question" ? { background: "var(--color-plum)", color: "white" }
    : undefined;
  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-bone ${tone}`}
      style={styleOverride}
    >
      <Icon className="h-2.5 w-2.5" />
    </span>
  );
}
