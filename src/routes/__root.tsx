import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SideRail } from "@/components/SideRail";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="panel clip-chamfer max-w-md p-8 text-center">
        <p className="mono-caps text-ash">ERR · 404 · SIGNAL LOST</p>
        <h1 className="font-display mt-3 text-4xl uppercase tracking-wide">Off the map</h1>
        <p className="mt-3 text-sm text-ash">This grid coordinate is empty.</p>
        <Link
          to="/"
          className="tap clip-chamfer-sm mono-caps mt-6 inline-flex items-center border border-ink bg-ink px-5 py-3 font-bold text-bone"
        >
          RETURN TO DECK
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="panel clip-chamfer max-w-md p-8 text-center">
        <p className="mono-caps text-warn">ERR · SYS FAULT</p>
        <h1 className="font-display mt-3 text-3xl uppercase tracking-wide">Backfire detected</h1>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="tap clip-chamfer-sm mono-caps border border-ink bg-signal px-5 py-3 font-bold text-ink"
          >
            RETRY
          </button>
          <a href="/" className="tap clip-chamfer-sm mono-caps border border-ink px-5 py-3 font-bold">DECK</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0d0f14" },
      { title: "ZOMBIEREX — Motorsport HUD for riders & drivers" },
      { name: "description", content: "A telemetry-grade social platform for motorcycle & car culture. Command deck, missions, arsenal, dossier." },
      { name: "author", content: "ZOMBIEREX" },
      { property: "og:site_name", content: "ZOMBIEREX" },
      { property: "og:title", content: "ZOMBIEREX — Ride. Rev. Resurrect." },
      { property: "og:description", content: "Telemetry-grade social platform for motorcycle & car culture." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@zombierex" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="grain min-h-screen bg-background text-foreground">
        <SideRail />
        <main className="ml-12 min-h-screen">
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}
