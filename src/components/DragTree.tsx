/**
 * DragTree — Christmas Tree drag light UI.
 * Renders the classic vertical stack: pre-stage, stage, 3 amber, green, red.
 */
import type { TreeState } from "@/lib/christmas-tree";

export function DragTree({ state, compact = false }: { state: TreeState; compact?: boolean }) {
  const p = state.phase;
  const amber1 = p === "amber1" || p === "amber2" || p === "amber3" || p === "green" || p === "done";
  const amber2 = p === "amber2" || p === "amber3" || p === "green" || p === "done";
  const amber3 = p === "amber3" || p === "green" || p === "done";
  const green = p === "green" || p === "done";
  const red = p === "foul";
  const preStage = p !== "idle";
  const stage = p !== "idle" && p !== "prestage";

  const size = compact ? 34 : 56;
  return (
    <div
      className="flex flex-col items-center gap-2 rounded-2xl border p-4"
      style={{
        borderColor: "var(--color-hair-strong)",
        background: "linear-gradient(180deg,#050505,#0e0e0e)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.03)",
      }}
    >
      <Row>
        <Bulb size={size * 0.55} on={preStage} color="#f8f8f8" />
        <Bulb size={size * 0.55} on={preStage} color="#f8f8f8" />
      </Row>
      <Row>
        <Bulb size={size * 0.55} on={stage} color="#f8f8f8" />
        <Bulb size={size * 0.55} on={stage} color="#f8f8f8" />
      </Row>
      <Bulb size={size} on={amber1} color="#ffb020" />
      <Bulb size={size} on={amber2} color="#ffb020" />
      <Bulb size={size} on={amber3} color="#ffb020" />
      <Bulb size={size * 1.1} on={green} color="#00c853" />
      <Bulb size={size * 1.1} on={red} color="#ff2b2b" />
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}

function Bulb({ on, color, size = 48 }: { on: boolean; color: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: on
          ? `radial-gradient(circle at 30% 30%, #fff, ${color} 55%, ${color} 100%)`
          : "radial-gradient(circle at 30% 30%, #202020, #0a0a0a 70%)",
        boxShadow: on
          ? `0 0 ${size * 0.6}px ${color}, 0 0 ${size * 0.2}px ${color} inset, 0 0 0 2px rgba(0,0,0,0.6)`
          : "inset 0 0 0 2px rgba(255,255,255,0.04), 0 2px 6px rgba(0,0,0,0.6)",
        transition: "background 80ms linear, box-shadow 80ms linear",
      }}
    />
  );
}

export default DragTree;
