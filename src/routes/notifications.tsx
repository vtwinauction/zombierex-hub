import { createFileRoute } from "@tanstack/react-router";
import { StatusHUD } from "@/components/StatusHUD";
import { Panel, SlashHeader, HexChip, AngularButton } from "@/components/hud";
import { users, events } from "@/lib/mock-data";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "SIGNAL · ZOMBIEREX" }] }),
  component: SignalPage,
});

type Sig = {
  id: string; kind: "LIKE" | "CMT" | "TRK" | "MSN" | "SYS";
  who?: typeof users[number]; text: string; time: string; unread?: boolean;
};

const SIGNALS: Sig[] = [
  { id: "n1", kind: "LIKE", who: users[1], text: "reacted ✚ to your MT-09 night ride", time: "3m", unread: true },
  { id: "n2", kind: "TRK", who: users[2], text: "started tracking your dossier", time: "12m", unread: true },
  { id: "n3", kind: "CMT", who: users[0], text: "commented: 'clean lines on that widebody'", time: "1h" },
  { id: "n4", kind: "MSN", text: `Mission "${events[0].title}" is 12h away`, time: "2h", unread: true },
  { id: "n5", kind: "SYS", text: "Trophy unlocked · Canyon Carver", time: "1d" },
  { id: "n6", kind: "LIKE", who: users[2], text: "and 42 others reacted to your carb rebuild", time: "2d" },
];

const KIND_STYLE: Record<Sig["kind"], string> = {
  LIKE: "bg-signal text-ink",
  CMT: "bg-mist text-ink",
  TRK: "bg-ink text-bone",
  MSN: "bg-warn text-bone",
  SYS: "bg-bone text-ink",
};

export default function _() { return null; }

function SignalPage() {
  const unread = SIGNALS.filter(s => s.unread).length;
  return (
    <div className="pb-10">
      <StatusHUD title="SIGNAL" code="06" />

      <div className="space-y-4 px-3 pt-4">
        <Panel variant="ink" className="flex items-center justify-between p-3">
          <div>
            <p className="mono-caps text-signal">// INBOUND</p>
            <p className="font-display mono-num text-2xl leading-none text-bone">{unread} NEW</p>
          </div>
          <AngularButton variant="signal" size="sm">MARK ALL</AngularButton>
        </Panel>

        <div className="flex gap-1">
          {(["ALL", "LIKES", "CMTS", "TRACK", "MISN", "SYS"] as const).map((c, i) => (
            <AngularButton key={c} size="sm" variant={i === 0 ? "solid" : "ghost"} active={i === 0}>{c}</AngularButton>
          ))}
        </div>

        <SlashHeader label="TIMELINE" count={SIGNALS.length} />
        <ul className="space-y-2">
          {SIGNALS.map((s) => (
            <li key={s.id} className={`panel clip-chamfer-sm grid grid-cols-[44px_1fr_auto] items-center gap-3 p-2 ${s.unread ? "ring-1 ring-signal" : ""}`}>
              {s.who ? (
                <HexChip src={s.who.avatar} size={40} />
              ) : (
                <div className="clip-hex flex h-11 w-10 items-center justify-center bg-ink text-signal">
                  <span className="font-display text-lg">◈</span>
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`clip-tag mono-caps px-1.5 py-0.5 text-[8px] font-bold ${KIND_STYLE[s.kind]}`}>{s.kind}</span>
                  {s.who && <span className="font-display text-xs uppercase">{s.who.name}</span>}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-ink">{s.text}</p>
              </div>
              <span className="mono-num text-[10px] text-ash">{s.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
