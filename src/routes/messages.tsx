import { createFileRoute } from "@tanstack/react-router";
import { StatusBar } from "@/components/StatusBar";
import { chats } from "@/lib/mock-data";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Comms · ZOMBIEREX" }, { name: "description", content: "Private transmissions between riders on the ZOMBIEREX network." }] }),
  component: MessagesPage,
});

function MessagesPage() {
  const totalUnread = chats.reduce((s, c) => s + c.unread, 0);

  return (
    <div>
      <StatusBar index="03" section="COMMS · TRANSMISSIONS" />

      <div className="px-4 pt-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="mono-tag">CHANNEL · {chats.length} ACTIVE</p>
            <h1 className="mt-2 display-xl text-5xl uppercase">Comms</h1>
          </div>
          <div className="text-right">
            <p className="mono-tag" style={{ color: "var(--color-ash)" }}>UNREAD</p>
            <p className="display-numeral text-3xl" style={{ color: "var(--color-signal)" }}>{String(totalUnread).padStart(2,"0")}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 flex items-stretch hairline">
          <span className="grid place-items-center px-3 mono-tag" style={{ color: "var(--color-ash)" }}>FIND</span>
          <input
            placeholder="Search transmissions"
            className="flex-1 bg-transparent py-3 pr-3 text-sm placeholder:text-ash focus:outline-none"
          />
          <button className="mono-tag border-l border-hair px-4" style={{ color: "var(--color-signal)" }}>+ NEW</button>
        </div>
      </div>

      {/* Channel list */}
      <ul className="mt-6 divide-y divide-hair hairline-t hairline-b">
        {chats.map((c, i) => (
          <li key={c.id} className="grid grid-cols-[40px_44px_1fr_auto] items-center gap-3 px-4 py-4">
            <div>
              <p className="mono-tag" style={{ color: "var(--color-ash)" }}>CH·{String(i+1).padStart(2,"0")}</p>
              {c.online && (
                <div className="mt-1 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full pulse-signal" style={{ background: "var(--color-signal)" }} />
                  <span className="mono-tag" style={{ color: "var(--color-signal)" }}>LIVE</span>
                </div>
              )}
            </div>

            <img src={c.user.avatar} alt="" className="h-11 w-11 object-cover hairline" />

            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold">{c.user.name}</p>
              <p className="mt-0.5 truncate text-[12px]" style={{ color: c.unread ? "var(--color-ink)" : "var(--color-ash)" }}>
                {c.lastMessage}
              </p>
            </div>

            <div className="text-right">
              <p className="mono-tag" style={{ color: "var(--color-ash)" }}>{c.timeAgo}</p>
              {c.unread > 0 && (
                <span
                  className="mt-1 inline-grid h-5 min-w-5 place-items-center px-1.5 mono-num text-[10px] font-bold"
                  style={{ background: "var(--color-signal)", color: "var(--color-bone)" }}
                >
                  {c.unread}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
