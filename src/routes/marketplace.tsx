import { createFileRoute } from "@tanstack/react-router";
import { StatusHUD } from "@/components/StatusHUD";
import { Panel, SlashHeader, AngularButton, DataChip } from "@/components/hud";
import { listings } from "@/lib/mock-data";

export const Route = createFileRoute("/marketplace")({
  head: () => ({ meta: [{ title: "ARSENAL · ZOMBIEREX" }] }),
  component: ArsenalPage,
});

function ArsenalPage() {
  const featured = listings[0];
  const rest = listings.slice(1);
  return (
    <div className="pb-10">
      <StatusHUD title="ARSENAL" code="04" />

      <div className="space-y-5 px-3 pt-4">
        <div className="flex gap-2">
          <AngularButton size="sm" variant="solid" active>ALL</AngularButton>
          <AngularButton size="sm">VEHICLES</AngularButton>
          <AngularButton size="sm">PARTS</AngularButton>
          <AngularButton size="sm">GEAR</AngularButton>
        </div>

        {/* FEATURED */}
        <section>
          <SlashHeader label="LEAD LOT" />
          <Panel className="mt-3 overflow-hidden">
            <div className="relative">
              <img src={featured.image} alt="" className="h-56 w-full object-cover" />
              <div className="scanline absolute inset-0" />
              <span className="clip-tag mono-caps absolute right-0 top-0 bg-warn px-2 py-0.5 text-[9px] font-bold text-bone">
                FEATURED
              </span>
            </div>
            <div className="p-3">
              <p className="mono-caps text-ash">LOT · {featured.id.toUpperCase()}</p>
              <p className="font-display mt-1 text-lg uppercase leading-tight">{featured.title}</p>
              <div className="mt-2 flex items-center gap-2">
                <DataChip k="COND" v={featured.condition} tone="signal" />
                <DataChip k="LOC" v={featured.location} />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-ink pt-3">
                <div>
                  <p className="mono-caps text-ash">ASK</p>
                  <p className="font-display mono-num text-2xl leading-none">{featured.price}</p>
                </div>
                <div className="flex gap-2">
                  <AngularButton size="sm">◨ MSG</AngularButton>
                  <AngularButton variant="signal" size="sm">⚑ BID</AngularButton>
                </div>
              </div>
            </div>
          </Panel>
        </section>

        {/* GRID */}
        <section>
          <SlashHeader label="LIVE LOTS" count={rest.length} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {rest.map((l) => (
              <Panel key={l.id} className="overflow-hidden">
                <div className="relative">
                  <img src={l.image} alt="" className="aspect-[4/5] w-full object-cover" />
                  <span className="clip-tag mono-caps absolute left-0 top-0 bg-ink px-1.5 py-0.5 text-[8px] text-bone">
                    {l.category.toUpperCase()}
                  </span>
                </div>
                <div className="border-t border-ink p-2">
                  <p className="font-display line-clamp-2 text-[11px] uppercase leading-tight">{l.title}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="mono-num text-sm font-bold">{l.price}</span>
                    <span className="mono-caps text-ash">{l.condition}</span>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
