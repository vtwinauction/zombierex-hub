import { Link, useRouterState } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { IconGarage, IconDiscover, IconMarket, IconHelmet, IconBoltCross } from "./icons/RexIcons";

type NavItem = {
  to: "/" | "/search" | "/marketplace" | "/profile";
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const NAV: NavItem[] = [
  { to: "/",            label: "Garage",    icon: IconGarage },
  { to: "/search",      label: "Discover",  icon: IconDiscover },
  { to: "/marketplace", label: "Vault",     icon: IconMarket },
  { to: "/profile",     label: "Rider",     icon: IconHelmet },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className="hairline-t grid grid-cols-5 items-center"
        style={{
          background: "color-mix(in oklab, #ffffff 90%, transparent)",
          backdropFilter: "blur(24px) saturate(160%)",
          borderTop: "1px solid var(--color-hair)",
          boxShadow: "0 -6px 20px -12px rgba(14,15,17,0.15)",
        }}
      >
        <NavCell item={NAV[0]} active={pathname === "/"} />
        <NavCell item={NAV[1]} active={pathname.startsWith("/search")} />

        {/* Center CREATE — CNC bolt-cross floating action */}
        <button
          aria-label="Create"
          className="tap group relative flex h-16 items-center justify-center"
        >
          <span
            className="engine-pulse relative flex h-14 w-14 items-center justify-center"
            style={{
              clipPath: "polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)",
              background: "linear-gradient(180deg, #1a1c20 0%, #0e0f11 100%)",
              color: "var(--color-neon)",
              boxShadow: "0 8px 22px -8px rgba(14,15,17,0.55), inset 0 1px 0 rgba(255,255,255,0.08)",
              border: "1px solid #000",
            }}
          >
            <IconBoltCross size={22} />
            <span className="bolt absolute left-1 top-1" />
            <span className="bolt absolute right-1 top-1" />
            <span className="bolt absolute left-1 bottom-1" />
            <span className="bolt absolute right-1 bottom-1" />
          </span>
        </button>

        <NavCell item={NAV[2]} active={pathname.startsWith("/marketplace")} />
        <NavCell item={NAV[3]} active={pathname.startsWith("/profile")} />
      </div>
    </nav>
  );
}

function NavCell({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      aria-current={active ? "page" : undefined}
      className="tap relative flex h-16 flex-col items-center justify-center gap-1"
      style={{ color: active ? "var(--color-matte)" : "var(--color-titanium)" }}
    >
      <Icon className="h-[22px] w-[22px]" />
      <span
        className="mono-caps"
        style={{ fontSize: 9, letterSpacing: "0.16em" }}
      >
        {item.label}
      </span>
      {active && (
        <span
          className="absolute bottom-1 h-[3px] w-6 rounded-full"
          style={{ background: "var(--color-neon)", boxShadow: "0 0 8px rgba(182,255,60,0.7)" }}
        />
      )}
    </Link>
  );
}
