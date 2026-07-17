import { createFileRoute } from "@tanstack/react-router";
import { MapPin, CalendarDays, Users2, Route as RouteIcon } from "lucide-react";
import { events } from "@/lib/mock-data";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events · ZOMBIEREX" }] }),
  component: EventsPage,
});

const TABS = ["Upcoming", "Nearby", "Rallies", "Track"] as const;

function EventsPage() {
  return (
    <div className="pb-28">
      <header className="sticky top-0 z-30 bg-bone/70 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <button className="tap rounded-full bg-ink px-4 py-2 text-[12px] font-semibold text-bone">+ Host</button>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
          {TABS.map((t, i) => (
            <button key={t} className={`tap shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold ${i === 0 ? "bg-ink text-bone" : "border border-hair bg-white"}`}>{t}</button>
          ))}
        </div>
      </header>

      <div className="space-y-4 px-4 pt-4">
        {events.map((e) => (
          <article key={e.id} className="overflow-hidden rounded-3xl border border-hair bg-white">
            <div className="relative h-40">
              <img src={e.cover} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 gradient-ink" />
              <span className="chip-dark absolute left-3 top-3">{e.kind}</span>
              <div className="absolute inset-x-3 bottom-3 flex items-end justify-between text-white">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">{e.date} · {e.time}</p>
                  <h3 className="mt-0.5 text-xl font-semibold leading-tight">{e.title}</h3>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <MetaItem icon={<MapPin className="h-3.5 w-3.5" />} label={e.location} />
              <MetaItem icon={<RouteIcon className="h-3.5 w-3.5" />} label={e.distance} />
              <MetaItem icon={<Users2 className="h-3.5 w-3.5" />} label={`${e.attending}`} />
              <button className="tap ml-auto rounded-full bg-ink px-4 py-2 text-[12px] font-semibold text-bone">
                Join ride
              </button>
            </div>
          </article>
        ))}
        <div className="rounded-3xl border border-dashed border-hair p-6 text-center">
          <CalendarDays className="mx-auto h-6 w-6 text-ash" />
          <p className="mt-2 text-sm font-medium">Nothing else on your radar</p>
          <p className="text-[12px] text-ash">Follow more crews to see their meets & rallies.</p>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-ash">
      {icon}
      {label}
    </span>
  );
}
