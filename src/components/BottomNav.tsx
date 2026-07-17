import { Link, useRouterState } from "@tanstack/react-router";
import type { ComponentType } from "react";

type NavItem = {
  to: "/" | "/search" | "/marketplace" | "/profile";
  index: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

// Minimalist custom glyphs — hand-drawn, not lucide defaults
const HomeGlyph = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M4 20V10L12 4l8 6v10" strokeLinecap="square" />
    <path d="M10 20v-6h4v6" strokeLinecap="square" />
  </svg>
);
const CompassGlyph = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15 9l-2 6-4 0 2-6z" fill="currentColor" stroke="none" />
  </svg>
);
const CreateGlyph = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.75}>
    <path d="M12 4v16M4 12h16" strokeLinecap="square" />
  </svg>
);
const ShopGlyph = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M4 8h16l-1 12H5L4 8z" strokeLinejoin="miter" />
    <path d="M9 8V5a3 3 0 016 0v3" />
  </svg>
);
const GarageGlyph = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M3 20V9l9-5 9 5v11" strokeLinecap="square" />
    <path d="M3 12h18M3 16h18" />
  </svg>
);

const NAV: NavItem[] = [
  { to: "/",            index: "01", label: "Home",   icon: HomeGlyph },
  { to: "/search",      index: "02", label: "Discover", icon: CompassGlyph },
  { to: "/marketplace", index: "04", label: "Market", icon: ShopGlyph },
  { to: "/profile",     index: "05", label: "Garage", icon: GarageGlyph },
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
          background: "color-mix(in oklab, var(--color-bone) 88%, transparent)",
          backdropFilter: "blur(24px) saturate(140%)",
        }}
      >
        <NavCell item={NAV[0]} active={pathname === "/"} />
        <NavCell item={NAV[1]} active={pathname.startsWith("/search")} />

        {/* Center create — angular, no gradient bubble */}
        <button
          aria-label="Create"
          className="tap group relative flex h-16 items-center justify-center"
        >
          <span
            className="hairline flex h-11 w-11 items-center justify-center"
            style={{ borderColor: "var(--color-ink)" }}
          >
            <CreateGlyph className="h-5 w-5 text-ink" />
          </span>
          <span className="pointer-events-none absolute -bottom-0 mono-tag" style={{ color: "var(--color-signal-deep)" }}>03·NEW</span>
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
      style={{ color: active ? "var(--color-ink)" : "var(--color-ash)" }}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[11px] font-semibold tracking-tight">
        {item.label}
      </span>
      {active && (
        <span
          className="absolute top-1.5 h-1 w-1 rounded-full"
          style={{ background: "var(--color-signal)" }}
        />
      )}
    </Link>
  );
}

