import { useEffect, useRef, useState } from "react";

/**
 * Detects window scroll direction with hysteresis so the bottom nav doesn't
 * flicker on micro-bounces or slow drags. Returns "up" | "down" | null before
 * any scroll has happened.
 *
 * - A direction change only fires after the user has scrolled `threshold` px
 *   in the new direction.
 * - A small settle delay prevents rapid hide/show toggles when the thumb pauses.
 */
export function useScrollDirection(threshold = 18) {
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  const lastY = useRef(0);
  const accumulator = useRef(0);
  const settleTimer = useRef<number | null>(null);
  const directionRef = useRef<"up" | "down" | null>(null);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    lastY.current = window.scrollY;
    accumulator.current = 0;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const delta = y - lastY.current;
        lastY.current = y;

        if (Math.abs(delta) < 2) return; // ignore sub-pixel jitter

        // Accumulate movement in the same direction; reset on reversal.
        if (Math.sign(delta) === Math.sign(accumulator.current)) {
          accumulator.current += delta;
        } else {
          accumulator.current = delta;
        }

        if (Math.abs(accumulator.current) < threshold) return;

        const next = accumulator.current > 0 ? "down" : "up";
        if (next === directionRef.current) {
          accumulator.current = 0;
          return;
        }

        if (settleTimer.current) window.clearTimeout(settleTimer.current);
        settleTimer.current = window.setTimeout(() => {
          setDirection(next);
          accumulator.current = 0;
        }, 80);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
    };
  }, [threshold]);

  return direction;
}
