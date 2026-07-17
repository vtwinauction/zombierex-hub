import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { listings } from "@/lib/mock-data";
import { MapPin, Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — ZOMBIEREX" },
      { name: "description", content: "Buy, sell and trade vehicles, parts and gear inside the community." },
    ],
  }),
  component: MarketplacePage,
});

const cats = ["All", "Vehicles", "Parts", "Gear"];

function MarketplacePage() {
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? listings : listings.filter((l) => l.category === cat.slice(0, -1));
  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <>
      <TopBar title="Market" subtitle="Verified sellers only" />

      {/* Search */}
      <div className="px-5 pt-2">
        <div className="flex items-center gap-2">
          <label className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-3">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search bikes, parts, gear…"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
            />
          </label>
          <button aria-label="Filters" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-card">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto px-5 pb-2">
        {cats.map((c) => {
          const on = c === cat;
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="shrink-0 rounded-full border px-4 py-2 font-display text-[13px]"
              style={on
                ? { background: "var(--color-foreground)", color: "var(--color-background)", borderColor: "var(--color-foreground)" }
                : { borderColor: "var(--color-border)", color: "var(--color-muted-foreground)", background: "var(--color-card)" }}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Featured */}
      {featured ? (
        <div className="px-5 pt-3">
          <article className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[var(--shadow-soft)]">
            <div className="relative aspect-[16/11] w-full overflow-hidden">
              <img src={featured.image} alt="" loading="lazy" className="h-full w-full object-cover" />
              <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-mono-caps" style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>
                Featured
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="text-mono-caps text-muted-foreground">{featured.category} · {featured.condition}</p>
                <h3 className="mt-1.5 font-display text-[20px] leading-tight tracking-tight">{featured.title}</h3>
                <p className="mt-1.5 inline-flex items-center gap-1 text-[12px] text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {featured.location}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-[24px] leading-none tracking-tight">{featured.price}</p>
                <button className="mt-3 rounded-full bg-foreground px-4 py-2 font-display text-[12px] text-background">View</button>
              </div>
            </div>
          </article>
        </div>
      ) : null}

      {/* Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 px-5 pb-4">
        {rest.map((l) => (
          <article key={l.id} className="overflow-hidden rounded-[20px] border border-border bg-card transition-transform hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <img src={l.image} alt="" loading="lazy" className="h-full w-full object-cover" />
              <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium backdrop-blur">
                {l.condition}
              </span>
            </div>
            <div className="p-3">
              <p className="line-clamp-2 min-h-[2.5rem] text-[13px] leading-tight">{l.title}</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="font-display text-[18px] leading-none tracking-tight">{l.price}</p>
                <p className="text-[10px] text-muted-foreground">{l.location}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
