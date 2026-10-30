import type { Metadata } from "next";
import NewsAnnouncementsPage from "@/components/NewsAnnouncementsPage";
import { pageMetadata } from "@/lib/seo";

// Set on the list page, not the section layout, so article pages under it
// don't inherit the list's canonical URL
export const metadata: Metadata = {
  title: "News",
  ...pageMetadata({
    title: "News and announcements | WVSU CICT",
    description:
      "Stay updated with the latest news, events, and announcements from the College of Information and Communications Technology.",
    path: "/news-announcements",
  }),
};

export default function Page() {
  return <NewsAnnouncementsPage />;
}
