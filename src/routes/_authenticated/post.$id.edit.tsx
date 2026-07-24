import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StatusBar } from "@/components/StatusBar";
import { getMyPost, updatePost, deletePost } from "@/lib/feed.functions";
import { supabase } from "@/integrations/supabase/client";
import { compressImage, uploadWithRetry } from "@/lib/media-upload";

export const Route = createFileRoute("/_authenticated/post/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit post · ZOMBIEREX" },
      { name: "description", content: "Update the caption and media of your post." },
    ],
  }),
  component: EditPostPage,
  errorComponent: ({ error }) => (
    <div className="p-6 text-center">
      <p className="mono-tag mb-3" style={{ color: "var(--color-ink-3)" }}>POST UNAVAILABLE</p>
      <p className="text-sm mb-4" style={{ color: "var(--color-ink-0)" }}>{error.message}</p>
      <Link to="/posts/mine" className="mono-tag" style={{ color: "var(--color-neon)" }}>← Back to my posts</Link>
    </div>
  ),
});

function EditPostPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const getFn = useServerFn(getMyPost);
  const saveFn = useServerFn(updatePost);
  const delFn = useServerFn(deletePost);

  const q = useQuery({ queryKey: ["post", id, "mine"], queryFn: () => getFn({ data: { id } }), retry: false });

  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ""));
  }, []);

  useEffect(() => {
    if (!q.data) return;
    setCaption(q.data.caption ?? "");
    setMediaUrl(q.data.media_url ?? "");
  }, [q.data]);

  const save = useMutation({
    mutationFn: () =>
      saveFn({ data: { id, caption, media_url: mediaUrl } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["post", id] });
      navigate({ to: "/posts/mine" });
    },
    onError: (e: Error) => setError(e.message),
  });

  const del = useMutation({
    mutationFn: () => delFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      navigate({ to: "/posts/mine" });
    },
  });

  const pickImage = async (file: File) => {
    if (!userId) { setError("Not signed in"); return; }
    setUploading(true);
    setError(null);
    try {
      const blob = await compressImage(file);
      const res = await uploadWithRetry(blob, { userId, bucket: "posts" });
      setMediaUrl(res.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pb-24" style={{ background: "var(--color-paper-1)" }}>
      <StatusBar index="05" section="EDIT · POST" />
      <header className="flex items-center justify-between px-4 pt-4">
        <Link to="/posts/mine" className="mono-tag" style={{ color: "var(--color-ink-3)" }}>← Back</Link>
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending || uploading || q.isLoading}
          className="tap rounded-lg px-4 py-2 text-[12px] font-semibold"
          style={{ background: "var(--color-ink-0)", color: "var(--color-paper-0)", opacity: save.isPending ? 0.6 : 1 }}
        >
          {save.isPending ? "Saving…" : "Save"}
        </button>
      </header>

      <h1 className="serif px-4 pt-3 text-3xl" style={{ color: "var(--color-ink-0)" }}>Edit post</h1>

      {q.isError && (
        <div className="mx-4 mt-4 rounded-xl p-4" style={{ border: "1px solid rgba(255,80,80,0.4)", background: "rgba(255,80,80,0.05)" }}>
          <p className="mono-tag mb-1" style={{ color: "#ff6b6b" }}>NOT FOUND</p>
          <p className="text-[13px]" style={{ color: "var(--color-ink-0)" }}>
            This post no longer exists or was deleted. It may have been removed from your account.
          </p>
        </div>
      )}

      {!q.isError && (
      <section className="mt-4 px-4">
        <p className="mono-tag mb-2" style={{ color: "var(--color-ink-3)", fontSize: 10 }}>MEDIA</p>
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ aspectRatio: "4/5", border: "1px solid var(--color-line)", background: "var(--color-paper-2)" }}
        >
          {mediaUrl ? (
            <img src={mediaUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center mono-tag" style={{ color: "var(--color-ink-3)" }}>
              NO MEDIA
            </div>
          )}
          <button
            onClick={() => fileInput.current?.click()}
            className="tap absolute right-2 bottom-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold"
            style={{ background: "rgba(0,0,0,0.7)", color: "#fff" }}
          >
            {uploading ? "Uploading…" : "Replace"}
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && pickImage(e.target.files[0])}
        />
      </section>

      <section className="mt-4 space-y-4 px-4">
        <label className="block">
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[12px] font-semibold" style={{ color: "var(--color-ink-0)" }}>Caption</span>
            <span className="mono-tag" style={{ color: "var(--color-ink-3)", fontSize: 9 }}>{caption.length}/2200</span>
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={2200}
            rows={5}
            className="w-full rounded-xl p-3 text-[14px] outline-none"
            style={{ background: "var(--color-paper-0)", color: "var(--color-ink-0)", border: "1px solid var(--color-line)" }}
            placeholder="Write something…"
          />
        </label>

        {error && <p className="text-[12px]" style={{ color: "#ff6b6b" }}>{error}</p>}

        <button
          onClick={() => confirm("Delete this post?") && del.mutate()}
          className="tap w-full rounded-lg px-4 py-3 text-[13px]"
          style={{ border: "1px solid rgba(255,80,80,0.5)", color: "#ff6b6b" }}
        >
          Delete post
        </button>
      </section>
    </div>
  );
}
