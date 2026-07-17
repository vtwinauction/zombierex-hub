import { createFileRoute } from "@tanstack/react-router";
import { Heart, UserPlus, MessageCircle, Trophy, Wrench } from "lucide-react";
import { users } from "@/lib/mock-data";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications · ZOMBIEREX" }] }),
  component: NotificationsPage,
});

const items = [
  { id: "n1", kind: "like", user: users[1], text: "liked your night ride reel", time: "2m" },
  { id: "n2", kind: "follow", user: users[0], text: "started following you", time: "18m" },
  { id: "n3", kind: "comment", user: users[2], text: "commented: “That Akra sounds sick.”", time: "1h" },
  { id: "n4", kind: "achievement", user: users[0], text: "You earned Canyon Carver 🏆", time: "3h" },
  { id: "n5", kind: "workshop", user: users[2], text: "Valve check due at 20,000 mi", time: "1d" },
] as const;

const ICON = { like: Heart, follow: UserPlus, comment: MessageCircle, achievement: Trophy, workshop: Wrench };
const TONE: Record<string, string> = {
  like: "var(--color-heat)",
  follow: "var(--color-cool)",
  comment: "var(--color-ink)",
  achievement: "var(--color-signal-deep)",
  workshop: "var(--color-plum)",
};

function NotificationsPage() {
  return (
    <div className="pb-28">
      <header className="sticky top-0 z-30 bg-bone/70 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
          <button className="text-[12px] font-semibold text-ash">Mark all read</button>
        </div>
      </header>

      <ul className="space-y-1 px-3 pt-3">
        {items.map((n) => {
          const Icon = ICON[n.kind];
          return (
            <li key={n.id} className="flex items-center gap-3 rounded-2xl border border-hair bg-white p-3">
              <div className="relative">
                <img src={n.user.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                <span
                  className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-bone text-white"
                  style={{ background: TONE[n.kind] }}
                >
                  <Icon className="h-2.5 w-2.5" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] leading-snug">
                  <span className="font-semibold">{n.user.name}</span>{" "}
                  <span className="text-ink/80">{n.text}</span>
                </p>
                <p className="text-[11px] text-ash">{n.time} ago</p>
              </div>
              {n.kind === "follow" && (
                <button className="tap rounded-full bg-ink px-3 py-1.5 text-[11px] font-bold text-bone">Follow back</button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
