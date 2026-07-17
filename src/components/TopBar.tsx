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
      className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl"
      style={{ paddingTop: "max(env(safe-area-inset-top), 0.25rem)" }}
    >
      <div className="mx-auto grid max-w-screen-sm grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {showLogo ? (
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-foreground p-1.5">
                <img src={brand.logo} alt="ZOMBIEREX" className="h-full w-full object-contain" style={{ filter: "brightness(0) invert(1)" }} />
              </span>
              <div className="min-w-0">
                <p className="font-display text-[15px] leading-none tracking-tight">ZOMBIEREX</p>
                <p className="mt-1 text-mono-caps text-muted-foreground">The moto network</p>
              </div>
            </Link>
          ) : (
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl leading-none tracking-tight">{title}</h1>
              {subtitle ? <p className="mt-1.5 text-mono-caps text-muted-foreground">{subtitle}</p> : null}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-muted">
            <Search className="h-[18px] w-[18px]" />
          </button>
          <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-muted">
            <Bell className="h-[18px] w-[18px]" />
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full ring-2 ring-background"
              style={{ background: "var(--color-primary)" }}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
