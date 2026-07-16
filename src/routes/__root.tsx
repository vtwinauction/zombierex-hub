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
import { BottomNav } from "@/components/BottomNav";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl tracking-widest text-glow-toxic" style={{ color: "var(--color-primary)" }}>404</h1>
        <h2 className="mt-4 font-display text-2xl tracking-widest">Dead End</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This road doesn&apos;t exist. Kick it into reverse.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md px-5 py-2.5 font-display text-sm tracking-widest"
            style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
          >
            BACK TO FEED
          </Link>
        </div>
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl tracking-widest">Engine Stalled</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something backfired. Try firing it up again.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md px-5 py-2.5 font-display text-sm tracking-widest"
            style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
          >
            RESTART
          </button>
          <a href="/" className="rounded-md border border-border px-5 py-2.5 font-display text-sm tracking-widest">GO HOME</a>
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
      { name: "theme-color", content: "#0a0d0a" },
      { title: "ZOMBIEREX — Social network for motorcycle & car culture" },
      { name: "description", content: "The exclusive social platform for riders, drivers, clubs, workshops and gearheads. Share builds, join rides, buy parts, connect with the automotive underground." },
      { name: "author", content: "ZOMBIEREX" },
      { property: "og:site_name", content: "ZOMBIEREX" },
      { property: "og:title", content: "ZOMBIEREX — Ride. Rev. Resurrect." },
      { property: "og:description", content: "A social network built exclusively for motorcycle and automotive culture." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@zombierex" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
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
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-screen-sm pb-24">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </QueryClientProvider>
  );
}
