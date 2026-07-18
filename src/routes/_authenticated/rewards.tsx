/**
 * Rewards hub — Phase 12
 *
 * Tabs: Overview · Achievements · Challenges · Leaderboards · Referrals · Premium.
 * Reuses the "Obsidian & Signal" visual system (var(--color-*), .mono-tag, .tap).
 */
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getMyGamificationSummary,
  listAchievements,
  listMyChallenges,
  getLeaderboard,
  dailyCheckIn,
  claimChallenge,
  claimReferral,
  activatePremium,
  cancelPremium,
  setFeaturedBadge,
} from "@/lib/gamification.functions";

export const Route = createFileRoute("/_authenticated/rewards")({
  head: () => ({ meta: [{ title: "Rewards · ZOMBIEREX" }] }),
  component: RewardsHub,
});

type Tab = "overview" | "badges" | "challenges" | "boards" | "invite" | "premium";

function RewardsHub() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="pb-32">
      <header className="px-5 pt-8">
        <p className="mono-tag" style={{ color: "var(--color-neon)" }}>◆ REWARDS</p>
        <h1 className="serif mt-2 text-4xl leading-tight" style={{ color: "var(--color-ink)" }}>
          Ride, earn, <span className="italic" style={{ color: "var(--color-neon)" }}>rise</span>
        </h1>
        <p className="mt-2 text-[12px]" style={{ color: "var(--color-silver)" }}>
          Every real contribution moves you up. Complete challenges, unlock badges, invite riders.
        </p>
      </header>

      <nav className="mt-5 flex gap-1.5 overflow-x-auto px-5 pb-2 no-scrollbar">
        {(
          [
            ["overview", "Overview"],
            ["badges", "Badges"],
            ["challenges", "Challenges"],
            ["boards", "Leaderboards"],
            ["invite", "Invite"],
            ["premium", "Premium"],
          ] as [Tab, string][]
        ).map(([id, label]) => {
          const on = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="tap whitespace-nowrap px-3 py-1.5 text-[12px]"
              style={{
                background: on ? "var(--color-neon)" : "var(--color-graphite)",
                color: "var(--color-ink)",
                border: `1px solid ${on ? "var(--color-neon)" : "var(--color-hair)"}`,
                borderRadius: 999,
                fontWeight: on ? 600 : 400,
              }}
            >
              {label}
            </button>
          );
        })}
      </nav>

      <div className="mt-4 px-5">
        {tab === "overview" && <OverviewTab />}
        {tab === "badges" && <BadgesTab />}
        {tab === "challenges" && <ChallengesTab />}
        {tab === "boards" && <BoardsTab />}
        {tab === "invite" && <InviteTab />}
        {tab === "premium" && <PremiumTab />}
      </div>
    </div>
  );
}

// ---------------- Overview ----------------
function OverviewTab() {
  const qc = useQueryClient();
  const getSummary = useServerFn(getMyGamificationSummary);
  const checkIn = useServerFn(dailyCheckIn);
  const { data, isLoading } = useQuery({ queryKey: ["gam-summary"], queryFn: () => getSummary() });
  const doCheckIn = useMutation({
    mutationFn: () => checkIn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gam-summary"] }),
  });

  if (isLoading || !data) return <Skeleton />;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="mono-tag" style={{ color: "var(--color-silver)" }}>LEVEL</p>
            <p className="serif text-4xl" style={{ color: "var(--color-ink)" }}>{data.level}</p>
          </div>
          <div className="text-right">
            <p className="mono-tag" style={{ color: "var(--color-silver)" }}>TOTAL XP</p>
            <p className="serif text-2xl" style={{ color: "var(--color-neon)" }}>{data.xp_total.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--color-hair)" }}>
            <div
              className="h-full"
              style={{ width: `${Math.round(data.level_progress * 100)}%`, background: "var(--color-neon)" }}
            />
          </div>
          <p className="mono-tag mt-1.5" style={{ color: "var(--color-silver)" }}>
            {data.xp_to_next.toLocaleString()} XP to level {data.level + 1}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Streak" value={`${data.streak_days}d`} />
        <Stat label="Badges" value={data.achievements_unlocked} />
        <Stat label="Invites" value={data.referrals} />
        <Stat label="Tier" value={data.is_premium ? "Premium" : "Standard"} />
      </div>

      <button
        onClick={() => doCheckIn.mutate()}
        disabled={doCheckIn.isPending}
        className="tap w-full py-3 text-[13px]"
        style={{
          background: "var(--color-ink)",
          color: "var(--color-cloud, #fafafa)",
          borderRadius: 12,
          fontWeight: 600,
        }}
      >
        {doCheckIn.isPending ? "Checking in…" : "Daily check-in (+XP)"}
      </button>
      {doCheckIn.data && "xp" in doCheckIn.data && (
        <p className="mono-tag text-center" style={{ color: "var(--color-neon)" }}>
          +{(doCheckIn.data as any).xp} XP · {(doCheckIn.data as any).streak}-day streak
        </p>
      )}
      {doCheckIn.data && (doCheckIn.data as any).alreadyCheckedIn && (
        <p className="mono-tag text-center" style={{ color: "var(--color-silver)" }}>
          Already checked in today — see you tomorrow.
        </p>
      )}
    </div>
  );
}

