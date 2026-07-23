import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // getSession() is local-only, but can occasionally stall behind the
    // Supabase client's internal lock (token refresh in another tab, etc).
    // Cap it so the pending screen can never stick — fall through to /auth.
    const session = await Promise.race([
      supabase.auth.getSession().then(({ data }) => data.session),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
    ]);
    if (!session) {
      throw redirect({ to: "/auth" });
    }
    return { user: session.user };
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
