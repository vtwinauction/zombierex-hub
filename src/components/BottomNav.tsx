import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Route as RouteIcon, Plus, Store, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Item = { to: string; label: string; icon: LucideIcon };

const left: Item[] = [
  { to: "/", label: "Hub", icon: LayoutGrid },
  { to: "/events", label: "Rides", icon: RouteIcon },
];
const right: Item[] = [
  { to: "/marketplace", label: "Market", icon: Store },
  { to: "/profile", label: "Garage", icon: User },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-background/90 p-1.5 shadow-[var(--shadow-lift)] backdrop-blur-xl">
        {left.map((i) => <NavPill key={i.to} item={i} active={isActive(i.to)} />)}

        <Link
          to="/messages"
          aria-label="Compose"
          className="mx-1 grid h-11 w-11 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-[1.05]"
          style={{ boxShadow: "var(--shadow-toxic)" }}
        >
          <Plus className="h-5 w-5" strokeWidth={2.4} />
        </Link>

        {right.map((i) => <NavPill key={i.to} item={i} active={isActive(i.to)} />)}
      </div>
    </nav>
  );
}

function NavPill({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className="group relative flex flex-col items-center gap-1 rounded-full px-3 py-1.5 transition-colors"
      style={active
        ? { color: "var(--color-foreground)" }
        : { color: "var(--color-muted-foreground)" }}
    >
      <Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.4 : 2} />
      <span className="font-display text-[10px] leading-none tracking-wide">{item.label}</span>
      {active ? <span className="absolute -bottom-0.5 h-1 w-1 rounded-full" style={{ background: "var(--color-primary)" }} /> : null}
    </Link>
  );
}
