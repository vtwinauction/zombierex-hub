/**
 * ZOMBIEREX-native social action icons.
 *
 * These are NOT generic heart/comment/share/bookmark glyphs.
 * Each icon is built from the ZOMBIEREX visual language:
 * dinosaur bones, raptor claws, machined metal, helmet visors,
 * motorcycle chains and gauge clusters.
 *
 * - Uses currentColor so the parent drives the neon-green tint + glow.
 * - Active states use solid fills rather than outline strokes.
 * - Stroke-linecap is "square" for a CNC/machined feel.
 */

type IconProps = {
  size?: number;
  active?: boolean;
  className?: string;
};

const squareCap = { strokeLinecap: "square" as const, strokeLinejoin: "miter" as const };

/** Like — three raptor claw slashes. Fills with solid neon when active. */
export function HeartIcon({ size = 24, active = false, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      {...squareCap}
    >
      {active ? (
        <g fill="currentColor" stroke="none">
          <path d="M5.5 20.5c.8-5.2 2.6-10.2 5.2-14.2.6 4.8 1.2 9.6 1.8 14.2-2.2-2.5-4.8-3.8-7-0z" />
          <path d="M10.5 21c.8-5.2 2.6-10.2 5.2-14.2.6 4.8 1.2 9.6 1.8 14.2-2.2-2.5-4.8-3.8-7-0z" />
          <path d="M15.5 21.5c.8-5.2 2.6-10.2 5.2-14.2.6 4.8 1.2 9.6 1.8 14.2-2.2-2.5-4.8-3.8-7-0z" />
        </g>
      ) : (
        <>
          <path d="M5 21c1-6 3-11 6-15" />
          <path d="M10 21.5c1-6 3-11 6-15" />
          <path d="M15 22c1-6 3-11 6-15" />
        </>
      )}
    </svg>
  );
}

/** Comment — helmet visor + speech tail. Fills when active. */
export function CommentIcon({ size = 24, active = false, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.7}
      {...squareCap}
    >
      <path d="M4 8a3 3 0 013-3h10a3 3 0 013 3v7a3 3 0 01-3 3h-4l-5 3.5V18H7a3 3 0 01-3-3z" />
      <path d="M7 10.5h10" strokeWidth={active ? 2 : 1.6} />
      {!active && (
        <>
          <circle cx="8.5" cy="14" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="14" r="1" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}

/** Views — gauge cluster / tachometer eye. No active state. */
export function EyeIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      {...squareCap}
    >
      <path d="M2.5 12s3.6-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.6 6.5-9.5 6.5S2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" opacity="0.9" />
      <circle cx="13" cy="11" r="0.9" fill="var(--color-obsidian,#08090b)" stroke="none" />
      <path d="M12 6v2M17.5 8.5l-1.4 1.4M18 12h-2" strokeWidth={1.2} opacity="0.7" />
    </svg>
  );
}

/** Share — motorcycle chain link with outward arrows. Fills when active. */
export function ShareIcon({ size = 24, active = false, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      {...squareCap}
    >
      <path
        d="M7 9a3 3 0 110-6 3 3 0 010 6z"
        fill={active ? "currentColor" : "none"}
      />
      <path
        d="M17 15a3 3 0 110-6 3 3 0 010 6z"
        fill={active ? "currentColor" : "none"}
      />
      <path
        d="M17 21a3 3 0 110-6 3 3 0 010 6z"
        fill={active ? "currentColor" : "none"}
      />
      <path d="M9.3 7.3l5.4-1.4" />
      <path d="M9.3 13.7l5.4 1.4" />
      <path d="m14 5 2.5-1.5L17 6" />
      <path d="m14 17 2.5 1.5L17 16" />
    </svg>
  );
}

/** Save — dinosaur bone bookmark. Fills solid when active. */
export function BookmarkIcon({ size = 24, active = false, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.7}
      {...squareCap}
    >
      <path d="M8 3a2 2 0 10-2 3v11.5a1 1 0 001.6.8L12 15l4.4 3.3a1 1 0 001.6-.8V6A2 2 0 1016 3a2 2 0 00-4 0 2 2 0 00-4 0z" />
      {!active && (
        <>
          <circle cx="6.5" cy="5.5" r="0.7" fill="currentColor" stroke="none" />
          <circle cx="17.5" cy="5.5" r="0.7" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}
