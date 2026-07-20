import { Link, useRouterState } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { Home, Search, Play, User } from "lucide-react";

type NavItem = {
  to: "/" | "/search" | "/reels" | "/profile";
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

const LEFT: NavItem[] = [
  { to: "/",       label: "Home",   icon: Home },
  { to: "/search", label: "Search", icon: Search },
];
const RIGHT: NavItem[] = [
  { to: "/reels",   label: "Reels",   icon: Play },
  { to: "/profile", label: "Profile", icon: User },
];

/**
 * 5-tab bottom nav. Center Create button is a green old-school compose
 * (nib pen) that routes to Route Atlas POIs — riders can log a new pin
 * (hotel / resto / scenic spot) from anywhere in the app.
 * Post / photo / video composition lives in the top nav (+ icon).
 */
export function BottomNav({ hidden = false }: { hidden?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
      style={{
        transform: hidden ? "translateY(100%)" : "translateY(0)",
        background: "color-mix(in oklab, #ffffff 92%, transparent)",
        backdropFilter: "blur(20px) saturate(160%)",
        borderTop: "1px solid var(--color-line)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-center px-2 pt-1.5 pb-1.5">
        {LEFT.map((it) => <NavCell key={it.to} item={it} active={isActive(pathname, it.to)} />)}

        {/* Center — old-school compass, neon-green ZombieRex → Atlas */}
        <Link
          to="/atlas"
          aria-label="Open Route Atlas"
          className="tap mx-auto grid h-12 w-12 place-items-center"
          style={{
            borderRadius: 999,
            background: "radial-gradient(circle at 30% 25%, #172114 0%, #0a0f08 70%)",
            color: "var(--color-neon, #7cff3f)",
            boxShadow:
              "0 0 0 1px rgba(124,255,63,0.45), 0 0 14px rgba(124,255,63,0.35), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -6px 12px rgba(0,0,0,0.6)",
          }}
        >
          <CompassMark />
        </Link>

        {RIGHT.map((it) => <NavCell key={it.to} item={it} active={isActive(pathname, it.to)} />)}
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
      className="tap relative flex flex-col items-center justify-center gap-0.5 py-1.5"
      style={{ color: active ? "var(--color-ink-0)" : "var(--color-ink-3)" }}
    >
      <Icon
        className="h-[22px] w-[22px]"
        strokeWidth={active ? 2.2 : 1.75}
      />
      <span
        className="text-[10px] font-medium leading-none"
        style={{ letterSpacing: "-0.01em" }}
      >
        {item.label}
      </span>
      {active && (
        <span
          className="absolute -bottom-1 h-[3px] w-6 rounded-full"
          style={{ background: "var(--color-ink-0)" }}
        />
      )}
    </Link>
  );
}
