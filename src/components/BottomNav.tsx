import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Calendar, ShoppingBag, MessageCircle, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Item = { to: string; label: string; icon: LucideIcon };

const items: Item[] = [
  { to: "/", label: "Feed", icon: Home },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/marketplace", label: "Market", icon: ShoppingBag },
  { to: "/messages", label: "DMs", icon: MessageCircle },
  { to: "/profile", label: "Me", icon: User },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.25rem)" }}
    >
      <ul className="mx-auto grid max-w-screen-sm grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] uppercase tracking-widest transition-colors"
                style={{ color: active ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
              >
                <span
                  className="relative grid h-8 w-8 place-items-center rounded-md"
                  style={
                    active
                      ? { boxShadow: "inset 0 0 0 1px var(--color-primary)", background: "oklch(0.86 0.28 140 / 0.08)" }
                      : undefined
                  }
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span className="font-display text-[11px] tracking-[0.18em]">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
