import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Send, Bookmark, MapPin, ShoppingBag } from "lucide-react";
import { listings } from "@/lib/mock-data";

export const Route = createFileRoute("/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace · ZOMBIEREX" }] }),
  component: MarketplacePage,
});

const CATS = ["All", "Vehicles", "Parts", "Gear", "Wheels", "Deals"] as const;

function MarketplacePage() {
  const featured = listings[0];
  return (
    <div className="pb-28">
      <header className="sticky top-0 z-30 bg-bone/70 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 pb-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Marketplace</h1>
            <p className="text-[11px] text-ash">Verified riders. Fair prices.</p>
          </div>
          <Link to="/search" className="tap rounded-full bg-ink px-4 py-2 text-[12px] font-semibold text-bone">
            + Sell
          </Link>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
          {CATS.map((c, i) => (
            <button
              key={c}
              className={`tap shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold ${
                i === 0 ? "bg-ink text-bone" : "border border-hair bg-white text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-6 px-4 pt-4">
        {/* Featured hero */}
        <Link to="/" className="tap block overflow-hidden rounded-3xl">
          <div className="card-ink relative overflow-hidden">
            <img src={featured.image} alt="" className="ken-burns h-64 w-full object-cover opacity-90" />
            <div className="absolute inset-0 gradient-ink" />
            <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 text-white">
              <span className="chip-dark w-fit" style={{ color: "white" }}>
                <ShoppingBag className="h-3 w-3" />
                Featured · {featured.category}
              </span>
              <h2 className="text-xl font-semibold leading-tight">{featured.title}</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[12px] text-white/80">
                  <MapPin className="h-3 w-3" />
                  {featured.location} · {featured.condition}
                </div>
                <span className="text-lg font-bold">{featured.price}</span>
              </div>
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          {listings.slice(1).map((l) => (
            <article key={l.id} className="overflow-hidden rounded-2xl border border-hair bg-white">
              <div className="relative">
                <img src={l.image} alt="" className="aspect-[4/5] w-full object-cover" />
                <button className="tap absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink backdrop-blur">
                  <Heart className="h-4 w-4" />
                </button>
                <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-ink">
                  {l.condition}
                </span>
              </div>
              <div className="space-y-1 p-3">
                <p className="line-clamp-2 text-[12.5px] font-medium leading-snug">{l.title}</p>
                <p className="text-[10px] text-ash">{l.location}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[15px] font-bold">{l.price}</span>
                  <div className="flex items-center gap-2 text-ash">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <Send className="h-3.5 w-3.5" />
                    <Bookmark className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
