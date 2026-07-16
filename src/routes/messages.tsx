import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { chats } from "@/lib/mock-data";
import { Mic, Search as SearchIcon } from "lucide-react";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — ZOMBIEREX" },
      { name: "description", content: "Direct messages, voice notes and group chats with riders, clubs and shops." },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <>
      <TopBar title="Messages" subtitle="Direct · Groups · Clubs" />

      <div className="px-4 pt-3">
        <label className="flex items-center gap-2 rounded-md border border-border bg-input/60 px-3 py-2.5">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search conversations…" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </label>
      </div>

      <ul className="mt-2">
        {chats.map((c) => (
          <li key={c.id}>
            <button className="flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-muted/40">
              <span className="relative shrink-0">
                <img src={c.user.avatar} alt={c.user.name} className="h-12 w-12 rounded-full border border-border object-cover" />
                {c.online ? (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background" style={{ background: "var(--color-primary)" }} />
                ) : null}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{c.user.name}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{c.timeAgo}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  {c.lastMessage.startsWith("Voice") ? <Mic className="h-3.5 w-3.5" style={{ color: "var(--color-primary)" }} /> : null}
                  <span className="truncate">{c.lastMessage}</span>
                </div>
              </div>
              {c.unread > 0 ? (
                <span
                  className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full px-1.5 font-display text-[11px]"
                  style={{ background: "var(--color-destructive)", color: "var(--color-destructive-foreground)" }}
                >
                  {c.unread}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
