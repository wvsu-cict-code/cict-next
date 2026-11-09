import { Metadata } from "next";
import Link from "next/link";
import PageHeader, {
  Card,
  EmptyState,
  PrimaryLink,
} from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/cms/auth";
import { formatEventWhen, splitEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Events",
};

export default async function AdminEventsPage() {
  const { supabase } = await requireAdmin();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, slug, status, starts_at, ends_at, all_day, location");

  if (error) {
    // The events table isn't in the database until its migration is applied
    if (error.code === "PGRST205" || error.code === "42P01") {
      return (
        <>
          <PageHeader title="Events" />
          <EmptyState title="Events aren't set up in the database yet. Apply the latest database migrations, then reload." />
        </>
      );
    }
    throw new Error(error.message);
  }

  const { upcoming, past } = splitEvents(events);
  const newEvent = (
    <PrimaryLink href="/admin/events/new">New event</PrimaryLink>
  );

  return (
    <>
      <PageHeader
        title="Events"
        description="Events and academic calendar dates for the Events page and the home page."
        actions={newEvent}
      />

      {events.length === 0 ? (
        <EmptyState title="No events yet." action={newEvent} />
      ) : (
        <div className="space-y-8">
          <EventTable title="Upcoming" rows={upcoming} />
          <EventTable title="Past" rows={past} />
        </div>
      )}
    </>
  );
}

function EventTable({
  title,
  rows,
}: {
  title: string;
  rows: {
    id: string;
    title: string;
    slug: string;
    status: "draft" | "published";
    starts_at: string;
    ends_at: string | null;
    all_day: boolean;
    location: string | null;
  }[];
}) {
  if (rows.length === 0) return null;

  return (
    <section>
      <h2 className="text-ink-soft mb-3 text-xs font-semibold tracking-[0.06em] uppercase">
        {title}
      </h2>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-rule text-ink-soft border-b text-xs tracking-[0.06em] uppercase">
            <tr>
              <th className="px-6 py-3 font-semibold">Event</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="hidden px-6 py-3 font-semibold md:table-cell">
                When
              </th>
            </tr>
          </thead>
          <tbody className="divide-rule/70 divide-y">
            {rows.map((event) => (
              <tr
                key={event.id}
                className="group hover:bg-paper/60 relative transition-colors"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="text-ink group-hover:text-theme-red font-semibold after:absolute after:inset-0"
                  >
                    {event.title}
                  </Link>
                  <span className="text-ink-soft mt-0.5 hidden text-xs sm:block">
                    {event.location || `/${event.slug}`}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      event.status === "published"
                        ? "bg-green-50 text-green-800"
                        : "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        event.status === "published"
                          ? "bg-green-600"
                          : "bg-neutral-400"
                      }`}
                      aria-hidden
                    />
                    {event.status === "published" ? "Live" : "Draft"}
                  </span>
                </td>
                <td className="text-ink-soft hidden px-6 py-4 md:table-cell">
                  {formatEventWhen(event)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
