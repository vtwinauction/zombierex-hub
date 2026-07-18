import { useEffect, useRef, useState } from "react";

export type CommentItem = {
  id: string;
  author: string;
  body: string;
  createdAt: number;
};

/**
 * Lightweight comments sheet — slides up from the bottom.
 * Uses in-memory state per targetId (persists during the session via module cache).
 * Works for both real posts and mock posts so users can always leave a comment.
 */
const store = new Map<string, CommentItem[]>();

function seed(targetId: string): CommentItem[] {
  if (store.has(targetId)) return store.get(targetId)!;
  const initial: CommentItem[] = [
    { id: "s1", author: "apex_rex", body: "Insane throttle response 🔥", createdAt: Date.now() - 3600_000 },
    { id: "s2", author: "nitro_kid", body: "What tires you running?", createdAt: Date.now() - 1800_000 },
  ];
  store.set(targetId, initial);
  return initial;
}

export function CommentsSheet({
  open,
  onClose,
  targetId,
  title = "Comments",
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  targetId: string;
  title?: string;
  onSubmitted?: () => void;
}) {

  const [items, setItems] = useState<CommentItem[]>(() => seed(targetId));
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setItems([...seed(targetId)]);
      setTimeout(() => inputRef.current?.focus(), 220);
    }
  }, [open, targetId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = () => {
    const body = text.trim();
    if (!body) return;
    const next: CommentItem = {
      id: `c${Date.now()}`,
      author: "you",
      body,
      createdAt: Date.now(),
    };
    const merged = [next, ...items];
    store.set(targetId, merged);
    setItems(merged);
    setText("");
    onSubmitted?.();
  };


  return (
    <div
      aria-hidden={!open}
      className="fixed inset-0 z-[80]"
      style={{ pointerEvents: open ? "auto" : "none" }}
    >
      {/* backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          opacity: open ? 1 : 0,
        }}
      />

      {/* sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-x-0 bottom-0 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{
          height: "82vh",
          background: "var(--color-obsidian, #08090b)",
          color: "var(--color-ink, #e6e8ec)",
          borderTop: "1px solid rgba(255,255,255,0.10)",
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          transform: open ? "translateY(0)" : "translateY(100%)",
          boxShadow: "0 -30px 80px -20px rgba(0,0,0,0.8)",
        }}
      >
        {/* grabber */}
        <div className="flex justify-center pt-2.5 pb-1">
          <span
            className="block h-1 w-10 rounded-full"
            style={{ background: "rgba(255,255,255,0.22)" }}
          />
        </div>

        {/* header */}
        <div className="flex items-center justify-between px-5 pb-3">
          <h3 className="text-[15px] font-semibold tracking-tight">
            {title}
            <span
              className="mono-num ml-2 text-[11px]"
              style={{ color: "var(--color-silver, #8b8f97)" }}
            >
              {items.length}
            </span>
          </h3>
          <button
            onClick={onClose}
            aria-label="Close comments"
            className="tap grid h-8 w-8 place-items-center rounded-full"
            style={{ background: "rgba(255,255,255,0.06)", color: "var(--color-ink)" }}
          >
            ✕
          </button>
        </div>

        <div
          aria-hidden
          className="mx-5 h-px"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />

        {/* list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {items.length === 0 && (
            <p className="pt-10 text-center text-[13px]" style={{ color: "var(--color-silver, #8b8f97)" }}>
              Be the first to comment.
            </p>
          )}
          {items.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold"
                style={{
                  background: "linear-gradient(135deg,#2a2d34,#14161a)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                {c.author.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-[13px] font-semibold">{c.author}</span>
                  <span className="mono-num text-[10px]" style={{ color: "var(--color-silver, #8b8f97)" }}>
                    {timeAgo(c.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-[13.5px] leading-snug" style={{ color: "var(--color-ink, #e6e8ec)" }}>
                  {c.body}
                </p>
                <div className="mt-1 flex gap-4 text-[11px]" style={{ color: "var(--color-silver, #8b8f97)" }}>
                  <button className="tap">Reply</button>
                  <button className="tap">Like</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* composer */}
        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className="flex items-center gap-2 px-4 pt-3"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(8,9,11,0.95)",
          }}
        >
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            enterKeyHint="send"
            autoComplete="off"
            autoCapitalize="sentences"
            inputMode="text"
            className="flex-1 rounded-full px-4 py-3 text-[15px] outline-none"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "var(--color-ink)",
              border: "1px solid rgba(255,255,255,0.14)",
              WebkitAppearance: "none",
            }}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="tap px-4 py-3 text-[13px] font-semibold"
            style={{
              borderRadius: 999,
              background: text.trim() ? "var(--color-neon, #c6ff3d)" : "rgba(255,255,255,0.08)",
              color: text.trim() ? "var(--color-obsidian, #08090b)" : "var(--color-silver, #8b8f97)",
              transition: "all 160ms ease",
            }}
          >
            Post
          </button>
        </form>

      </div>
    </div>
  );
}

function timeAgo(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}
