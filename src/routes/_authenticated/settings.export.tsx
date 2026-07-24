import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SettingsScreen, Card, PrimaryButton } from "@/components/SettingsScreen";

export const Route = createFileRoute("/_authenticated/settings/export")({
  head: () => ({ meta: [{ title: "Download your data · Settings · ZOMBIEREX" }, { name: "description", content: "Export a copy of your ZOMBIEREX information as JSON." }] }),
  component: ExportPage,
});

function ExportPage() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const download = async () => {
    setBusy(true); setMsg(null);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      const uid = user?.id ?? "";

      const safe = async (fn: () => any) => { try { const r = await fn(); return r?.data ?? null; } catch { return null; } };
      const sb = supabase as any;
      const [profile, posts, vehicles, routes, listings, dragRuns] = await Promise.all([
        safe(() => sb.from("profiles").select("*").eq("id", uid).maybeSingle()),
        safe(() => sb.from("posts").select("*").eq("author_id", uid)),
        safe(() => sb.from("vehicles").select("*").eq("owner_id", uid)),
        safe(() => sb.from("routes").select("*").eq("owner_id", uid)),
        safe(() => sb.from("listings").select("*").eq("seller_id", uid)),
        safe(() => sb.from("drag_runs").select("*").eq("user_id", uid)),
      ]);

      const prefs: Record<string, unknown> = {};
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("zombierex.")) prefs[k] = JSON.parse(localStorage.getItem(k) || "null");
        }
      } catch {}

      const bundle = {
        exportedAt: new Date().toISOString(),
        user: user ? { id: user.id, email: user.email, created_at: user.created_at } : null,
        profile, posts, vehicles, routes, listings, dragRuns, prefs,
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `zombierex-export-${uid.slice(0, 8) || "me"}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      setMsg("Export ready — check your downloads.");
    } catch (e: any) {
      setMsg(e?.message ?? "Export failed.");
    } finally { setBusy(false); }
  };

  return (
    <SettingsScreen index="06.10" section="EXPORT" title="Download your data" subtitle="Get a JSON copy of your profile, posts, garage, routes and preferences.">
      <Card>
        <p className="text-[13px]" style={{ color: "var(--color-silver)" }}>
          The file only includes rows you have permission to read. Media files stay on the platform.
        </p>
        <div className="mt-4">
          <PrimaryButton onClick={download} disabled={busy}>{busy ? "Preparing…" : "Download JSON"}</PrimaryButton>
        </div>
        {msg && <p className="mt-2 text-[12px]" style={{ color: "var(--color-neon)" }}>{msg}</p>}
      </Card>
    </SettingsScreen>
  );
}
