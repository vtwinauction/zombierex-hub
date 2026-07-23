import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getMessages, sendMessage } from "@/lib/messages.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/messages/$id")({
  head: ({ params }) => ({ meta: [
    { title: "Channel · ZOMBIEREX" },
    { name: "description", content: `Encrypted rider channel ${params.id.slice(0, 8)}.` },
    { property: "og:title", content: "Channel · ZOMBIEREX" },
    { property: "og:description", content: "Encrypted rider channel." },
  ] }),
  component: ChannelPage,
});

function ChannelPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const fnGet = useServerFn(getMessages);
  const fnSend = useServerFn(sendMessage);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const q = useQuery({
    queryKey: ["messages", id],
    queryFn: () => fnGet({ data: { conversationId: id, limit: 100 } }),
    staleTime: 5_000,
  });

  const send = useMutation({
    mutationFn: (body: string) => fnSend({ data: { conversationId: id, body } }),
    onSuccess: () => { setText(""); qc.invalidateQueries({ queryKey: ["messages", id] }); qc.invalidateQueries({ queryKey: ["conversations"] }); },
  });

  useEffect(() => {
    const ch = supabase.channel(`msg-${id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ["messages", id] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, qc]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [q.data]);

  const msgs = q.data ?? [];

  return (
    <div className="flex flex-col" style={{ minHeight: "100svh" }}>
      <header className="sticky top-0 z-10 hairline-b px-4 py-3 flex items-center gap-3" style={{ background: "var(--color-bone)" }}>
        <Link to="/messages" className="mono-tag" style={{ color: "var(--color-ash)" }}>← BACK</Link>
        <p className="mono-tag" style={{ color: "var(--color-signal)" }}>CH · {id.slice(0, 6).toUpperCase()}</p>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {q.isLoading && <p className="mono-tag text-center" style={{ color: "var(--color-ash)" }}>LOADING…</p>}
        {!q.isLoading && msgs.length === 0 && (
          <p className="mono-tag text-center pt-8" style={{ color: "var(--color-ash)" }}>NO MESSAGES YET</p>
        )}
        {msgs.map((m: any) => (
          <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[78%]">
              {!m.mine && m.sender && (
                <p className="mono-tag mb-1 px-1" style={{ color: "var(--color-ash)" }}>
                  {m.sender.display_name ?? m.sender.username ?? "RIDER"}
                </p>
              )}
              <div className="hairline px-3 py-2 text-sm" style={{
                background: m.mine ? "var(--color-signal)" : "transparent",
                color: m.mine ? "var(--color-bone)" : "var(--color-ink)",
              }}>
                {m.body}
              </div>
              <p className="mono-tag mt-1 px-1 text-right" style={{ color: "var(--color-ash)" }}>
                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); if (text.trim() && !send.isPending) send.mutate(text.trim()); }}
        className="sticky bottom-0 hairline-t flex items-stretch gap-2 p-3"
        style={{ background: "var(--color-bone)", paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Transmit…"
          maxLength={4000}
          className="flex-1 hairline bg-transparent px-3 py-2 text-sm focus:outline-none"
        />
        <button type="submit" disabled={!text.trim() || send.isPending} className="btn-solid px-4 mono-tag">
          {send.isPending ? "…" : "SEND"}
        </button>
      </form>
    </div>
  );
}
