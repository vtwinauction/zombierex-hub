import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SettingsScreen, Card } from "@/components/SettingsScreen";

type PrivacyPrefs = {
  private: boolean;
  allowMessages: "everyone" | "followers" | "none";
};

const KEY = "zombierex.prefs.v1";
const DEFAULTS: PrivacyPrefs = { private: false, allowMessages: "followers" };

function loadPrefs(): PrivacyPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { return DEFAULTS; }
}

function savePrefs(next: PrivacyPrefs) {
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(localStorage.getItem(KEY) || "{}");
    localStorage.setItem(KEY, JSON.stringify({ ...existing, ...next }));
  } catch {}
}

export const Route = createFileRoute("/_authenticated/settings/account-privacy")({
  head: () => ({ meta: [
    { title: "Account privacy · Settings · ZOMBIEREX" },
    { name: "description", content: "Control who can see your garage and who can message you on ZOMBIEREX." },
    { property: "og:title", content: "Account privacy · Settings · ZOMBIEREX" },
    { property: "og:description", content: "Control who can see your garage and who can message you on ZOMBIEREX." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AccountPrivacyPage,
});

function AccountPrivacyPage() {
  const [prefs, setPrefs] = useState<PrivacyPrefs>(DEFAULTS);
  useEffect(() => setPrefs(loadPrefs()), []);

  const update = (next: PrivacyPrefs) => {
    setPrefs(next);
    savePrefs(next);
  };

  return (
    <SettingsScreen index="06.04" section="PRIVACY" title="Account privacy" subtitle="Choose who can see your account and who can contact you.">
      <div className="space-y-3">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[14px]" style={{ color: "var(--color-ink)" }}>Private account</p>
              <p className="mt-1 text-[12px]" style={{ color: "var(--color-silver)" }}>Only approved followers can see your posts and garage updates.</p>
            </div>
            <Switch checked={prefs.private} onChange={(privateAccount) => update({ ...prefs, private: privateAccount })} />
          </div>
        </Card>
        <Card>
          <p className="mono-tag mb-3" style={{ color: "var(--color-silver)" }}>Who can message you</p>
          <div className="grid gap-2">
            {([
              ["everyone", "Everyone", "Any rider can start a conversation."],
              ["followers", "Followers", "Only riders you follow or approve."],
              ["none", "No one", "Close all new message requests."],
            ] as const).map(([value, label, hint]) => (
              <button
                key={value}
                onClick={() => update({ ...prefs, allowMessages: value })}
                className="tap w-full rounded-md px-3 py-3 text-left"
                style={{
                  background: prefs.allowMessages === value ? "var(--color-neon)" : "var(--color-paper-2)",
                  color: prefs.allowMessages === value ? "#000" : "var(--color-ink)",
                  border: "1px solid var(--color-hair-strong)",
                }}
              >
                <span className="block text-[13px] font-semibold">{label}</span>
                <span className="mt-0.5 block text-[11px] opacity-75">{hint}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </SettingsScreen>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="tap h-7 w-12 shrink-0 rounded-full transition-colors"
      style={{ background: checked ? "var(--color-neon)" : "var(--color-hair-strong)", position: "relative" }}
      aria-pressed={checked}
    >
      <span style={{ position: "absolute", top: 3, left: checked ? 24 : 3, height: 21, width: 21, borderRadius: 999, background: "#fff", transition: "left .16s ease" }} />
    </button>
  );
}