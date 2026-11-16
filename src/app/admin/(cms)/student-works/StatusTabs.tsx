import Link from "next/link";

const TABS = [
  { status: "pending", label: "Pending" },
  { status: "approved", label: "Approved" },
  { status: "rejected", label: "Rejected" },
  { status: "all", label: "All" },
] as const;

export type WorkListStatus = (typeof TABS)[number]["status"];

/** Without a param, open Pending when anything is waiting, otherwise All. */
export function resolveWorkListStatus(
  raw: string | undefined,
  pendingCount: number,
): WorkListStatus {
  if (
    raw === "pending" ||
    raw === "approved" ||
    raw === "rejected" ||
    raw === "all"
  ) {
    return raw;
  }
  return pendingCount > 0 ? "pending" : "all";
}

export function workListHref(status: WorkListStatus) {
  return `/admin/student-works?status=${status}`;
}

export default function StatusTabs({
  status,
  pendingCount,
}: {
  status: WorkListStatus;
  pendingCount: number;
}) {
  return (
    <nav
      aria-label="Filter by status"
      className="border-rule mb-6 flex gap-1 overflow-x-auto border-b"
    >
      {TABS.map((tab) => {
        const active = tab.status === status;
        return (
          <Link
            key={tab.status}
            href={workListHref(tab.status)}
            aria-current={active ? "page" : undefined}
            className={`-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-3 text-sm font-semibold whitespace-nowrap transition-colors ${
              active
                ? "border-theme-red text-ink"
                : "text-ink-soft hover:text-ink border-transparent"
            }`}
          >
            {tab.label}
            {tab.status === "pending" && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                  active ? "bg-theme-red/10 text-theme-red" : "bg-rule/60"
                }`}
              >
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
