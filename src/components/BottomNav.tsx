import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { useRef } from "react";
import { Home, Search, Play, User, Plus } from "lucide-react";

type NavItem = {
  to: "/" | "/search" | "/reels" | "/profile";
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

const LEFT: NavItem[] = [
  { to: "/",       label: "Home",   icon: Home },
  { to: "/search", label: "Search", icon: Search },
];
const RIGHT: NavItem[] = [
  { to: "/reels",   label: "Reels",   icon: Play },
  { to: "/profile", label: "Profile", icon: User },
];

/**
 * Industry-standard 5-tab bottom nav (IG / TikTok pattern).
 * Home · Search · Create (elevated center) · Reels · Profile
 * Auto-hides on scroll-down. Light editorial surface with hairline.
 */
export function BottomNav({ hidden = false }: { hidden?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const camInputRef = useRef<HTMLInputElement>(null);
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);

  function startPress() {
    longPressed.current = false;
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      camInputRef.current?.click();
    }, 380);
  }
  function endPress() {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  }
  function onCreate() {
    if (longPressed.current) { longPressed.current = false; return; }
    navigate({ to: "/post/new" });
  }
  function onCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = URL.createObjectURL(file);
      sessionStorage.setItem("zrex:capture", JSON.stringify({ url, type: file.type, name: file.name }));
    } catch {}
    navigate({ to: "/post/new" });
  }

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
      style={{
        transform: hidden ? "translateY(100%)" : "translateY(0)",
        background: "color-mix(in oklab, #ffffff 92%, transparent)",
        backdropFilter: "blur(20px) saturate(160%)",
        borderTop: "1px solid var(--color-line)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-center px-2 pt-1.5 pb-1.5">
        {LEFT.map((it) => <NavCell key={it.to} item={it} active={isActive(pathname, it.to)} />)}

        {/* Center Create — elevated */}
        <button
          type="button"
          onClick={onCreate}
          onPointerDown={startPress}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          onPointerCancel={endPress}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Create (long-press for camera)"
          className="tap mx-auto grid h-11 w-11 place-items-center"
          style={{
            borderRadius: 12,
            background: "var(--color-ink-0)",
            color: "var(--color-paper-0)",
            boxShadow: "0 6px 14px -6px rgba(0,0,0,0.35)",
          }}
        >
          <Plus size={22} strokeWidth={2.4} />
        </button>
        <input
          ref={camInputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          hidden
          onChange={onCapture}
        />

        {RIGHT.map((it) => <NavCell key={it.to} item={it} active={isActive(pathname, it.to)} />)}
      </div>
    </nav>
  );
}

function isActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname.startsWith(to);
}

function NavCell({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      aria-current={active ? "page" : undefined}
      className="tap relative flex flex-col items-center justify-center gap-0.5 py-1.5"
      style={{ color: active ? "var(--color-ink-0)" : "var(--color-ink-3)" }}
    >
      <Icon
        className="h-[22px] w-[22px]"
        strokeWidth={active ? 2.2 : 1.75}
      />
      <span
        className="text-[10px] font-medium leading-none"
        style={{ letterSpacing: "-0.01em" }}
      >
        {item.label}
      </span>
      {active && (
        <span
          className="absolute -bottom-1 h-[3px] w-6 rounded-full"
          style={{ background: "var(--color-ink-0)" }}
        />
      )}
    </Link>
  );
}
