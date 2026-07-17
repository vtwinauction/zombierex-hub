import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/menu")({
  head: () => ({ meta: [{ title: "Menu · ZOMBIEREX" }] }),
  component: MenuHub,
});

type Item = { to: string; label: string; hint?: string; params?: any };

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "Create",
    items: [
      { to: "/post/new", label: "New post", hint: "Photo · video · telemetry" },
      { to: "/marketplace/new", label: "New listing", hint: "Sell in the Vault" },
      { to: "/communities/create", label: "New community", hint: "Start a crew" },
    ],
  },
  {
    title: "Sell",
    items: [
      { to: "/marketplace", label: "Vault (browse)" },
      { to: "/marketplace/dashboard", label: "My listings", hint: "Analytics · manage" },
    ],
  },
  {
    title: "Explore",
    items: [
      { to: "/", label: "Feed" },
      { to: "/reels", label: "Reels" },
      { to: "/communities", label: "Crews" },
      { to: "/events", label: "Events" },
      { to: "/marketplace", label: "Vault" },
      { to: "/search", label: "Search" },
    ],
  },
  {
    title: "You",
    items: [
      { to: "/profile", label: "Garage (profile)" },
      { to: "/notifications", label: "Notifications" },
      { to: "/messages", label: "Messages" },
      { to: "/settings", label: "Settings", hint: "Account · privacy · appearance" },
    ],
  },
  {
    title: "Business",
    items: [
      { to: "/vendor", label: "Vendor dashboard" },
      { to: "/vendor/apply", label: "Apply as vendor" },
      { to: "/vendor/plans", label: "Subscription plans" },
    ],
  },
  {
    title: "Admin",
    items: [
      { to: "/admin", label: "Admin console" },
      { to: "/admin/vendors", label: "Vendor verifications" },
    ],
  },
];

function MenuHub() {
  const navigate = useNavigate();
  return (
    <div className="pb-32">
      <header className="px-5 pt-8">
        <p className="mono-tag" style={{ color: "var(--color-neon)" }}>◆ MENU</p>
        <h1 className="serif mt-2 text-4xl leading-tight" style={{ color: "var(--color-ink)" }}>
          Everything <span className="italic" style={{ color: "var(--color-neon)" }}>you can do</span>
        </h1>
      </header>

      <div className="mt-6 space-y-8 px-5">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <p className="mono-tag mb-2" style={{ color: "var(--color-silver)" }}>{s.title.toUpperCase()}</p>
            <div className="space-y-1.5">
              {s.items.map((it) => (
                <Link
                  key={it.to}
                  to={it.to as any}
                  className="tap flex items-center justify-between px-4 py-3"
                  style={{
                    background: "var(--color-graphite)",
                    border: "1px solid var(--color-hair)",
                    borderRadius: 10,
                    color: "var(--color-ink)",
                  }}
                >
                  <span className="text-[13px]">{it.label}</span>
                  {it.hint && <span className="mono-tag" style={{ color: "var(--color-silver)", fontSize: 9 }}>{it.hint}</span>}
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section>
          <p className="mono-tag mb-2" style={{ color: "var(--color-silver)" }}>ACCOUNT</p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth", replace: true });
            }}
            className="tap w-full px-4 py-3 text-left text-[13px]"
            style={{
              background: "transparent",
              border: "1px solid rgba(255,80,80,0.4)",
              borderRadius: 10,
              color: "#ff8080",
            }}
          >
            Sign out
          </button>
        </section>
      </div>
    </div>
  );
}
