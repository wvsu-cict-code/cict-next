"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  fetchNotifications,
  markAllNotificationsRead,
  type Notification,
} from "@/lib/museum/notifications";
import { getBrowserClient } from "@/lib/supabase/browser";

function NotificationBody({ item }: { item: Notification }) {
  const approved = item.kind === "approved";
  return (
    <>
      <span className="block font-medium">
        {approved ? "Approved" : "Not approved"}: {item.work_title}
      </span>
      {!approved && item.reason && (
        <span className="text-muted-foreground block text-xs">
          {item.reason}
        </span>
      )}
    </>
  );
}

export function NotificationsBell() {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchNotifications(getBrowserClient())
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const unread = items.some((item) => item.read_at === null);

  function onOpenChange(open: boolean) {
    if (!open || !unread) return;
    markAllNotificationsRead(getBrowserClient())
      .then(() => {
        const now = new Date().toISOString();
        setItems((prev) =>
          prev.map((item) => ({ ...item, read_at: item.read_at ?? now })),
        );
      })
      .catch(() => {});
  }

  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="text-ink hover:bg-paper relative inline-flex h-11 w-11 items-center justify-center rounded-full"
        >
          <Bell className="h-5 w-5" aria-hidden />
          {unread && (
            <span
              data-testid="unread-dot"
              className="bg-theme-red absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full"
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground p-2 text-sm">
            No notifications yet.
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto">
            {items.map((item) => {
              const href =
                item.kind === "approved"
                  ? item.work_id
                    ? `/programs/bsemc/museum/?exhibit=${item.work_id}`
                    : null
                  : "/account/";
              return (
                <li key={item.id} className="text-sm">
                  {href ? (
                    <Link
                      href={href}
                      className="hover:bg-paper block rounded-md p-2"
                    >
                      <NotificationBody item={item} />
                    </Link>
                  ) : (
                    <div className="p-2">
                      <NotificationBody item={item} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
