import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { me, myVehicles, posts, clubs } from "@/lib/mock-data";
import { Settings, MapPin, Gauge, Wrench, Plus, Users2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — ZOMBIEREX" },
      { name: "description", content: "Your rider profile, garage of vehicles and posts." },
    ],
  }),
  component: ProfilePage,
});

const tabs = ["Posts", "Garage", "Clubs"] as const;
type Tab = (typeof tabs)[number];

function ProfilePage() {
  const [tab, setTab] = useState<Tab>("Garage");
  const myPosts = posts.slice(0, 2);

  return (
    <>
      <TopBar title="Profile" />

      {/* hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: `url(${myVehicles[0].cover})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(24px) saturate(1.1)",
          }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.09 0.005 150 / 0.5), oklch(0.09 0.005 150 / 0.95))" }} />
        <div className="relative px-4 pb-5 pt-6">
          <div className="flex items-center gap-4">
            <img
              src={me.avatar}
              alt={me.name}
              className="h-20 w-20 rounded-full border-2 object-cover"
              style={{ borderColor: "var(--color-primary)", boxShadow: "var(--shadow-glow-toxic)" }}
            />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-3xl leading-none tracking-wide">{me.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{me.handle}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {me.location}
              </p>
            </div>
            <button aria-label="Settings" className="grid h-10 w-10 place-items-center rounded-md border border-border">
              <Settings className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2 rounded-xl border border-border bg-card/80 p-3 backdrop-blur">
            <Stat label="Posts" value="128" />
            <Stat label="Followers" value="4.2k" />
            <Stat label="Rides" value="37" />
            <Stat label="Miles" value="18k" />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              className="flex-1 rounded-md py-2.5 font-display text-sm tracking-widest"
              style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
            >
              EDIT PROFILE
            </button>
            <button className="flex-1 rounded-md border border-border py-2.5 font-display text-sm tracking-widest">SHARE</button>
          </div>
        </div>
      </section>

      {/* tabs */}
      <div className="sticky top-[57px] z-20 grid grid-cols-3 border-b border-border bg-background/85 backdrop-blur-xl">
        {tabs.map((t) => {
          const on = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative py-3 font-display text-sm tracking-widest"
              style={{ color: on ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
            >
              {t.toUpperCase()}
              {on ? <span className="absolute inset-x-6 -bottom-px h-[2px]" style={{ background: "var(--color-primary)" }} /> : null}
            </button>
          );
        })}
      </div>

      {tab === "Posts" ? (
        <div className="grid grid-cols-3 gap-0.5">
          {[...myPosts, ...myPosts, ...myPosts].map((p, i) => (
            <div key={i} className="aspect-square overflow-hidden bg-surface">
              <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      ) : null}

      {tab === "Garage" ? (
        <div className="flex flex-col gap-3 p-4">
          {myVehicles.map((v) => (
            <Link key={v.id} to="/profile" className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img src={v.cover} alt={v.name} loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 30%, oklch(0.09 0.005 150 / 0.9))" }} />
                <div className="absolute inset-x-4 bottom-3">
                  <p className="font-display text-xs tracking-[0.2em]" style={{ color: "var(--color-primary)" }}>{v.year} · {v.type.toUpperCase()}</p>
                  <h3 className="mt-0.5 font-display text-2xl leading-none tracking-wide">{v.name}</h3>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs">
                <span className="flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5" style={{ color: "var(--color-primary)" }} />{v.hp} HP</span>
                <span className="flex items-center gap-1.5 text-muted-foreground"><Wrench className="h-3.5 w-3.5" />{v.mods.length} mods</span>
              </div>
            </Link>
          ))}

          <button className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-8 font-display text-sm tracking-widest text-muted-foreground transition-colors hover:text-foreground">
            <Plus className="h-4 w-4" />
            ADD VEHICLE
          </button>
        </div>
      ) : null}

      {tab === "Clubs" ? (
        <div className="flex flex-col gap-3 p-4">
          {clubs.map((c) => (
            <article key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <img src={c.cover} alt="" loading="lazy" className="h-14 w-14 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-lg leading-none tracking-wide">{c.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Users2 className="h-3 w-3" /> {c.members.toLocaleString()} members · {c.city}
                </p>
              </div>
              <span
                className="rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest"
                style={{ color: "var(--color-primary)", borderColor: "var(--color-primary)" }}
              >
                {c.tag}
              </span>
            </article>
          ))}
        </div>
      ) : null}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-xl leading-none tracking-wide">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}
