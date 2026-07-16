import { Link } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";
import { brand } from "@/lib/mock-data";

type Props = {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
};

export function TopBar({ title, subtitle, showLogo }: Props) {
  return (
    <header
      className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl"
      style={{ paddingTop: "max(env(safe-area-inset-top), 0.25rem)" }}
    >
      <div className="mx-auto flex max-w-screen-sm items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {showLogo ? (
            <Link to="/" className="flex items-center gap-2">
              <img src={brand.logo} alt="ZOMBIEREX" className="h-9 w-9 shrink-0 object-contain drop-shadow-[0_0_10px_rgba(124,255,61,0.35)]" />
              <span className="font-display text-2xl leading-none tracking-[0.14em] text-glow-toxic" style={{ color: "var(--color-primary)" }}>
                ZOMBIEREX
              </span>
            </Link>
          ) : (
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl leading-none tracking-[0.14em]">{title}</h1>
              {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button aria-label="Search" className="grid h-10 w-10 place-items-center rounded-md text-foreground/80 transition-colors hover:bg-muted">
            <Search className="h-5 w-5" />
          </button>
          <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-md text-foreground/80 transition-colors hover:bg-muted">
            <Bell className="h-5 w-5" />
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full"
              style={{ background: "var(--color-destructive)", boxShadow: "0 0 8px oklch(0.62 0.25 27 / 0.9)" }}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
