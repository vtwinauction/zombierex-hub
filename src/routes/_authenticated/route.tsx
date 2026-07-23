import * as React from "react";
import { createFileRoute, Outlet, Link } from "@tanstack/react-router";


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
  component: AuthGate,
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

function AuthGate() {
  const [state, setState] = React.useState<"checking" | "ok" | "redirecting">("checking");

  React.useEffect(() => {
    const ok = hasLocalSession();
    console.log("[AuthGate] hasLocalSession=", ok, "key=", STORAGE_KEY);
    if (ok) { setState("ok"); return; }
    // Give supabase-js a brief moment to hydrate the token on cold starts.
    const t = setTimeout(() => {
      const ok2 = hasLocalSession();
      console.log("[AuthGate] retry hasLocalSession=", ok2);
      setState(ok2 ? "ok" : "redirecting");
    }, 400);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (state === "redirecting") window.location.replace("/auth");
  }, [state]);


  if (state === "ok") return <Outlet />;
  return (
    <div className="grid min-h-svh place-items-center px-6">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--color-neon, #00c853)", borderTopColor: "transparent" }}
        />
        <p className="mono-tag" style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--color-ink-3)" }}>
          {state === "redirecting" ? "REDIRECTING" : "AUTHENTICATING"}
        </p>
      </div>
    </div>
  );
}

