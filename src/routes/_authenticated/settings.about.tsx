import { createFileRoute, Link } from "@tanstack/react-router";
import { SettingsScreen, Card } from "@/components/SettingsScreen";

export const Route = createFileRoute("/_authenticated/settings/about")({
  head: () => ({ meta: [{ title: "About · ZOMBIEREX" }, { name: "description", content: "App version, build and credits for ZOMBIEREX." }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SettingsScreen index="06.13" section="ABOUT" title="About ZOMBIEREX" subtitle="The world's premium platform for motorcycle and automotive culture.">
      <div className="space-y-3">
        <Card>
          <div className="grid grid-cols-2 gap-y-2 text-[13px]">
            <span style={{ color: "var(--color-silver)" }}>Version</span><span style={{ color: "var(--color-ink)" }}>1.0.0</span>
            <span style={{ color: "var(--color-silver)" }}>Build</span><span style={{ color: "var(--color-ink)" }}>“Signal”</span>
            <span style={{ color: "var(--color-silver)" }}>Channel</span><span style={{ color: "var(--color-ink)" }}>Stable</span>
            <span style={{ color: "var(--color-silver)" }}>Released</span><span style={{ color: "var(--color-ink)" }}>2026</span>
          </div>
        </Card>
        <Card>
          <p className="serif text-[16px] italic" style={{ color: "var(--color-ink)" }}>Credits</p>
          <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--color-silver)" }}>
            Built by riders for riders. Design language inspired by Apple, Porsche, DJI and Tesla.
            Powered by Lovable Cloud, TanStack Start, Google Maps and Gemini AI.
          </p>
        </Card>
        <Card>
          <div className="flex flex-wrap gap-3 text-[13px]">
            <Link to="/settings/terms" style={{ color: "var(--color-neon)" }}>Terms of service</Link>
            <Link to="/settings/privacy" style={{ color: "var(--color-neon)" }}>Privacy policy</Link>
            <Link to="/settings/help" style={{ color: "var(--color-neon)" }}>Help centre</Link>
          </div>
        </Card>
      </div>
    </SettingsScreen>
  );
}
