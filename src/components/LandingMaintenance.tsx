"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { fetchSiteSettings } from "@/lib/cms/content";
import { useContent } from "@/lib/cms/useContent";
import { DEFAULT_MAINTENANCE_MESSAGE } from "@/lib/maintenance";
import { PageHeader, container, primaryButton } from "@/components/PageHeader";
import { ArrowIcon } from "@/components/PhotoSlot";

/**
 * How long the landing page stays hidden while the maintenance switch loads,
 * so visitors don't see the page flash before the notice replaces it. After
 * this the page shows anyway; a slow or failed load never blocks it.
 */
const SETTINGS_WAIT_MS = 1200;

const stillOpen = [
  { href: "/programs", label: "Programs" },
  { href: "/news-announcements", label: "News" },
  { href: "/faculty-profiles", label: "Faculty" },
  { href: "/contact", label: "Contact" },
];

/** Shows the landing page, or the maintenance notice when the CMS says so. */
export function LandingMaintenance({ children }: { children: ReactNode }) {
  const settings = useContent("site-settings", fetchSiteSettings);
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setWaited(true), SETTINGS_WAIT_MS);
    return () => clearTimeout(timer);
  }, []);

  if (settings.status === "ready" && settings.data?.maintenance_mode) {
    return (
      <MaintenanceNotice message={settings.data.maintenance_message.trim()} />
    );
  }

  const hidden = settings.status === "loading" && !waited;
  return (
    <div className={hidden ? "invisible" : undefined} aria-busy={hidden}>
      {children}
    </div>
  );
}

export function MaintenanceNotice({ message }: { message?: string }) {
  return (
    <div className="bg-white">
      <PageHeader
        eyebrow="Maintenance"
        title="We'll be right back."
        intro={
          <p className="whitespace-pre-line">
            {message || DEFAULT_MAINTENANCE_MESSAGE}
          </p>
        }
        image="/temp-photos/campus.jpg"
      />
      <section className={`${container} py-16 md:py-20`}>
        <h2 className="text-ink text-2xl font-medium">Still open</h2>
        <ul className="mt-6 flex flex-wrap gap-3">
          {stillOpen.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={primaryButton}>
                {link.label}
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
