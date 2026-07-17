import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Store, User, Plus } from "lucide-react";
import type { ComponentType } from "react";

type NavItem = {
  to: "/" | "/search" | "/marketplace" | "/profile";
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

const NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Explore", icon: Compass },
  { to: "/marketplace", label: "Market", icon: Store },
  { to: "/profile", label: "Garage", icon: User },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const left = NAV.slice(0, 2);
  const right = NAV.slice(2);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(env(safe-area-inset-bottom),12px)] pt-1"
    >
      <div className="glass flex items-center gap-1 rounded-full px-2 py-2 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.35)]">
        {left.map((item) => (
          <NavButton key={item.to} item={item} active={item.to === "/" ? pathname === "/" : pathname.startsWith(item.to)} />
        ))}

        {/* Center create button */}
        <button
          aria-label="Create"
          className="tap relative mx-1 grid h-12 w-12 place-items-center rounded-full text-ink"
          style={{
            background: "linear-gradient(135deg, var(--color-signal), var(--color-signal-deep))",
            boxShadow: "0 10px 24px -6px color-mix(in oklab, var(--color-signal) 60%, transparent)",
          }}
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
          <span className="pulse-ring pointer-events-none absolute inset-0 rounded-full" />
        </button>

        {right.map((item) => (
          <NavButton key={item.to} item={item} active={item.to === "/" ? pathname === "/" : pathname.startsWith(item.to)} />
        ))}
      </div>
    </nav>
  );
}

function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      aria-current={active ? "page" : undefined}
      className={`tap relative flex h-12 w-14 flex-col items-center justify-center rounded-full transition-colors ${
        active ? "text-ink" : "text-ash"
      }`}
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.8} />
      <span className={`mt-0.5 text-[10px] font-semibold tracking-wide ${active ? "opacity-100" : "opacity-60"}`}>
        {item.label}
      </span>
      {active && (
        <span
          className="absolute -bottom-0.5 h-1 w-1 rounded-full"
          style={{ background: "var(--color-signal-deep)" }}
        />
      )}
    </Link>
  );
}
