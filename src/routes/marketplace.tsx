import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { StatusBar } from "@/components/StatusBar";
import { listings } from "@/lib/mock-data";

export const Route = createFileRoute("/marketplace")({
  head: () => ({ meta: [{ title: "The Vault · ZOMBIEREX" }, { name: "description", content: "Verified motorcycles, cars, parts, and gear — a curated editorial showroom." }] }),
  component: MarketplacePage,
});

const CATS = ["All", "Machines", "Parts", "Gear", "Wheels", "Apparel"] as const;

function MarketplacePage() {
  const [cat, setCat] = useState<typeof CATS[number]>("All");
  const featured = listings[0];
  const rest = listings.slice(1);

  return (
    <div className="pb-16">
      <StatusBar index="04" section="VAULT · MARKETPLACE" />

      {/* Editorial masthead */}
      <section className="rise px-4 pt-6">
        <div className="flex items-baseline gap-3">
          <span className="mono-tag">Volume IV</span>
          <span className="etch flex-1" />
          <span className="mono-tag" style={{ color: "var(--color-neon)" }}>{String(listings.length).padStart(3, "0")} lots live</span>
        </div>
        <h1 className="serif mt-3 text-[68px] leading-[0.85]" style={{ color: "var(--color-ink)" }}>
          The <span className="italic" style={{ color: "var(--color-neon)" }}>Vault</span>
        </h1>
        <p className="mt-3 max-w-[32ch] text-[13px] leading-snug" style={{ color: "var(--color-silver)" }}>
          A curated showroom of verified machines, parts, and gear — inspected, catalogued, and released weekly.
        </p>

        <div className="mt-6 flex items-center justify-between">
          <p className="mono-tag">Sort · Latest drops</p>
          <button className="btn-ghost" style={{ padding: "8px 12px", fontSize: 10 }}>+ List a lot</button>
        </div>
      </section>

      {/* Category rail — pill chips */}
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-4">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`chip ${c === cat ? "chip-active" : ""} shrink-0`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Featured lot — cinematic full-bleed */}
      <section className="mt-6">
        <div className="px-4">
          <p className="mono-tag" style={{ color: "var(--color-silver)" }}>Lot № 001 · Featured</p>
        </div>
        <Link to="/marketplace" className="tap mt-3 block">
          <article className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden" style={{ borderBottom: "1px solid var(--color-hair)", borderTop: "1px solid var(--color-hair)" }}>
              <img src={featured.image} alt="" className="ken-burns h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.9) 100%)" }} />
              <span className="absolute left-3 top-3 mono-caps px-2 py-1" style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
                ● {featured.condition}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="mono-tag" style={{ color: "rgba(255,255,255,0.75)" }}>◎ {featured.location}</p>
                <h2 className="serif mt-2 text-3xl italic leading-tight">{featured.title}</h2>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-hair surface-brushed" style={{ borderBottom: "1px solid var(--color-hair-strong)" }}>
              <Cell k="Asking" v={featured.price} highlight />
              <Cell k="Seller" v={featured.seller.handle} />
              <Cell k="Action" v="Inspect →" />
            </div>
          </article>
        </Link>
      </section>

      {/* Showroom */}
      <section className="mt-10 px-4 space-y-6">
        <div className="flex items-baseline justify-between">
          <p className="mono-tag">Showroom · {rest.length} lots</p>
          <span className="etch flex-1 mx-3" />
          <p className="mono-tag" style={{ color: "var(--color-silver)" }}>P. 02</p>
        </div>
        {rest.map((l, i) => (
          <Link key={l.id} to="/marketplace" className="tap block">
            <article className="surface-1 lift-1 overflow-hidden" style={{ borderRadius: 3 }}>
              <div className="relative aspect-[16/10]">
                <img src={l.image} alt="" className="h-full w-full object-cover" />
                <span className="mono-caps absolute right-2 top-2 px-2 py-1" style={{ background: "rgba(0,0,0,0.6)", color: "white" }}>
                  Lot № {String(i + 2).padStart(3, "0")}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-end gap-4 border-t border-hair p-4">
                <div>
                  <p className="mono-tag" style={{ color: "var(--color-silver)" }}>{l.category} · {l.condition}</p>
                  <p className="serif mt-1 text-[18px] italic leading-tight" style={{ color: "var(--color-ink)" }}>{l.title}</p>
                  <p className="mono-tag mt-2">◎ {l.location}</p>
                </div>
                <div className="text-right">
                  <p className="mono-tag">USD</p>
                  <p className="serif text-3xl italic" style={{ color: "var(--color-neon)", lineHeight: 0.9 }}>{l.price.replace("$", "$")}</p>
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
    <div className="px-3 py-3">
      <p className="mono-tag" style={{ color: "var(--color-silver)", fontSize: 8.5 }}>{k}</p>
      <p className="serif mt-1 text-lg italic" style={{ color: highlight ? "var(--color-neon)" : "var(--color-ink)", lineHeight: 0.9 }}>
        {v}
      </p>
    </div>
  );
}
