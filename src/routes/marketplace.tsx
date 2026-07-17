import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { StatusBar } from "@/components/StatusBar";
import { listings } from "@/lib/mock-data";

export const Route = createFileRoute("/marketplace")({
  head: () => ({ meta: [{ title: "Vault · ZOMBIEREX" }, { name: "description", content: "Verified motorcycles, cars, parts, and gear. A curated showroom for the ZOMBIEREX community." }] }),
  component: MarketplacePage,
});

const CATS = ["ALL", "MACHINES", "PARTS", "GEAR", "WHEELS", "APPAREL"] as const;

function MarketplacePage() {
  const [cat, setCat] = useState<typeof CATS[number]>("ALL");
  const featured = listings[0];
  const rest = listings.slice(1);

  return (
    <div>
      <StatusBar index="04" section="THE VAULT · MARKETPLACE" />

      {/* Section masthead */}
      <div className="px-4 pt-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="mono-tag">CURATED · VERIFIED SELLERS</p>
            <h1 className="mt-2 display-xl text-5xl uppercase">The Vault</h1>
          </div>
          <span className="display-numeral text-4xl" style={{ color: "var(--color-ash)" }}>
            {String(listings.length).padStart(3,"0")}
          </span>
        </div>
        <div className="mt-3 hairline-t flex items-center justify-between pt-3">
          <p className="mono-tag" style={{ color: "var(--color-ash)" }}>SORT · LATEST DROPS</p>
          <button className="btn-ghost" style={{ padding: "8px 12px", fontSize: 10 }}>+ LIST</button>
        </div>
      </div>

      {/* Category tabs — thin mono rail */}
      <div className="no-scrollbar mt-4 flex gap-0 overflow-x-auto hairline-t hairline-b">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className="tap shrink-0 px-4 py-3 mono-caps border-r border-hair"
            style={{
              color: c === cat ? "var(--color-ink)" : "var(--color-ash)",
              background: c === cat ? "var(--color-mist)" : "transparent",
              position: "relative",
            }}
          >
            {c}
            {c === cat && (
              <span className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: "var(--color-signal)" }} />
            )}
          </button>
        ))}
      </div>

      {/* Hero listing — showroom */}
      <section className="px-4 pt-6">
        <p className="mono-tag mb-2" style={{ color: "var(--color-ash)" }}>LOT 001 · FEATURED</p>
        <Link to="/marketplace" className="tap block">
          <article className="hairline overflow-hidden">
            <div className="relative aspect-[4/5]">
              <img src={featured.image} alt="" className="ken-burns h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.85) 100%)" }} />
              <span className="absolute left-3 top-3 mono-tag text-white" style={{ background: "rgba(0,0,0,0.55)", padding: "4px 8px" }}>
                ● {featured.condition.toUpperCase()}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="mono-tag" style={{ color: "rgba(255,255,255,0.75)" }}>◎ {featured.location}</p>
                <h2 className="mt-2 text-2xl display-xl uppercase leading-none">{featured.title}</h2>
              </div>
            </div>
            {/* Spec/price strip */}
            <div className="grid grid-cols-3 divide-x divide-hair border-t border-hair" style={{ background: "var(--color-mist)" }}>
              <Cell k="ASKING" v={featured.price} highlight />
              <Cell k="SELLER" v={featured.seller.handle} />
              <Cell k="ACTION" v="INSPECT →" />
            </div>
          </article>
        </Link>
      </section>

      {/* Showroom grid — single column, immersive */}
      <section className="mt-8 px-4 space-y-6">
        <p className="mono-tag">SHOWROOM · {rest.length} LOTS</p>
        {rest.map((l, i) => (
          <Link key={l.id} to="/marketplace" className="tap block">
            <article className="hairline">
              <div className="relative aspect-[16/10]">
                <img src={l.image} alt="" className="h-full w-full object-cover" />
                <span className="absolute right-2 top-2 mono-tag text-white" style={{ background: "rgba(0,0,0,0.6)", padding: "3px 6px" }}>
                  LOT·{String(i+2).padStart(3,"0")}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-end gap-4 border-t border-hair p-4">
                <div>
                  <p className="mono-tag" style={{ color: "var(--color-ash)" }}>{l.category.toUpperCase()} · {l.condition.toUpperCase()}</p>
                  <p className="mt-1 text-[15px] font-bold leading-tight">{l.title}</p>
                  <p className="mono-tag mt-2" style={{ color: "var(--color-ash)" }}>◎ {l.location}</p>
                </div>
                <div className="text-right">
                  <p className="mono-tag" style={{ color: "var(--color-ash)" }}>USD</p>
                  <p className="display-numeral text-2xl" style={{ color: "var(--color-ink)" }}>{l.price.replace("$","")}</p>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </div>
  );
}

function Cell({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="p-3">
      <p className="mono-tag" style={{ color: "var(--color-ash)" }}>{k}</p>
      <p className={`mt-1 text-sm font-bold ${highlight ? "display-numeral" : ""}`} style={highlight ? { color: "var(--color-signal)" } : undefined}>
        {v}
      </p>
    </div>
  );
}
