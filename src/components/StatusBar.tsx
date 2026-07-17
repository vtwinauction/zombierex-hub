import { Link } from "@tanstack/react-router";
import { brand } from "@/lib/mock-data";
import { IconEnginePulse, IconGauge } from "./icons/RexIcons";

/**
 * Top status bar — appears on every route.
 * Hairline strip with brand mark, section label, and system actions using custom icons.
 */
export function StatusBar({ index, section }: { index: string; section: string }) {
  return (
    <header
      className="hairline-b sticky top-0 z-40"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        background: "color-mix(in oklab, #ffffff 92%, transparent)",
        backdropFilter: "blur(20px) saturate(160%)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="grid h-9 w-9 place-items-center overflow-hidden"
            style={{
              clipPath: "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)",
              background: "linear-gradient(180deg, #0e0f11 0%, #22252b 100%)",
            }}
          >
            <img src={brand.logo} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-[15px] font-bold tracking-tight" style={{ color: "var(--color-matte)" }}>
              ZOMBIEREX
              <span className="mono-caps ml-1 align-middle" style={{ color: "var(--color-neon-deep)", fontSize: 8 }}>
                {index}
              </span>
            </span>
            <span className="mono-tag" style={{ color: "var(--color-titanium)", fontSize: 9.5, letterSpacing: "0.14em" }}>
              {friendlyLabel(section)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/notifications"
            className="tap relative flex h-10 w-10 items-center justify-center"
            style={{
              clipPath: "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)",
              background: "var(--color-platinum)",
              border: "1px solid var(--color-hair)",
              color: "var(--color-matte)",
            }}
            aria-label="Notifications"
          >
            <IconEnginePulse size={18} />
            <span
              className="engine-pulse absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
              style={{ background: "var(--color-neon)" }}
            />
          </Link>
          <Link
            to="/messages"
            className="tap flex h-10 w-10 items-center justify-center"
            style={{
              clipPath: "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)",
              background: "var(--color-platinum)",
              border: "1px solid var(--color-hair)",
              color: "var(--color-matte)",
            }}
            aria-label="Messages"
          >
            <IconGauge size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function friendlyLabel(section: string) {
  const map: Record<string, string> = {
    "HOME · TRANSMISSION": "Welcome back",
    "VAULT · MARKETPLACE": "Marketplace",
    "GARAGE · PROFILE": "Your garage",
    "SIGNAL · SEARCH": "Discover",
    "OPS · EVENTS": "Events",
    "COMMS · MESSAGES": "Messages",
    "LOG · NOTIFICATIONS": "Notifications",
  };
  return map[section] ?? section;
}
