import { createFileRoute } from "@tanstack/react-router";
import { Search, Camera, Mic } from "lucide-react";
import { chats } from "@/lib/mock-data";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages · ZOMBIEREX" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <div className="pb-28">
      <header className="sticky top-0 z-30 bg-bone/70 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
          <button className="tap grid h-9 w-9 place-items-center rounded-full border border-hair bg-white">
            <Camera className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-full border border-hair bg-white px-4 py-2.5">
          <Search className="h-4 w-4 text-ash" />
          <input placeholder="Search messages" className="flex-1 bg-transparent text-sm placeholder:text-ash focus:outline-none" />
        </div>
      </header>

      <ul className="divide-y divide-hair px-2">
        {chats.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-3 py-3">
            <div className="relative">
              <img src={c.user.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
              {c.online && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bone"
                  style={{ background: "var(--color-signal-deep)" }}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-[14px] font-semibold">{c.user.name}</p>
                <span className="text-[11px] text-ash">{c.timeAgo}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[12.5px] text-ash">
                  {c.lastMessage.includes("Voice") && <Mic className="mr-1 inline h-3 w-3" />}
                  {c.lastMessage}
                </p>
                {c.unread > 0 && (
                  <span
                    className="grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold text-ink"
                    style={{ background: "var(--color-signal)" }}
                  >
                    {c.unread}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
