import { Link } from "@tanstack/react-router";
import { brand } from "@/lib/mock-data";

/**
 * Top status bar — appears on every route.
 * Displays serial number, brand mark, and quick actions in a hairline strip.
 */
export function StatusBar({ index, section }: { index: string; section: string }) {
  return (
    <header
      className="hairline-b sticky top-0 z-40"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        background: "color-mix(in oklab, var(--color-bone) 88%, transparent)",
        backdropFilter: "blur(20px) saturate(140%)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={brand.logo} alt="" className="h-8 w-8 rounded-full object-contain" />
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-bold tracking-tight">ZOMBIEREX</span>
            <span className="text-[11px]" style={{ color: "var(--color-ash)" }}>{friendlyLabel(section)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/notifications" className="tap flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--color-mist)" }}>
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path d="M6 8a6 6 0 1112 0v6l2 3H4l2-3V8z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 20a2 2 0 004 0" strokeLinecap="round" />
            </svg>
            <span className="sr-only">Notifications</span>
          </Link>
          <Link to="/messages" className="tap flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--color-mist)" }}>
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H9l-5 4V6z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="sr-only">Messages</span>
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

