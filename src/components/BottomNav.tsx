import { Link, useRouterState } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { IconGarage, IconDiscover, IconMarket, IconHelmet, IconBoltCross } from "./icons/RexIcons";

type NavItem = {
  to: "/" | "/search" | "/marketplace" | "/profile";
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const TOP: NavItem[] = [
  { to: "/",            label: "Feed",    icon: IconGarage },
  { to: "/search",      label: "Signal",  icon: IconDiscover },
];
const BOTTOM: NavItem[] = [
  { to: "/marketplace", label: "Vault",   icon: IconMarket },
  { to: "/profile",     label: "Garage",  icon: IconHelmet },
];

/**
 * Vertical right-side navigation rail.
 * Floating obsidian pill anchored to the right edge, safe-area aware.
 */
export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Primary"
      className="fixed right-0 top-1/2 z-50 -translate-y-1/2 pointer-events-none"
      style={{ paddingRight: "calc(env(safe-area-inset-right) + 10px)" }}
    >
      <div
        className="glass lift-2 pointer-events-auto flex flex-col items-center gap-1 px-2 py-2"
        style={{
          borderRadius: 999,
          border: "1px solid var(--color-hair-strong)",
        }}
      >
        {TOP.map((it) => (
          <NavCell key={it.to} item={it} active={isActive(pathname, it.to)} />
        ))}

        {/* Central CREATE bolt */}
        <button
          aria-label="Create"
          className="tap group relative my-1 grid h-12 w-12 place-items-center"
          style={{
            borderRadius: 999,
            background: "linear-gradient(180deg, #dbff8b 0%, #c6ff3d 55%, #7ee01c 100%)",
            color: "var(--color-obsidian)",
            boxShadow: "0 10px 26px -10px rgba(198,255,61,0.7), inset 0 1px 0 rgba(255,255,255,0.5)",
            border: "1px solid #6bb318",
          }}
        >
          <IconBoltCross size={20} />
          <span className="engine-pulse absolute inset-0 rounded-full" />
        </button>

        {BOTTOM.map((it) => (
          <NavCell key={it.to} item={it} active={isActive(pathname, it.to)} />
        ))}
      </div>
    </nav>
  );
}

function isActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname.startsWith(to);
}

function NavCell({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      className="tap relative grid h-12 w-12 place-items-center"
      style={{
        borderRadius: 999,
        color: active ? "var(--color-neon)" : "var(--color-silver)",
        background: active ? "rgba(198,255,61,0.08)" : "transparent",
      }}
    >
      <Icon className="h-[19px] w-[19px]" />
    </Link>
  );
}
