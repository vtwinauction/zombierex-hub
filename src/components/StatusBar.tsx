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
          <img src={brand.logo} alt="" className="h-6 w-6 object-contain" />
          <div className="flex flex-col leading-none">
            <span className="mono-tag" style={{ letterSpacing: "0.28em" }}>SEC·{index}</span>
            <span className="mono-caps" style={{ color: "var(--color-ink)" }}>{section}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/notifications" className="tap hairline flex h-9 w-9 items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.4}>
              <path d="M6 8a6 6 0 1112 0v6l2 3H4l2-3V8z" strokeLinecap="square" />
              <path d="M10 20a2 2 0 004 0" />
            </svg>
            <span className="sr-only">Signals</span>
          </Link>
          <Link to="/messages" className="tap hairline flex h-9 w-9 items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.4}>
              <path d="M4 5h16v12H8l-4 4V5z" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
            <span className="sr-only">Transmissions</span>
          </Link>
        </div>
      </div>
      {/* signal tick */}
      <div className="flex h-[2px]">
        <div className="w-8" style={{ background: "var(--color-signal)" }} />
        <div className="flex-1" />
      </div>
    </header>
  );
}
