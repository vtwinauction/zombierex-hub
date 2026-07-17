import { Link, useRouterState } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { IconGarage, IconDiscover, IconMarket, IconHelmet, IconBoltCross } from "./icons/RexIcons";

type NavItem = {
  to: "/" | "/search" | "/communities" | "/marketplace" | "/profile" | "/vendor";
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const LEFT: NavItem[] = [
  { to: "/",            label: "Feed",     icon: IconGarage },
  { to: "/communities", label: "Crews",    icon: IconDiscover },
];
const RIGHT: NavItem[] = [
  { to: "/marketplace", label: "Vault",    icon: IconMarket },
  { to: "/profile",     label: "Garage",   icon: IconHelmet },
];


/**
 * Floating obsidian dock — not a full-width tab bar.
 * A pill-island with a raised neon "create" bolt at center-left offset.
 */
export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 14px)" }}
    >
      <div
        className="glass lift-2 pointer-events-auto flex items-center gap-1 px-2 py-2"
        style={{
          borderRadius: 999,
          border: "1px solid var(--color-hair-strong)",
        }}
      >
        {LEFT.map((it) => (
          <NavCell key={it.to} item={it} active={isActive(pathname, it.to)} />
        ))}

        {/* Central CREATE bolt */}
        <button
          aria-label="Create"
          className="tap group relative mx-1 grid h-12 w-12 place-items-center"
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

        {RIGHT.map((it) => (
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
      className="tap relative grid h-11 w-14 place-items-center"
      style={{
        borderRadius: 999,
        color: active ? "var(--color-neon)" : "var(--color-silver)",
        background: active ? "rgba(198,255,61,0.08)" : "transparent",
      }}
    >
      <Icon className="h-[19px] w-[19px]" />
      <span className="mono-caps absolute -bottom-0.5 hidden" style={{ fontSize: 8 }}>{item.label}</span>
    </Link>
  );
}
