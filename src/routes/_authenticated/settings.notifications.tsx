import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SettingsScreen, Card } from "@/components/SettingsScreen";

export const Route = createFileRoute("/_authenticated/settings/notifications")({
  head: () => ({ meta: [{ title: "Notification details · Settings · ZOMBIEREX" }, { name: "description", content: "Choose exactly which activity notifies you on ZOMBIEREX." }] }),
  component: NotifPrefsPage,
});

type Channel = { push: boolean; email: boolean };
type Prefs = Record<string, Channel>;
const CATS: Array<{ id: string; label: string; hint: string }> = [
  { id: "likes", label: "Likes", hint: "Someone likes your post or reel" },
  { id: "comments", label: "Comments", hint: "New comments and replies" },
  { id: "follows", label: "New followers", hint: "Riders who follow your garage" },
  { id: "mentions", label: "Mentions & tags", hint: "You're tagged in a post or story" },
  { id: "messages", label: "Direct messages", hint: "New DMs and group chats" },
  { id: "rides", label: "Group rides", hint: "Ride invites, ETAs and SOS alerts" },
  { id: "drag", label: "Drag racing", hint: "Race invites, verified runs and leaderboards" },
  { id: "marketplace", label: "Marketplace", hint: "Offers, messages and price drops" },
  { id: "events", label: "Events", hint: "Nearby meets and event reminders" },
  { id: "system", label: "System & security", hint: "Sign-in alerts and important updates" },
];
const KEY = "zombierex.notif.v1";
const DEF: Prefs = Object.fromEntries(CATS.map((c) => [c.id, { push: true, email: c.id === "system" || c.id === "messages" }]));

function load(): Prefs { try { return { ...DEF, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return DEF; } }
function save(p: Prefs) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {} }

function NotifPrefsPage() {
  const [p, setP] = useState<Prefs>(DEF);
  useEffect(() => setP(load()), []);
  const set = (id: string, key: keyof Channel, v: boolean) => {
    const next = { ...p, [id]: { ...p[id], [key]: v } };
    setP(next); save(next);
  };
  return (
    <SettingsScreen index="06.09" section="NOTIFICATIONS" title="Notification details" subtitle="Toggle push and email per activity type.">
      <div className="space-y-2">
        {CATS.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px]" style={{ color: "var(--color-ink)" }}>{c.label}</p>
                <p className="mt-0.5 text-[11px]" style={{ color: "var(--color-silver)" }}>{c.hint}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Toggle label="Push" checked={!!p[c.id]?.push} onChange={(v) => set(c.id, "push", v)} />
                <Toggle label="Email" checked={!!p[c.id]?.email} onChange={(v) => set(c.id, "email", v)} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </SettingsScreen>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="mono-tag" style={{ color: "var(--color-silver)", fontSize: 10 }}>{label}</span>
      <button onClick={() => onChange(!checked)} className="tap h-5 w-9 rounded-full transition-colors"
        style={{ background: checked ? "var(--color-neon)" : "var(--color-hair-strong)", position: "relative" }}>
        <span style={{ position: "absolute", top: 2, left: checked ? 18 : 2, height: 16, width: 16, borderRadius: 999, background: "#fff", transition: "left .16s ease" }} />
      </button>
    </div>
  );
}
