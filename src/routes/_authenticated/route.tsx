import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = `sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;

function hasLocalSession(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const token = parsed?.access_token ?? parsed?.currentSession?.access_token;
    const expiresAt = parsed?.expires_at ?? parsed?.currentSession?.expires_at;
    if (!token) return false;
    if (typeof expiresAt === "number" && expiresAt * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: () => {
    // Synchronous localStorage check — never hangs. supabase-js refreshes the
    // token in the background; here we just gate the render so pending never sticks.
    if (typeof window === "undefined") return {};
    if (!hasLocalSession()) {
      throw redirect({ to: "/auth" });
    }
    return {};
  },
  component: () => <Outlet />,
  pendingComponent: () => (
    <div className="grid min-h-svh place-items-center px-6">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--color-neon, #00c853)", borderTopColor: "transparent" }}
        />
        <p className="mono-tag" style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--color-ink-3)" }}>
          AUTHENTICATING
        </p>
      </div>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="grid min-h-svh place-items-center px-6">
      <div className="card-surface max-w-sm p-6 text-center">
        <p className="mono-tag" style={{ color: "var(--color-heat, #ff4d4d)" }}>ERR · AUTH</p>
        <h1 className="mt-2 text-xl">Couldn't load this page</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
          {error?.message ?? "Unknown error"}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={reset} className="btn-solid">Retry</button>
          <Link to="/" className="btn-ghost">Home</Link>
        </div>
      </div>
    </div>
  ),
});
