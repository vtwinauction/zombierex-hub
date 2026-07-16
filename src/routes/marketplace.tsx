import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { listings } from "@/lib/mock-data";
import { MapPin, Search as SearchIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — ZOMBIEREX" },
      { name: "description", content: "Buy, sell and trade vehicles, parts and gear inside the ZOMBIEREX community." },
    ],
  }),
  component: MarketplacePage,
});

const cats = ["All", "Vehicles", "Parts", "Gear"];

function MarketplacePage() {
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? listings : listings.filter((l) => l.category === cat.slice(0, -1));

  return (
    <>
      <TopBar title="Marketplace" subtitle="Trade with the underground" />

      <div className="px-4 pt-3">
        <label className="flex items-center gap-2 rounded-md border border-border bg-input/60 px-3 py-2.5">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search bikes, cars, parts, gear…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 py-3">
        {cats.map((c) => {
          const on = c === cat;
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="shrink-0 rounded-full border px-4 py-1.5 font-display text-xs tracking-[0.18em]"
              style={
                on
                  ? { background: "var(--color-primary)", color: "var(--color-primary-foreground)", borderColor: "var(--color-primary)" }
                  : { borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }
              }
            >
              {c.toUpperCase()}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pb-6">
        {filtered.map((l) => (
          <article key={l.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="relative aspect-square w-full overflow-hidden">
              <img src={l.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform hover:scale-105" />
              <span
                className="absolute left-2 top-2 rounded px-2 py-0.5 text-[10px] uppercase tracking-widest"
                style={{ background: "oklch(0.13 0.008 150 / 0.75)", color: "var(--color-primary)", border: "1px solid var(--color-border)" }}
              >
                {l.condition}
              </span>
            </div>
            <div className="p-2.5">
              <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] leading-tight">{l.title}</h3>
              <p className="mt-1.5 font-display text-lg tracking-wide" style={{ color: "var(--color-primary)" }}>{l.price}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" /> {l.location}
              </p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
