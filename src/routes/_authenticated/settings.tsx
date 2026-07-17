import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBar } from "@/components/StatusBar";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings · ZOMBIEREX" }, { name: "description", content: "Manage your ZOMBIEREX account, privacy, notifications and app preferences." }] }),
  component: SettingsPage,
});

type Prefs = {
  theme: "dark" | "light" | "system";
  language: "en" | "es" | "fr" | "de" | "pt" | "ar";
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  autoplay: "always" | "wifi" | "never";
  downloadQuality: "auto" | "high" | "data-saver";
  private: boolean;
  allowMessages: "everyone" | "followers" | "none";
  emailNotifications: boolean;
  pushNotifications: boolean;
};

const DEFAULTS: Prefs = {
  theme: "dark", language: "en",
  reducedMotion: false, highContrast: false, largeText: false,
  autoplay: "wifi", downloadQuality: "auto",
  private: false, allowMessages: "followers",
  emailNotifications: true, pushNotifications: true,
};

const KEY = "zombierex.prefs.v1";
function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { return DEFAULTS; }
}
function savePrefs(p: Prefs) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* quota */ } }

const SECTIONS: Array<{ id: string; title: string; items: Array<{ label: string; hint?: string; kind: string }> }> = [
  { id: "account", title: "Account", items: [
    { label: "Profile", hint: "Name, handle, bio, avatar", kind: "profile" },
    { label: "Email address", hint: "Change your sign-in email", kind: "email" },
    { label: "Change password", kind: "password" },
    { label: "Connected accounts", hint: "Google, Apple, Instagram", kind: "connected" },
  ]},
  { id: "privacy", title: "Privacy", items: [
    { label: "Private account", kind: "toggle-private" },
    { label: "Who can message you", kind: "select-messages" },
    { label: "Blocked users", kind: "blocked" },
    { label: "Content preferences", hint: "Muted keywords, sensitive content", kind: "content-prefs" },
  ]},
  { id: "security", title: "Security", items: [
    { label: "Two-factor authentication", kind: "twofa" },
    { label: "Active sessions", kind: "sessions" },
    { label: "Login activity", kind: "login-activity" },
  ]},
  { id: "notifications", title: "Notifications", items: [
    { label: "Push notifications", kind: "toggle-push" },
    { label: "Email notifications", kind: "toggle-email" },
    { label: "Fine-grained preferences", kind: "notif-prefs" },
  ]},
  { id: "appearance", title: "Appearance & language", items: [
    { label: "Theme", kind: "select-theme" },
    { label: "Language", kind: "select-language" },
    { label: "Text size", kind: "toggle-large-text" },
  ]},
  { id: "accessibility", title: "Accessibility", items: [
    { label: "Reduce motion", kind: "toggle-motion" },
    { label: "High contrast", kind: "toggle-contrast" },
  ]},
  { id: "data", title: "Data & storage", items: [
    { label: "Download quality", kind: "select-quality" },
    { label: "Video autoplay", kind: "select-autoplay" },
    { label: "Clear cache", kind: "clear-cache" },
    { label: "Download your data", kind: "download-data" },
  ]},
  { id: "support", title: "Help & support", items: [
    { label: "Help center", kind: "help" },
    { label: "Report a problem", kind: "report" },
    { label: "About ZOMBIEREX", kind: "about" },
    { label: "Terms of service", kind: "tos" },
    { label: "Privacy policy", kind: "privacy-policy" },
  ]},
];

function SettingsPage() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [open, setOpen] = useState<string | null>("account");

  useEffect(() => { setPrefs(loadPrefs()); }, []);
  const update = <K extends keyof Prefs>(k: K, v: Prefs[K]) => {
    setPrefs((p) => { const next = { ...p, [k]: v }; savePrefs(next); return next; });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const deleteAccount = async () => {
    if (!confirm("Delete your account? This action cannot be undone.")) return;
    if (!confirm("Really? All posts, media and messages will be permanently removed.")) return;
    alert("Deletion request queued. Support will contact you at your registered email.");
  };

  return (
    <div className="pb-24">
      <StatusBar index="06" section="SETTINGS · CONTROL" />
      <header className="px-5 pt-6">
        <Link to="/profile" className="mono-tag" style={{ color: "var(--color-titanium)" }}>← Garage</Link>
        <h1 className="serif mt-2 text-4xl leading-tight" style={{ color: "var(--color-ink)" }}>
          Settings <span className="italic" style={{ color: "var(--color-neon)" }}>& control</span>
        </h1>
      </header>

      <div className="mt-6 space-y-2 px-3">
        {SECTIONS.map((s) => (
          <section key={s.id} style={{ background: "var(--color-graphite)", border: "1px solid var(--color-hair)", borderRadius: 10 }}>
            <button onClick={() => setOpen((cur) => cur === s.id ? null : s.id)}
              className="tap flex w-full items-center justify-between px-4 py-3 text-left"
              style={{ color: "var(--color-ink)" }}>
              <span className="serif text-[16px] italic">{s.title}</span>
              <span className="mono-tag" style={{ color: "var(--color-silver)" }}>{open === s.id ? "−" : "+"}</span>
            </button>
            {open === s.id && (
              <div className="divide-y" style={{ borderTop: "1px solid var(--color-hair)", borderColor: "var(--color-hair)" }}>
                {s.items.map((it) => (
                  <SettingRow key={it.kind} it={it} prefs={prefs} update={update} />
                ))}
              </div>
            )}
          </section>
        ))}

        <section className="mt-6 space-y-2">
          <button onClick={signOut} className="tap w-full rounded-lg px-4 py-3 text-left text-[13px]"
            style={{ background: "transparent", border: "1px solid var(--color-hair-strong)", color: "var(--color-ink)" }}>
            Log out
          </button>
          <button onClick={deleteAccount} className="tap w-full rounded-lg px-4 py-3 text-left text-[13px]"
            style={{ background: "transparent", border: "1px solid rgba(255,80,80,0.5)", color: "#ff8080" }}>
            Delete account
          </button>
          <p className="mono-tag pt-4 text-center" style={{ color: "var(--color-silver)" }}>ZOMBIEREX · v1.0 · build “Signal”</p>
        </section>
      </div>
    </div>
  );
}

