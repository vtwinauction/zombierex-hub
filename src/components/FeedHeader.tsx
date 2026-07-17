import { Search, Bell, MessagesSquare } from "lucide-react";
import { Link } from "@tanstack/react-router";
import brandLogo from "@/assets/zombierex-logo.png.asset.json";

export function FeedHeader({ dark = false }: { dark?: boolean }) {
  const cls = dark ? "text-white" : "text-ink";
  const iconBtn = dark
    ? "bg-white/12 text-white backdrop-blur-md"
    : "glass text-ink";
  return (
    <header className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 pb-3 pt-[max(env(safe-area-inset-top),12px)] ${cls}`}>
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-full ring-2 ring-white/60">
          <img src={brandLogo.url} alt="ZOMBIEREX" className="h-full w-full object-cover" />
        </div>
        <div className="leading-tight">
          <p className={`font-display text-[15px] font-bold tracking-tight ${dark ? "text-white" : "text-ink"}`}>ZOMBIEREX</p>
          <p className={`text-[10px] font-medium ${dark ? "text-white/70" : "text-ash"}`}>For You · Following · Nearby</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/search" className={`tap grid h-9 w-9 place-items-center rounded-full ${iconBtn}`} aria-label="Search">
          <Search className="h-[18px] w-[18px]" />
        </Link>
        <Link to="/notifications" className={`tap grid h-9 w-9 place-items-center rounded-full ${iconBtn}`} aria-label="Notifications">
          <Bell className="h-[18px] w-[18px]" />
        </Link>
        <Link to="/messages" className={`tap grid h-9 w-9 place-items-center rounded-full ${iconBtn}`} aria-label="Messages">
          <MessagesSquare className="h-[18px] w-[18px]" />
        </Link>
      </div>
    </header>
  );
}
