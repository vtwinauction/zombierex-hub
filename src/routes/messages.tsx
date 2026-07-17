import { createFileRoute } from "@tanstack/react-router";
import { StatusHUD } from "@/components/StatusHUD";
import { HexChip, SlashHeader, AngularButton } from "@/components/hud";
import { chats } from "@/lib/mock-data";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "COMMS · ZOMBIEREX" }] }),
  component: CommsPage,
});

function CommsPage() {
  return (
    <div className="pb-10">
      <StatusHUD title="COMMS" code="05" />

      <div className="space-y-4 px-3 pt-4">
        <div className="flex items-center gap-2">
          <AngularButton size="sm" variant="solid" active>DIRECT</AngularButton>
          <AngularButton size="sm">CREWS</AngularButton>
          <AngularButton size="sm">REQ</AngularButton>
        </div>

        <SlashHeader label="OPEN CHANNELS" count={chats.length} />

        <ul className="space-y-2">
          {chats.map((c) => (
            <li key={c.id} className="panel clip-chamfer-sm flex items-center gap-3 p-3">
              <HexChip src={c.user.avatar} size={44} live={c.online} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm uppercase leading-none">{c.user.name}</p>
                  <span className="mono-num text-[10px] text-ash">{c.timeAgo}</span>
                </div>
                <p className="mono-caps text-ash mt-1 truncate">{c.user.handle}</p>
                <p className="mt-1 truncate text-xs text-ink">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && (
                <span className="clip-chamfer-sm mono-num flex h-6 min-w-6 items-center justify-center border border-ink bg-signal px-1.5 text-[10px] font-bold text-ink">
                  {c.unread}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
