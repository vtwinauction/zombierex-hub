import { Link } from "@tanstack/react-router";
import { Bell, Search, Menu } from "lucide-react";

/**
 * Editorial masthead — light glass, wordmark left, system actions right.
 * Section eyebrow (e.g. № 03 · ATLAS) sits under the wordmark.
 * Camera/Plus moved to the bottom-nav Create button.
 */
export function StatusBar({ index, section }: { index: string; section: string }) {
  return (
    <header
      className="sticky top-0 z-40"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        background: "color-mix(in oklab, #ffffff 88%, transparent)",
        backdropFilter: "blur(20px) saturate(160%)",
        borderBottom: "1px solid var(--color-line)",
      }}
    >
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3">
        <Link to="/" className="tap flex flex-col leading-none">
          <span
            className="serif text-[20px]"
            style={{
              color: "var(--color-ink-0)",
              letterSpacing: "-0.03em",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            ZOMBIEREX
          </span>
          <span
            className="mono-tag mt-1.5"
            style={{ fontSize: 9, letterSpacing: "0.28em", color: "var(--color-ink-3)" }}
          >
            № {index} · {friendlyLabel(section)}
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <ActionCell to="/search" label="Search">
            <Search size={18} strokeWidth={1.75} />
          </ActionCell>
          <ActionCell to="/notifications" label="Notifications" pulse>
            <Bell size={18} strokeWidth={1.75} />
          </ActionCell>
          <ActionCell to="/menu" label="Menu">
            <Menu size={18} strokeWidth={1.9} />
          </ActionCell>
        </div>
      </div>
    </header>
  );
}

function ActionCell({
  to, label, children, pulse,
}: { to: string; label: string; children: React.ReactNode; pulse?: boolean }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="tap relative grid h-10 w-10 place-items-center"
      style={{ color: "var(--color-ink-0)", borderRadius: 10 }}
    >
      {children}
      {pulse && (
        <span
          className="absolute right-2 top-2 h-[7px] w-[7px] rounded-full"
          style={{
            background: "var(--color-neon)",
            boxShadow: "0 0 0 2px #fff",
          }}
        />
      )}
    </Link>
  );
}

function friendlyLabel(section: string) {
  const map: Record<string, string> = {
    "HOME · TRANSMISSION": "Home",
    "VAULT · MARKETPLACE": "Marketplace",
    "GARAGE · PROFILE": "Profile",
    "GARAGE · OPERATOR": "Profile",
    "SIGNAL · SEARCH": "Search",
    "OPS · EVENTS": "Events",
    "COMMS · MESSAGES": "Messages",
    "LOG · NOTIFICATIONS": "Notifications",
    "03 · ATLAS": "Atlas",
  };
  return map[section] ?? section;
}
