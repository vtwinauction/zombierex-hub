import { createFileRoute } from "@tanstack/react-router";
import { Reel } from "@/components/Reel";
import { FeedHeader } from "@/components/FeedHeader";
import { StoriesRail } from "@/components/StoriesRail";
import { reels } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZOMBIEREX — Home" },
      { name: "description", content: "Short-form videos, stories and community from the motorcycle & car world." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="relative">
      <FeedHeader dark />

      {/* Vertical snap feed of reels */}
      <div className="snap-y-page no-scrollbar h-[100svh] overflow-y-scroll">
        {/* Stories as first snap panel */}
        <section className="snap-item relative flex h-[100svh] w-full flex-col bg-bone">
          <div className="h-[max(env(safe-area-inset-top),56px)]" />
          <div>
            <div className="flex items-baseline justify-between px-4 pt-2">
              <h2 className="text-2xl font-semibold tracking-tight">Stories</h2>
              <span className="mono-caps text-ash">Live · Rides · Polls</span>
            </div>
            <StoriesRail />
          </div>

          <div className="mt-2 flex-1 overflow-hidden px-4">
            <div className="card-ink relative h-full w-full overflow-hidden">
              <img src={reels[0].poster} alt="" className="ken-burns h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 gradient-ink" />
              <div className="absolute inset-x-0 bottom-0 space-y-3 p-5 text-white">
                <span className="chip-dark w-fit">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-signal)" }} />
                  Trending now
                </span>
                <h1 className="max-w-[80%] text-3xl font-semibold leading-[1.05]">
                  Swipe up to enter the feed
                </h1>
                <p className="max-w-[80%] text-sm text-white/80">
                  Short videos from riders and drivers around the world. Double-tap to like, long-press to react.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["#nightride", "#widebody", "#restoration", "#rally"].map((t) => (
                    <span key={t} className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold backdrop-blur-md">{t}</span>
                  ))}
                </div>
              </div>
              <div className="absolute right-4 top-4 flex flex-col items-center gap-1 text-white/80">
                <span className="text-[10px] font-semibold uppercase tracking-wider">Swipe</span>
                <span className="h-6 w-[2px] rounded-full bg-white/60" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Down</span>
              </div>
            </div>
          </div>
          <div className="h-32" />
        </section>

        {reels.map((r) => (
          <Reel key={r.id} reel={r} />
        ))}
      </div>
    </div>
  );
}
