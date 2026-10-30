// Line icons for the CMS, drawn on a 24px grid in the current text color.

export type IconName =
  | "dashboard"
  | "news"
  | "programs"
  | "faculty"
  | "settings"
  | "plus"
  | "external"
  | "logout"
  | "back"
  | "check"
  | "alert"
  | "image"
  | "upload"
  | "trash"
  | "eye"
  | "eye-off"
  | "chevron"
  | "wrench";

const paths: Record<IconName, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  news: (
    <>
      <path d="M4 5h13v14H6a2 2 0 0 1-2-2V5z" />
      <path d="M17 9h3v8a2 2 0 0 1-2 2" />
      <path d="M8 9h5M8 13h5M8 16h3" />
    </>
  ),
  programs: (
    <>
      <path d="M3 9l9-5 9 5-9 5-9-5z" />
      <path d="M7 11.5V16c2.5 2 7.5 2 10 0v-4.5" />
    </>
  ),
  faculty: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.7-3 2.9-5 5.5-5s4.8 2 5.5 5" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M16 14.2c2.1-.2 3.9 1.2 4.5 3.8" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </>
  ),
  logout: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 8l-4 4 4 4M6 12h10" />
    </>
  ),
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  alert: (
    <>
      <path d="M12 3.5l9.5 16.5h-19L12 3.5z" />
      <path d="M12 10v4M12 17v.5" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="M21 16l-5.5-5.5L6 20" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M10 11v6M14 11v6" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  "eye-off": (
    <>
      <path d="M4 4l16 16" />
      <path d="M10.6 6.1A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3 3.6M6.5 7.6A16.6 16.6 0 0 0 2 12s3.5 6.5 10 6.5a9.7 9.7 0 0 0 4.4-1" />
      <path d="M9.9 9.9a2.8 2.8 0 0 0 4 4" />
    </>
  ),
  chevron: <path d="M6 9l6 6 6-6" />,
  wrench: (
    <path d="M14.5 5.5a4 4 0 0 0 4.9 4.9l-9 9a2.1 2.1 0 0 1-3-3l9-9a4 4 0 0 0-1.9-1.9z" />
  ),
};

export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}