// ---------------- Badges ----------------
function BadgesTab() {
  const qc = useQueryClient();
  const list = useServerFn(listAchievements);
  const setBadge = useServerFn(setFeaturedBadge);
  const { data } = useQuery({ queryKey: ["achievements"], queryFn: () => list() });
  const feature = useMutation({
    mutationFn: (slug: string | null) => setBadge({ data: { slug } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gam-summary"] }),
  });

  if (!data) return <Skeleton />;
  return (
    <div className="space-y-2">
      {data.map((a: any) => {
        const unlocked = !!a.unlocked_at;
        return (
          <Card key={a.slug}>
            <div className="flex items-center gap-3">
              <TierChip tier={a.tier} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px]" style={{ color: "var(--color-ink)", opacity: unlocked ? 1 : 0.6 }}>
                  {a.title}
                </p>
                <p className="text-[11px]" style={{ color: "var(--color-silver)" }}>{a.description}</p>
              </div>
              <div className="text-right">
                <p className="mono-tag" style={{ color: unlocked ? "var(--color-neon)" : "var(--color-silver)" }}>
                  {unlocked ? "UNLOCKED" : `${a.progress}/${a.target}`}
                </p>
                <p className="mono-tag" style={{ color: "var(--color-silver)", fontSize: 9 }}>
                  +{a.xp_reward} XP
                </p>
              </div>
            </div>
            {unlocked && (
              <div className="mt-2 flex gap-1.5">
                <button
                  onClick={() => feature.mutate(a.slug)}
                  className="tap flex-1 py-1.5 text-[11px]"
                  style={{
                    background: "var(--color-graphite)",
                    border: "1px solid var(--color-hair)",
                    borderRadius: 8,
                    color: "var(--color-ink)",
                  }}
                >
                  Feature on profile
                </button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ---------------- Challenges ----------------
function ChallengesTab() {
  const qc = useQueryClient();
  const list = useServerFn(listMyChallenges);
  const claim = useServerFn(claimChallenge);
  const { data } = useQuery({ queryKey: ["challenges"], queryFn: () => list() });
  const doClaim = useMutation({
    mutationFn: (id: string) => claim({ data: { challenge_id: id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["challenges"] });
      qc.invalidateQueries({ queryKey: ["gam-summary"] });
    },
  });

  if (!data) return <Skeleton />;
  const grouped = { daily: [] as any[], weekly: [] as any[], seasonal: [] as any[] };
  data.forEach((c: any) => (grouped as any)[c.cadence]?.push(c));

  return (
    <div className="space-y-5">
      {(["daily", "weekly", "seasonal"] as const).map((cad) => (
        <section key={cad}>
          <p className="mono-tag mb-2" style={{ color: "var(--color-silver)" }}>{cad.toUpperCase()}</p>
          <div className="space-y-2">
            {(grouped as any)[cad].length === 0 && (
              <p className="text-[12px]" style={{ color: "var(--color-silver)" }}>Nothing here right now.</p>
            )}
            {(grouped as any)[cad].map((c: any) => {
              const pct = Math.min(1, (c.progress ?? 0) / Math.max(1, c.goal_count));
              const done = !!c.completed_at;
              const eligible = (c.progress ?? 0) >= c.goal_count && !done;
              return (
                <Card key={c.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[13px]" style={{ color: "var(--color-ink)" }}>{c.title}</p>
                    <span className="mono-tag" style={{ color: "var(--color-neon)" }}>+{c.xp_reward} XP</span>
                  </div>
                  <p className="mt-0.5 text-[11px]" style={{ color: "var(--color-silver)" }}>{c.description}</p>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full" style={{ background: "var(--color-hair)" }}>
                    <div className="h-full" style={{ width: `${pct * 100}%`, background: done ? "var(--color-silver)" : "var(--color-neon)" }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="mono-tag" style={{ color: "var(--color-silver)" }}>
                      {c.progress ?? 0}/{c.goal_count}
                    </p>
                    <button
                      disabled={!eligible || doClaim.isPending}
                      onClick={() => doClaim.mutate(c.id)}
                      className="tap px-3 py-1.5 text-[11px]"
                      style={{
                        background: done ? "var(--color-graphite)" : eligible ? "var(--color-neon)" : "var(--color-graphite)",
                        color: "var(--color-ink)",
                        border: `1px solid ${eligible ? "var(--color-neon)" : "var(--color-hair)"}`,
                        borderRadius: 8,
                        opacity: eligible || done ? 1 : 0.6,
                      }}
                    >
                      {done ? "Claimed" : eligible ? "Claim reward" : "In progress"}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// ---------------- Leaderboards ----------------
function BoardsTab() {
  const [board, setBoard] = useState<"xp" | "creators" | "communities">("xp");
  const get = useServerFn(getLeaderboard);
  const { data } = useQuery({
    queryKey: ["leaderboard", board],
    queryFn: () => get({ data: { board, limit: 25 } }),
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {(["xp", "creators", "communities"] as const).map((b) => (
          <button
            key={b}
            onClick={() => setBoard(b)}
            className="tap flex-1 py-1.5 text-[11px]"
            style={{
              background: board === b ? "var(--color-neon)" : "var(--color-graphite)",
              color: "var(--color-ink)",
              border: `1px solid ${board === b ? "var(--color-neon)" : "var(--color-hair)"}`,
              borderRadius: 8,
              fontWeight: board === b ? 600 : 400,
            }}
          >
            {b === "xp" ? "Top Riders" : b === "creators" ? "Top Creators" : "Top Crews"}
          </button>
        ))}
      </div>

      {!data ? (
        <Skeleton />
      ) : (
        <div className="space-y-1.5">
          {data.rows.map((r: any, i: number) => (
            <Card key={r.id}>
              <div className="flex items-center gap-3">
                <span
                  className="mono-tag grid h-7 w-7 place-items-center"
                  style={{
                    background: i < 3 ? "var(--color-neon)" : "var(--color-hair)",
                    color: "var(--color-ink)",
                    borderRadius: 999,
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] truncate" style={{ color: "var(--color-ink)" }}>
                    {r.display_name ?? r.name ?? r.tagline ?? r.category ?? "—"}
                  </p>
                  <p className="mono-tag truncate" style={{ color: "var(--color-silver)" }}>
                    {board === "xp"
                      ? `${r.xp_total?.toLocaleString?.() ?? 0} XP · L${r.level ?? 1}`
                      : board === "creators"
                        ? `${r.subscribers_count ?? 0} subs`
                        : `${r.members_count ?? 0} members`}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- Invite ----------------
function InviteTab() {
  const qc = useQueryClient();
  const getSummary = useServerFn(getMyGamificationSummary);
  const claim = useServerFn(claimReferral);
  const { data } = useQuery({ queryKey: ["gam-summary"], queryFn: () => getSummary() });
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const useCode = useMutation({
    mutationFn: () => claim({ data: { code } }),
    onSuccess: () => {
      setMsg("Invite applied — bonus XP sent to both of you.");
      qc.invalidateQueries({ queryKey: ["gam-summary"] });
    },
    onError: (e: any) => setMsg(e?.message ?? "Could not apply that code."),
  });

  return (
    <div className="space-y-4">
      <Card>
        <p className="mono-tag" style={{ color: "var(--color-silver)" }}>YOUR CODE</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="serif text-2xl" style={{ color: "var(--color-ink)", letterSpacing: 2 }}>
            {data?.referral_code ?? "—"}
          </p>
          {data?.referral_code && (
            <button
              onClick={() => navigator.clipboard?.writeText(data.referral_code!)}
              className="tap px-3 py-1.5 text-[11px]"
              style={{
                background: "var(--color-neon)",
                color: "var(--color-ink)",
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              Copy
            </button>
          )}
        </div>
        <p className="mt-2 text-[11px]" style={{ color: "var(--color-silver)" }}>
          Share this code. When a friend activates it you both earn XP — and every 3 activations grants the Recruiter badge.
        </p>
      </Card>

      <Card>
        <p className="mono-tag mb-1.5" style={{ color: "var(--color-silver)" }}>ENTER A CODE</p>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="APEXREX"
            className="flex-1 px-3 py-2 text-[13px]"
            style={{
              background: "var(--color-graphite)",
              border: "1px solid var(--color-hair)",
              borderRadius: 8,
              color: "var(--color-ink)",
              letterSpacing: 1,
            }}
          />
          <button
            onClick={() => useCode.mutate()}
            disabled={code.length < 4 || useCode.isPending}
            className="tap px-4 text-[12px]"
            style={{
              background: "var(--color-ink)",
              color: "var(--color-cloud, #fafafa)",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            Apply
          </button>
        </div>
        {msg && <p className="mono-tag mt-2" style={{ color: "var(--color-silver)" }}>{msg}</p>}
      </Card>
    </div>
  );
}

// ---------------- Premium ----------------
function PremiumTab() {
  const qc = useQueryClient();
  const activate = useServerFn(activatePremium);
  const cancel = useServerFn(cancelPremium);
  const getSummary = useServerFn(getMyGamificationSummary);
  const { data } = useQuery({ queryKey: ["gam-summary"], queryFn: () => getSummary() });

  const doActivate = useMutation({
    mutationFn: (tier: "apex" | "legend") => activate({ data: { tier, months: 1 } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gam-summary"] }),
  });
  const doCancel = useMutation({
    mutationFn: () => cancel(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gam-summary"] }),
  });

  const TIERS = [
    {
      key: "apex" as const,
      name: "Apex",
      price: "$9.99 / mo",
      perks: ["Premium profile themes", "Priority upload lanes", "Advanced analytics", "Apex badge on profile"],
    },
    {
      key: "legend" as const,
      name: "Legend",
      price: "$19.99 / mo",
      perks: ["Animated profile effects", "Exclusive communities", "Early access to features", "Legend badge on profile"],
    },
  ];

  return (
    <div className="space-y-3">
      {data?.is_premium && (
        <Card>
          <p className="mono-tag" style={{ color: "var(--color-neon)" }}>ACTIVE</p>
          <p className="mt-1 text-[13px]" style={{ color: "var(--color-ink)" }}>
            You're a Premium member. Thanks for supporting ZOMBIEREX.
          </p>
          <button
            onClick={() => doCancel.mutate()}
            className="tap mt-3 w-full py-2 text-[12px]"
            style={{
              background: "transparent",
              border: "1px solid rgba(255,80,80,0.4)",
              borderRadius: 8,
              color: "#ff8080",
            }}
          >
            Cancel membership
          </button>
        </Card>
      )}

      {TIERS.map((t) => (
        <Card key={t.key}>
          <div className="flex items-baseline justify-between">
            <p className="serif text-2xl" style={{ color: "var(--color-ink)" }}>{t.name}</p>
            <p className="mono-tag" style={{ color: "var(--color-neon)" }}>{t.price}</p>
          </div>
          <ul className="mt-2 space-y-1">
            {t.perks.map((p) => (
              <li key={p} className="text-[12px]" style={{ color: "var(--color-silver)" }}>· {p}</li>
            ))}
          </ul>
          <button
            onClick={() => doActivate.mutate(t.key)}
            disabled={doActivate.isPending}
            className="tap mt-3 w-full py-2 text-[12px]"
            style={{
              background: t.key === "legend" ? "var(--color-ink)" : "var(--color-neon)",
              color: t.key === "legend" ? "var(--color-cloud, #fafafa)" : "var(--color-ink)",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            {doActivate.isPending ? "Activating…" : `Go ${t.name}`}
          </button>
        </Card>
      ))}
      <p className="mono-tag text-center" style={{ color: "var(--color-silver)" }}>
        Preview activation — no card charged in this build.
      </p>
    </div>
  );
}

// ---------------- primitives ----------------
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--color-graphite)",
        border: "1px solid var(--color-hair)",
        borderRadius: 12,
        padding: 14,
      }}
    >
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--color-graphite)",
        border: "1px solid var(--color-hair)",
        borderRadius: 12,
        padding: 12,
      }}
    >
      <p className="mono-tag" style={{ color: "var(--color-silver)" }}>{label.toUpperCase()}</p>
      <p className="serif mt-0.5 text-xl" style={{ color: "var(--color-ink)" }}>{value}</p>
    </div>
  );
}

function TierChip({ tier }: { tier: string }) {
  const map: Record<string, string> = {
    bronze: "#b08050",
    silver: "#c8cdd2",
    gold: "#e6c46a",
    platinum: "#e2f0ff",
    legend: "var(--color-neon)",
  };
  return (
    <span
      className="grid h-8 w-8 place-items-center text-[9px] font-bold"
      style={{
        background: map[tier] ?? map.bronze,
        color: "var(--color-ink)",
        borderRadius: 8,
        letterSpacing: 0.5,
      }}
    >
      {tier.slice(0, 3).toUpperCase()}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-16 w-full animate-pulse"
          style={{ background: "var(--color-graphite)", borderRadius: 12 }}
        />
      ))}
    </div>
  );
}
