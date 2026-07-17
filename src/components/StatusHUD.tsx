import { rider } from "@/lib/mock-data";

export function StatusHUD({ title, code }: { title: string; code: string }) {
  const pct = Math.round((rider.xp / rider.xpToNext) * 100);
  return (
    <header className="border-b border-ink bg-bone">
      {/* Top telemetry stripe */}
      <div className="panel-ink flex items-center gap-3 px-3 py-1.5">
        <span className="mono-caps text-signal">SYS</span>
        <span className="mono-num text-[10px] text-bone/70">GRID·{code}</span>
        <span className="rule-tick-v h-3 opacity-40" />
        <span className="mono-num text-[10px] text-bone/70">LVL {rider.level}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="signal-pulse block h-1.5 w-1.5 bg-signal" />
          <span className="mono-caps text-bone/70">LIVE</span>
        </div>
      </div>
      {/* Page title band */}
      <div className="flex items-end justify-between gap-3 px-4 pb-3 pt-3">
        <div>
          <p className="mono-caps text-ash">// {code} · SECTOR</p>
          <h1 className="font-display text-3xl leading-none tracking-wide uppercase">{title}</h1>
        </div>
        <div className="text-right">
          <p className="mono-caps text-ash">XP {pct}%</p>
          <div className="mt-1 h-1.5 w-24 border border-ink bg-bone">
            <div className="h-full bg-signal" style={{ width: `${pct}%` }} />
          </div>
          <p className="mono-num mt-1 text-[10px] text-ash">{rider.xp.toLocaleString()} / {rider.xpToNext.toLocaleString()}</p>
        </div>
      </div>
    </header>
  );
}
