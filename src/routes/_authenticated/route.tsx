import * as React from "react";
import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";


function getAuthStorageKeys(): string[] {
  const refs = new Set<string>();
  const configuredRef = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const configuredUrl = import.meta.env.VITE_SUPABASE_URL;

  if (typeof configuredRef === "string" && configuredRef.length > 0) {
    refs.add(configuredRef);
  }

  if (typeof configuredUrl === "string" && configuredUrl.length > 0) {
    try {
      const hostRef = new URL(configuredUrl).hostname.split(".")[0];
      if (hostRef) refs.add(hostRef);
    } catch {
      // Ignore malformed env values and fall back to scanning localStorage.
    }
  }

  return Array.from(refs).map((ref) => `sb-${ref}-auth-token`);
}

function isUsableSession(raw: string | null): boolean {
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    const session = parsed?.currentSession ?? parsed;
    const token = session?.access_token;
    const expiresAt = session?.expires_at;
    if (!token) return false;
    if (typeof expiresAt === "number" && expiresAt * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

function hasLocalSession(): boolean {
  try {
    const configuredKeys = getAuthStorageKeys();
    if (configuredKeys.some((key) => isUsableSession(localStorage.getItem(key)))) {
      return true;
    }

    return Object.keys(localStorage)
      .filter((key) => /^sb-.+-auth-token$/.test(key))
      .some((key) => isUsableSession(localStorage.getItem(key)));
  } catch {
    return false;
  }
}

async function hasClientSession(): Promise<boolean> {
  if (hasLocalSession()) return true;

  const sessionCheck = supabase.auth
    .getSession()
    .then(({ data }) => Boolean(data.session?.access_token))
    .catch(() => false);
  const timeout = new Promise<boolean>((resolve) => window.setTimeout(() => resolve(false), 1200));

  return Promise.race([sessionCheck, timeout]);
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
  const navigate = useNavigate();
  const [state, setState] = React.useState<"checking" | "ok" | "redirecting">("checking");

  React.useEffect(() => {
    let canceled = false;

    async function verify() {
      if (await hasClientSession()) {
        if (!canceled) setState("ok");
        return;
      }

      const retry = window.setTimeout(async () => {
        if (canceled) return;
        setState((await hasClientSession()) ? "ok" : "redirecting");
      }, 500);

      return () => window.clearTimeout(retry);
    }

    let cleanup: void | (() => void);
    void verify().then((fn) => {
      cleanup = fn;
    });

    return () => {
      canceled = true;
      cleanup?.();
    };
  }, []);

  React.useEffect(() => {
    if (state === "redirecting") navigate({ to: "/auth", replace: true });
  }, [navigate, state]);


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

