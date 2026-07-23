/**
 * Drag Racing — hub with entry, my runs, leaderboards.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listMyDragRuns } from "@/lib/drag.functions";
import { StatusBar } from "@/components/StatusBar";

const mineQ = queryOptions({ queryKey: ["drag", "mine"], queryFn: () => listMyDragRuns() });

export const Route = createFileRoute("/_authenticated/drag/")({
  head: () => ({
    meta: [
      { title: "Drag Racing · ZOMBIEREX" },
      { name: "description", content: "GPS-verified drag runs — 0-60, 0-100, 60-120, 1/8 mile, 1/4 mile and top speed." },
    ],
  }),
  component: DragHub,
});

const STATUS: Record<string, { label: string; color: string }> = {
  verified: { label: "VERIFIED", color: "var(--color-neon)" },
  pending: { label: "PENDING", color: "var(--color-silver)" },
  flagged: { label: "FLAGGED", color: "#ff8c1a" },
  rejected: { label: "REJECTED", color: "#ff4d4d" },
};

function DragHub() {
  const { data } = useSuspenseQuery(mineQ);
  return (
    <div className="min-h-svh pb-24">
      <StatusBar index="07" section="DRAG · VERIFIED" />
      <div className="px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="serif text-3xl" style={{ color: "var(--color-ink)" }}>Drag Racing</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
              GPS-verified runs · anti-cheat validation · permanent record
            </p>
          </div>
          <Link
            to="/drag/run"
            className="tap mono-caps text-[10px] font-black"
            style={{ padding: "10px 14px", background: "var(--color-neon)", color: "var(--color-obsidian)" }}
          >
            + NEW RUN
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link to="/drag/leaderboards" search={{ kind: "motorcycle", metric: "quarter_mile_s" }} className="tap rounded-lg border p-4" style={{ borderColor: "var(--color-hair)", background: "var(--color-graphite)" }}>
            <p className="mono-tag" style={{ color: "var(--color-silver)", fontSize: 9 }}>LEADERBOARD</p>
            <p className="mt-1 text-sm font-bold" style={{ color: "var(--color-ink)" }}>Motorcycles</p>
          </Link>
          <Link to="/drag/leaderboards" search={{ kind: "car", metric: "quarter_mile_s" }} className="tap rounded-lg border p-4" style={{ borderColor: "var(--color-hair)", background: "var(--color-graphite)" }}>
            <p className="mono-tag" style={{ color: "var(--color-silver)", fontSize: 9 }}>LEADERBOARD</p>
            <p className="mt-1 text-sm font-bold" style={{ color: "var(--color-ink)" }}>Cars</p>
          </Link>
        </div>

        <h2 className="mono-caps mt-6 text-[10px] font-black" style={{ color: "var(--color-silver)" }}>MY RUNS</h2>
        <div className="mt-2 space-y-2">
          {data.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm" style={{ borderColor: "var(--color-hair-strong)", color: "var(--color-ink-3)" }}>
              No runs yet. Tap <b>NEW RUN</b> to record your first verified drag.
            </div>
          )}
          {data.map((r: any) => {
            const s = STATUS[r.status] ?? STATUS.pending;
            return (
              <Link key={r.id} to="/drag/$id" params={{ id: r.id }} className="tap block rounded-lg border p-3" style={{ borderColor: "var(--color-hair)", background: "var(--color-graphite)" }}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold" style={{ color: "var(--color-ink)" }}>
                    {r.vehicle_name || (r.vehicle_kind === "motorcycle" ? "Motorcycle" : "Car")}
                  </p>
                  <span className="mono-tag" style={{ color: s.color, fontSize: 9, fontWeight: 800 }}>{s.label}</span>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                  <Cell label="1/4 MI" value={r.quarter_mile_s ? `${Number(r.quarter_mile_s).toFixed(3)}s` : "—"} />
                  <Cell label="0-100" value={r.zero_to_100_kmh_s ? `${Number(r.zero_to_100_kmh_s).toFixed(2)}s` : "—"} />
                  <Cell label="TOP" value={r.top_speed_kmh ? `${Math.round(Number(r.top_speed_kmh))}` : "—"} />
                  <Cell label="SCORE" value={r.verification_score ? `${Math.round(Number(r.verification_score))}` : "—"} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mono-num text-sm font-bold" style={{ color: "var(--color-ink)" }}>{value}</p>
      <p className="mono-tag" style={{ color: "var(--color-silver)", fontSize: 8 }}>{label}</p>
    </div>
  );
}
