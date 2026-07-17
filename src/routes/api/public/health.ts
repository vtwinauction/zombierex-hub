/**
 * Public health check — verifies backend is reachable.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () =>
        Response.json({
          ok: true,
          service: "zombierex",
          version: "0.3.0",
          timestamp: new Date().toISOString(),
        }),
    },
  },
});
