import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SettingsScreen, Card, TextInput, PrimaryButton } from "@/components/SettingsScreen";

export const Route = createFileRoute("/_authenticated/settings/blocked")({
  head: () => ({ meta: [{ title: "Blocked people · Settings · ZOMBIEREX" }, { name: "description", content: "Manage the users you have blocked on ZOMBIEREX." }] }),
  component: BlockedPage,
});

const KEY = "zombierex.blocked.v1";
const load = (): string[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const save = (l: string[]) => { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {} };

function BlockedPage() {
  const [list, setList] = useState<string[]>([]);
  const [input, setInput] = useState("");
  useEffect(() => setList(load()), []);
  const add = () => {
    const h = input.trim().replace(/^@/, "").toLowerCase();
    if (!h) return;
    const next = Array.from(new Set([...list, h]));
    setList(next); save(next); setInput("");
  };
  const remove = (h: string) => { const next = list.filter((x) => x !== h); setList(next); save(next); };

  return (
    <SettingsScreen index="06.04" section="BLOCKED" title="Blocked people" subtitle="Blocked riders can't see your posts, message you or tag you.">
      <Card>
        <div className="flex gap-2">
          <TextInput placeholder="@username" value={input} onChange={(e) => setInput(e.target.value)} />
          <button onClick={add} className="mono-tag tap px-3 rounded-md"
            style={{ background: "var(--color-neon)", color: "#000" }}>Block</button>
        </div>
      </Card>
      <div className="mt-3 space-y-2">
        {list.length === 0 && <Card><p className="text-[13px]" style={{ color: "var(--color-silver)" }}>No blocked accounts.</p></Card>}
        {list.map((h) => (
          <Card key={h}>
            <div className="flex items-center justify-between">
              <p className="text-[14px]" style={{ color: "var(--color-ink)" }}>@{h}</p>
              <button onClick={() => remove(h)} className="mono-tag tap px-3 py-1.5 rounded-full"
                style={{ border: "1px solid var(--color-hair-strong)", color: "var(--color-ink)" }}>Unblock</button>
            </div>
          </Card>
        ))}
      </div>
    </SettingsScreen>
  );
}
