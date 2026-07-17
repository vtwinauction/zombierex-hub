import { createFileRoute } from "@tanstack/react-router";
import { StatusBar } from "@/components/StatusBar";
import { events } from "@/lib/mock-data";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Ops · ZOMBIEREX" }, { name: "description", content: "Meets, rallies, and track days scheduled across the ZOMBIEREX network." }] }),
  component: EventsPage,
});

const TABS = ["SCHEDULED", "NEARBY", "RALLIES", "TRACK"] as const;

function EventsPage() {
  return (
    <div>
      <StatusBar index="06" section="OPS · SCHEDULE" />

      <div className="flex items-end justify-between px-4 pt-6">
        <div>
          <p className="mono-tag">CONFIRMED · {events.length} OPS</p>
          <h1 className="mt-2 display-xl text-5xl uppercase">Ops</h1>
        </div>
        <button className="btn-solid" style={{ padding: "10px 14px", fontSize: 10 }}>+ HOST</button>
      </div>

      {/* Tabs */}
      <div className="no-scrollbar mt-4 flex overflow-x-auto hairline-t hairline-b">
        {TABS.map((t, i) => (
          <button
            key={t}
            className="tap relative shrink-0 border-r border-hair px-4 py-3 mono-caps"
            style={{
              color: i === 0 ? "var(--color-ink)" : "var(--color-ash)",
              background: i === 0 ? "var(--color-mist)" : "transparent",
            }}
          >
            {t}
            {i === 0 && <span className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: "var(--color-signal)" }} />}
          </button>
        ))}
      </div>

      <div className="px-4 pt-6 space-y-6">
        {events.map((e, i) => {
          const [day, monthYear] = e.date.split(" ");
          return (
            <article key={e.id} className="hairline overflow-hidden">
              <div className="grid grid-cols-[76px_1fr] hairline-b">
                {/* Left date block */}
                <div className="border-r border-hair p-3 text-center" style={{ background: "var(--color-mist)" }}>
                  <p className="mono-tag" style={{ color: "var(--color-ash)" }}>OP·{String(i+1).padStart(2,"0")}</p>
                  <p className="display-numeral mt-2 text-3xl" style={{ color: "var(--color-signal)" }}>{day}</p>
                  <p className="mono-tag mt-1" style={{ color: "var(--color-ash)" }}>{monthYear}</p>
                </div>
                {/* Right hero */}
                <div className="relative h-40">
                  <img src={e.cover} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)" }} />
                  <span className="absolute left-2 top-2 mono-tag text-white" style={{ background: "rgba(0,0,0,0.55)", padding: "3px 6px" }}>{e.kind.toUpperCase()}</span>
                  <div className="absolute inset-x-3 bottom-2 text-white">
                    <p className="mono-tag" style={{ color: "rgba(255,255,255,0.8)" }}>{e.time} · ◎ {e.location}</p>
                    <h3 className="mt-1 display-xl text-lg uppercase leading-tight">{e.title}</h3>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-hair">
                <MetricCell k="DIST" v={e.distance} />
                <MetricCell k="OPS" v={String(e.attending)} />
                <button className="tap py-4 mono-caps" style={{ background: "var(--color-signal)", color: "var(--color-bone)" }}>
                  JOIN ▸
                </button>
              </div>
            </article>
          );
        })}

        <div className="hairline border-dashed p-6 text-center">
          <p className="mono-tag" style={{ color: "var(--color-ash)" }}>END OF SCHEDULE</p>
          <p className="mt-2 text-sm font-bold">Nothing else on the radar</p>
          <p className="mono-tag mt-1" style={{ color: "var(--color-ash)" }}>FOLLOW MORE CREWS TO SEE THEIR OPS</p>
        </div>
      </div>
    </div>
  );
}

function MetricCell({ k, v }: { k: string; v: string }) {
  return (
    <div className="p-3 text-center">
      <p className="mono-tag" style={{ color: "var(--color-ash)" }}>{k}</p>
      <p className="mono-num mt-1 text-sm font-bold">{v}</p>
    </div>
  );
}
