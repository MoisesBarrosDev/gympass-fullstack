import type { ReactNode } from "react";

export type IconName =
  | "logo"
  | "search"
  | "pin"
  | "clock"
  | "building"
  | "logout"
  | "locate"
  | "plus"
  | "edit"
  | "trash"
  | "restore"
  | "check"
  | "close"
  | "phone"
  | "arrow"
  | "eye"
  | "eyeOff";

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    logo: (
      <>
        <path d="M5 12h4l2-7 3 14 2-7h3" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    building: (
      <path d="M4 21V5l8-3 8 3v16M9 21v-4h6v4M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01" />
    ),
    logout: (
      <>
        <path d="m10 17 5-5-5-5M15 12H3M15 4h5v16h-5" />
      </>
    ),
    locate: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        <circle cx="12" cy="12" r="8" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    edit: (
      <>
        <path d="m4 20 4-1 11-11-3-3L5 16l-1 4Z" />
        <path d="m14 7 3 3" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" />
      </>
    ),
    restore: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    phone: (
      <path d="M6 3h4l2 5-3 2c1 3 3 5 6 6l2-3 4 2v4c0 2-2 3-4 2C9 19 5 15 3 7c0-2 1-4 3-4Z" />
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-2.1 2.8M6.6 6.6C3.6 8.3 2 12 2 12s3.5 6 10 6c1.7 0 3.1-.4 4.3-1" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}
