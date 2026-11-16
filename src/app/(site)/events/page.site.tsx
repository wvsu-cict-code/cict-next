import type { Metadata } from "next";
import { EventsPage } from "@/components/EventList";
import { pageMetadata } from "@/lib/seo";

// Set on the list page, not a section layout, so event pages under it don't
// inherit the list's canonical URL
export const metadata: Metadata = {
  title: "Events",
  ...pageMetadata({
    title: "Events | WVSU CICT",
    description:
      "Upcoming events, seminars, competitions, and academic calendar dates at the WVSU College of Information and Communications Technology.",
    path: "/events",
  }),
};

export default function Page() {
  return <EventsPage />;
}