function SettingRow({ it, prefs, update }: {
  it: { label: string; hint?: string; kind: string };
  prefs: Prefs;
  update: <K extends keyof Prefs>(k: K, v: Prefs[K]) => void;
}) {
  const control = (() => {
    switch (it.kind) {
      case "toggle-private":     return <Toggle checked={prefs.private} onChange={(v) => update("private", v)} />;
      case "toggle-motion":      return <Toggle checked={prefs.reducedMotion} onChange={(v) => update("reducedMotion", v)} />;
      case "toggle-contrast":    return <Toggle checked={prefs.highContrast} onChange={(v) => update("highContrast", v)} />;
      case "toggle-large-text":  return <Toggle checked={prefs.largeText} onChange={(v) => update("largeText", v)} />;
      case "toggle-push":        return <Toggle checked={prefs.pushNotifications} onChange={(v) => update("pushNotifications", v)} />;
      case "toggle-email":       return <Toggle checked={prefs.emailNotifications} onChange={(v) => update("emailNotifications", v)} />;
      case "select-theme":       return <Select value={prefs.theme} onChange={(v) => update("theme", v as Prefs["theme"])} options={[["dark","Dark"],["light","Light"],["system","System"]]} />;
      case "select-language":    return <Select value={prefs.language} onChange={(v) => update("language", v as Prefs["language"])} options={[["en","English"],["es","Español"],["fr","Français"],["de","Deutsch"],["pt","Português"],["ar","العربية"]]} />;
      case "select-messages":    return <Select value={prefs.allowMessages} onChange={(v) => update("allowMessages", v as Prefs["allowMessages"])} options={[["everyone","Everyone"],["followers","Followers"],["none","No one"]]} />;
      case "select-quality":     return <Select value={prefs.downloadQuality} onChange={(v) => update("downloadQuality", v as Prefs["downloadQuality"])} options={[["auto","Auto"],["high","High"],["data-saver","Data saver"]]} />;
      case "select-autoplay":    return <Select value={prefs.autoplay} onChange={(v) => update("autoplay", v as Prefs["autoplay"])} options={[["always","Always"],["wifi","Wi-Fi only"],["never","Never"]]} />;
      case "clear-cache":        return <ActionBtn label="Clear" onClick={() => { try { caches?.keys?.().then((k) => k.forEach((n) => caches.delete(n))); } catch {} alert("Cache cleared"); }} />;
      case "profile":            return <LinkChip to="/profile" label="Open" />;
      default:                   return <span className="mono-tag" style={{ color: "var(--color-titanium)" }}>Soon</span>;
    }
  })();

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="min-w-0">
        <p className="text-[13px]" style={{ color: "var(--color-ink)" }}>{it.label}</p>
        {it.hint && <p className="mono-tag mt-0.5" style={{ color: "var(--color-silver)", fontSize: 10 }}>{it.hint}</p>}
      </div>
      <div className="ml-3 shrink-0">{control}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className="tap h-6 w-11 rounded-full transition-colors"
      style={{ background: checked ? "var(--color-neon)" : "var(--color-hair-strong)", position: "relative" }}>
      <span style={{
        position: "absolute", top: 2, left: checked ? 22 : 2, height: 20, width: 20, borderRadius: 999,
        background: "#fff", transition: "left .16s ease",
      }} />
    </button>
  );
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Array<[string, string]> }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="rounded px-2 py-1 text-[12px]"
      style={{ background: "var(--color-graphite)", color: "var(--color-ink)", border: "1px solid var(--color-hair-strong)" }}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
function ActionBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} className="mono-tag tap px-3 py-1.5" style={{ border: "1px solid var(--color-hair-strong)", color: "var(--color-ink)", borderRadius: 999 }}>{label}</button>;
}
function LinkChip({ to, label }: { to: string; label: string }) {
  return <Link to={to as any} className="mono-tag tap px-3 py-1.5" style={{ border: "1px solid var(--color-hair-strong)", color: "var(--color-ink)", borderRadius: 999 }}>{label}</Link>;
}
