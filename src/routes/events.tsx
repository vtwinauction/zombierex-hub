import { createFileRoute } from "@tanstack/react-router";
import { StatusHUD } from "@/components/StatusHUD";
import { Panel, SlashHeader, DataChip, AngularButton } from "@/components/hud";
import { events } from "@/lib/mock-data";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "MISSIONS · ZOMBIEREX" }] }),
  component: MissionsPage,
});

function MissionsPage() {
  return (
    <div className="pb-10">
      <StatusHUD title="MISSIONS" code="02" />

      <div className="space-y-4 px-3 pt-4">
        <div className="flex gap-2">
          <AngularButton variant="solid" size="sm" active>ALL</AngularButton>
          <AngularButton size="sm">RIDES</AngularButton>
          <AngularButton size="sm">MEETS</AngularButton>
          <AngularButton size="sm">RALLY</AngularButton>
        </div>

        <SlashHeader label="OPEN MISSIONS" count={events.length} />

        <div className="relative space-y-3 pl-6">
          {/* Timeline vertical rule */}
          <div className="rule-tick-v absolute bottom-2 left-2 top-2 opacity-40" />

          {events.map((e) => (
            <div key={e.id} className="relative">
              <span className="clip-hex absolute -left-4 top-4 h-3 w-3 bg-signal border border-ink" />
              <Panel className="grid grid-cols-[80px_1fr] overflow-hidden">
                <div className="panel-ink flex flex-col items-center justify-center py-2 text-center">
                  <span className="mono-caps text-signal">{e.date.split(" · ")[0]}</span>
                  <span className="font-display text-3xl text-bone leading-none">
                    {e.date.split(" · ")[1].split(" ")[1]}
                  </span>
                  <span className="mono-caps text-bone/60 mt-1">{e.time}</span>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-sm uppercase leading-tight">{e.title}</p>
                      <p className="mono-caps text-ash mt-0.5 truncate">{e.location}</p>
                    </div>
                    <span className="clip-tag mono-caps bg-ink px-2 py-0.5 text-[9px] text-bone">
                      {e.kind.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <DataChip k="DIST" v={e.distance.replace(" away", "")} tone="signal" />
                    <DataChip k="CREW" v={e.club} />
                    <DataChip k="RIDR" v={e.attending} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <AngularButton variant="signal" size="sm">◇ JOIN</AngularButton>
                    <AngularButton size="sm">⇢ SHARE</AngularButton>
                  </div>
                </div>
              </Panel>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
