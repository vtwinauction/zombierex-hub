/**
 * Detailed, "realistic" social icons for the ZOMBIEREX interaction bar.
 * Two-tone: outline stroke + optional fill when the action is active.
 * Uses currentColor so parent can drive the neon-green tint + glow.
 */

type IconProps = {
  size?: number;
  active?: boolean;
  className?: string;
};

/** Heart — plump, symmetrical, filled when liked */
export function HeartIcon({ size = 24, active = false, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={active ? 1.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20.5s-7.2-4.35-9.3-9.2C1.2 7.6 3.7 3.8 7.4 3.8c2 0 3.55 1.05 4.6 2.6 1.05-1.55 2.6-2.6 4.6-2.6 3.7 0 6.2 3.8 4.7 7.5-2.1 4.85-9.3 9.2-9.3 9.2z" />
    </svg>
  );
}

/** Speech bubble — rounded with three dots inside */
export function CommentIcon({ size = 24, active = false, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v9A2.5 2.5 0 0 1 17.5 17H10l-4.2 3.6a.6.6 0 0 1-1-.46V17H6.5A2.5 2.5 0 0 1 4 14.5v-9z" />
      {!active && (
        <>
          <circle cx="8.5" cy="10" r="1.05" fill="currentColor" stroke="none" />
          <circle cx="12" cy="10" r="1.05" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="10" r="1.05" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}

/** Eye with iris (views) */
export function EyeIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.6-7 9.5-7 9.5 7 9.5 7-3.6 7-9.5 7S2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" opacity="0.85" />
      <circle cx="13" cy="11" r="0.9" fill="var(--color-obsidian,#08090b)" stroke="none" />
    </svg>
  );
}

/** Paper plane (share) */
export function ShareIcon({ size = 24, active = false, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.4 2.6 2.9 9.7c-.6.24-.6 1.1 0 1.34l6.6 2.6 2.6 6.6c.24.6 1.1.6 1.34 0L20.6 2.6a.3.3 0 0 0-.4-.4z" />
      <path d="m10.5 13.5 4.5-4.5" strokeWidth={1.9} />
    </svg>
  );
}

/** Bookmark ribbon (save) */
export function BookmarkIcon({ size = 24, active = false, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.2L5 21V4.5a1 1 0 0 1 1-1z" />
    </svg>
  );
}
