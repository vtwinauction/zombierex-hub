import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { events } from "@/lib/mock-data";
import { MapPin, Users2, Clock, ArrowUpRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Rides & Events — ZOMBIEREX" },
      { name: "description", content: "Find and join rides, meets, rallies and races near you." },
    ],
  }),
  component: EventsPage,
});

const filters = ["All", "Rides", "Meets", "Rallies", "Races"];

function EventsPage() {
  const [active, setActive] = useState("All");

  return (
    <>
      <TopBar title="Rides" subtitle="Upcoming · Nearby" />

      {/* Filter pills */}
      <div className="scrollbar-none flex gap-2 overflow-x-auto px-5 py-2">
        {filters.map((f) => {
          const on = f === active;
          return (
            <button
              key={f}
              onClick={() => setActive(f)}
              className="shrink-0 rounded-full border px-4 py-2 font-display text-[13px] transition-colors"
              style={on
                ? { background: "var(--color-foreground)", color: "var(--color-background)", borderColor: "var(--color-foreground)" }
                : { borderColor: "var(--color-border)", color: "var(--color-muted-foreground)", background: "var(--color-card)" }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="relative px-5 pt-4">
        <span className="absolute left-[42px] top-6 bottom-4 w-px bg-border" />

        <div className="flex flex-col gap-5">
          {events.map((e, i) => (
            <article key={e.id} className="relative pl-12">
              {/* Dot */}
              <span
                className="absolute left-[38px] top-3 grid h-3 w-3 -translate-x-1/2 place-items-center rounded-full ring-4 ring-background"
                style={{ background: i === 0 ? "var(--color-primary)" : "var(--color-foreground)" }}
              />

              <p className="mb-1.5 text-mono-caps text-muted-foreground">{e.date} · {e.time}</p>

              <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-soft)]">
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <img src={e.cover} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-mono-caps backdrop-blur">
                    {e.kind}
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-foreground/85 px-2.5 py-1 text-mono-caps text-background backdrop-blur">
                    {e.distance}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-[20px] leading-tight tracking-tight">{e.title}</h3>
                      <p className="mt-1 text-[13px] text-muted-foreground">by {e.club}</p>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{e.location}</span>
                    <span className="inline-flex items-center gap-1.5"><Users2 className="h-3.5 w-3.5" />{e.attending} going</span>
                    <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{e.time}</span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      className="flex-1 rounded-full py-2.5 font-display text-[13px]"
                      style={{ background: "var(--color-foreground)", color: "var(--color-background)" }}
                    >
                      Join ride
                    </button>
                    <button className="rounded-full border border-border px-5 py-2.5 font-display text-[13px]">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
