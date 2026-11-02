import EventDetail from "@/components/EventDetail";
import { PLACEHOLDER_SEGMENT } from "@/lib/routes";

// The school site exports one template page for every event (see .htaccess);
// the event itself loads in the browser.
export function generateStaticParams() {
  return [{ slug: PLACEHOLDER_SEGMENT }];
}

export default function EventPage() {
  return <EventDetail />;
}
