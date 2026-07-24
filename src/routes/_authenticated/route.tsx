import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
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
