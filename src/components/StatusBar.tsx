import { Link } from "@tanstack/react-router";
import { brand } from "@/lib/mock-data";
import { Bell, MessageCircle } from "lucide-react";

/**
 * Editorial masthead — sticky, glassy obsidian bar.
 * Serif wordmark + technical spine index + system actions.
 */
export function StatusBar({ index, section }: { index: string; section: string }) {
  return (
    <header
      className="glass sticky top-0 z-40"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
      }}
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3">
        <Link to="/" className="tap flex items-center gap-2.5">
          <div
            className="grid h-9 w-9 place-items-center overflow-hidden"
            style={{
              clipPath: "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)",
              background: "linear-gradient(180deg, #1a1c22 0%, #08090b 100%)",
              border: "1px solid var(--color-hair-strong)",
            }}
          >
            <img src={brand.logo} alt="" className="h-full w-full object-cover opacity-90" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="serif text-[22px] italic" style={{ color: "var(--color-ink)", lineHeight: 0.9 }}>
              Zombierex
            </span>
            <span className="mono-tag mt-[3px]" style={{ color: "var(--color-titanium)", fontSize: 8.5, letterSpacing: "0.28em" }}>
              № {index} · {friendlyLabel(section)}
            </span>
          </div>
        </Link>

        <div />

        <div className="flex items-center gap-1.5">
          <ActionCell to="/notifications" label="Notifications" pulse>
            <IconEnginePulse size={17} />
          </ActionCell>
          <ActionCell to="/messages" label="Messages">
            <IconGauge size={17} />
          </ActionCell>
        </div>
      </div>
      <div className="etch mx-4" />
    </header>
  );
}

function ActionCell({ to, label, children, pulse }: { to: string; label: string; children: React.ReactNode; pulse?: boolean }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="tap relative grid h-10 w-10 place-items-center"
      style={{
        background: "var(--color-graphite)",
        border: "1px solid var(--color-hair-strong)",
        color: "var(--color-ink)",
        borderRadius: 3,
      }}
    >
      {children}
      {pulse && (
        <span
          className="engine-pulse absolute right-1.5 top-1.5 h-[6px] w-[6px] rounded-full"
          style={{ background: "var(--color-neon)" }}
        />
      )}
    </Link>
  );
}

function friendlyLabel(section: string) {
  const map: Record<string, string> = {
    "HOME · TRANSMISSION": "Broadcast",
    "VAULT · MARKETPLACE": "The Vault",
    "GARAGE · PROFILE": "Digital garage",
    "GARAGE · OPERATOR": "Digital garage",
    "SIGNAL · SEARCH": "Signal",
    "OPS · EVENTS": "Operations",
    "COMMS · MESSAGES": "Comms",
    "LOG · NOTIFICATIONS": "System log",
  };
  return map[section] ?? section;
}
