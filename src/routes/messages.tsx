import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { chats } from "@/lib/mock-data";
import { Mic, Search as SearchIcon, Edit3 } from "lucide-react";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — ZOMBIEREX" },
      { name: "description", content: "Direct messages, voice notes and group chats." },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <>
      <TopBar title="Inbox" subtitle="Direct · Groups · Clubs" />

      <div className="px-5 pt-2">
        <label className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search conversations…" className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground" />
        </label>
      </div>

      {/* Active riders row */}
      <div className="mt-4 px-5">
        <p className="mb-2 text-mono-caps text-muted-foreground">Riding now</p>
        <div className="scrollbar-none flex gap-3 overflow-x-auto">
          {chats.filter((c) => c.online).map((c) => (
            <button key={c.id} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
              <span className="relative">
                <img src={c.user.avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-2 ring-background" style={{ background: "var(--color-primary)" }} />
              </span>
              <span className="w-full truncate text-[11px]">{c.user.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-4">
        {chats.map((c) => (
          <li key={c.id}>
            <button className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/60">
              <img src={c.user.avatar} alt={c.user.name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-display text-[15px]">{c.user.name}</span>
                  <span className="shrink-0 text-mono-caps text-muted-foreground">{c.timeAgo}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  {c.lastMessage.startsWith("Voice") ? <Mic className="h-3.5 w-3.5" style={{ color: "var(--color-primary)" }} /> : null}
                  <span className="truncate">{c.lastMessage}</span>
                </div>
              </div>
              {c.unread > 0 ? (
                <span
                  className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full px-1.5 font-display text-[11px]"
                  style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
                >
                  {c.unread}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      <button
        className="fixed bottom-24 right-5 z-30 grid h-12 w-12 place-items-center rounded-full text-background shadow-[var(--shadow-lift)]"
        style={{ background: "var(--color-foreground)" }}
        aria-label="New message"
      >
        <Edit3 className="h-5 w-5" />
      </button>
    </>
  );
}
