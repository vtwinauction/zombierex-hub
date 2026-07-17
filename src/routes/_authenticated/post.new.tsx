import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { StatusBar } from "@/components/StatusBar";
import { createPost } from "@/lib/feed.functions";

export const Route = createFileRoute("/_authenticated/post/new")({
  head: () => ({ meta: [{ title: "New post · ZOMBIEREX" }] }),
  component: NewFeedPost,
});

function NewFeedPost() {
  const navigate = useNavigate();
  const post = useServerFn(createPost);
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState("");
  const [kind, setKind] = useState<"photo" | "video" | "telemetry">("photo");

  const mut = useMutation({
    mutationFn: () => post({ data: {
      kind,
      caption: caption || undefined,
      media_url: media || undefined,
      thumbnail_url: media || undefined,
      is_reel: kind === "video",
    } }),
    onSuccess: () => navigate({ to: "/" }),
  });

  return (
    <div className="pb-24">
      <StatusBar index="00" section="COMPOSE · POST" />
      <div className="px-4 pt-4">
        <Link to="/" className="mono-tag" style={{ color: "var(--color-titanium)" }}>← Back</Link>
        <h1 className="serif mt-2 text-[26px] italic" style={{ color: "var(--color-ink)" }}>New post</h1>

        <div className="mt-6 space-y-4">
          <div>
            <p className="mono-tag mb-1.5" style={{ color: "var(--color-neon)", fontSize: 10 }}>KIND</p>
            <div className="flex gap-1.5">
              {(["photo", "video", "telemetry"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className="tap px-3 py-1.5 text-[11px] uppercase tracking-wider"
                  style={{
                    borderRadius: 999,
                    background: kind === k ? "var(--color-neon)" : "transparent",
                    color: kind === k ? "var(--color-obsidian)" : "var(--color-ink)",
                    border: "1px solid var(--color-hair-strong)",
                  }}
                >{k}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="mono-tag mb-1.5" style={{ color: "var(--color-neon)", fontSize: 10 }}>CAPTION</p>
            <textarea
              value={caption} onChange={(e) => setCaption(e.target.value)}
              rows={5} maxLength={2200}
              placeholder="What's on the road?"
              className="w-full resize-none rounded-lg px-3 py-2 text-[13px]"
              style={{ background: "var(--color-graphite)", color: "var(--color-ink)", border: "1px solid var(--color-hair)" }}
            />
          </div>

          <div>
            <p className="mono-tag mb-1.5" style={{ color: "var(--color-neon)", fontSize: 10 }}>MEDIA URL (optional)</p>
            <input
              value={media} onChange={(e) => setMedia(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-lg px-3 py-2 text-[12px]"
              style={{ background: "var(--color-graphite)", color: "var(--color-ink)", border: "1px solid var(--color-hair)" }}
            />
          </div>

          {mut.error && <p className="text-[12px]" style={{ color: "#ff8080" }}>{(mut.error as Error).message}</p>}

          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending || (!caption && !media)}
            className="tap w-full rounded-full py-3 text-[12px] font-bold uppercase tracking-wider"
            style={{ background: "var(--color-neon)", color: "var(--color-obsidian)", letterSpacing: "0.14em", opacity: mut.isPending ? 0.5 : 1 }}
          >
            {mut.isPending ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
