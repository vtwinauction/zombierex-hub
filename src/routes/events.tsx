import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { events } from "@/lib/mock-data";
import { MapPin, Users, Clock } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — ZOMBIEREX" },
      { name: "description", content: "Find and join rides, car meets, rallies and races near you." },
    ],
  }),
  component: EventsPage,
});

const filters = ["All", "Rides", "Meets", "Rallies", "Races", "Nearby"];

function EventsPage() {
  const [active, setActive] = useState("All");
  return (
    <>
      <TopBar title="Events" subtitle="Rides · Meets · Rallies · Races" />

      <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 py-3">
        {filters.map((f) => {
          const on = active === f;
          return (
            <button
              key={f}
              onClick={() => setActive(f)}
              className="shrink-0 rounded-full border px-4 py-1.5 font-display text-xs tracking-[0.18em] transition-colors"
              style={
                on
                  ? { background: "var(--color-primary)", color: "var(--color-primary-foreground)", borderColor: "var(--color-primary)" }
                  : { borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }
              }
            >
              {f.toUpperCase()}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 px-4 pb-6">
        {events.map((e) => (
          <article key={e.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img src={e.cover} alt="" loading="lazy" className="h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, oklch(0.09 0.005 150 / 0.85))" }} />
              <span
                className="absolute left-3 top-3 rounded-full px-2.5 py-1 font-display text-[10px] tracking-widest"
                style={{ background: "var(--color-destructive)", color: "var(--color-destructive-foreground)" }}
              >
                {e.kind.toUpperCase()}
              </span>
              <div className="absolute inset-x-3 bottom-3">
                <p className="font-display text-xs tracking-[0.2em]" style={{ color: "var(--color-primary)" }}>{e.date} · {e.time}</p>
                <h3 className="mt-0.5 font-display text-xl leading-tight tracking-wide">{e.title}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4 px-4 py-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{e.location}</span>
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{e.attending}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{e.distance}</span>
            </div>

            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs"><span className="text-muted-foreground">by </span><span className="font-medium">{e.club}</span></p>
              <div className="flex gap-2">
                <button className="rounded-md border border-border px-3 py-1.5 text-xs">Details</button>
                <button
                  className="rounded-md px-4 py-1.5 font-display text-xs tracking-widest"
                  style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
                >
                  JOIN
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
