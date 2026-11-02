"use client";

import { usePathname } from "next/navigation";
import { ContentError, ContentPlaceholder } from "@/components/ContentState";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { PageHeader, container } from "@/components/PageHeader";
import { fetchEventBySlug } from "@/lib/cms/content";
import { useContent } from "@/lib/cms/useContent";
import { formatEventWhen } from "@/lib/events";
import { EVENTS_PREFIX, segmentFromPathname } from "@/lib/routes";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

/**
 * One event. The slug comes from the address bar: on the school site every
 * event URL is served by the same exported template page.
 */
export default function EventDetail() {
  const slug = segmentFromPathname(usePathname(), EVENTS_PREFIX);
  const result = useContent(
    slug === null ? "missing" : `event:${slug}`,
    (client) =>
      slug === null ? Promise.resolve(null) : fetchEventBySlug(client, slug),
  );
  const event = result.status === "ready" ? result.data : null;
  useDocumentTitle(event?.title);

  if (result.status === "error") {
    return <ContentError onRetry={result.retry} />;
  }

  if (result.status === "loading") {
    return (
      <div className="bg-white">
        <ContentPlaceholder className="h-72 w-full rounded-none" />
        <div className={`${container} grid gap-4 py-16`}>
          <ContentPlaceholder className="h-4 w-full max-w-2xl" />
          <ContentPlaceholder className="h-4 w-full max-w-xl" />
        </div>
      </div>
    );
  }

  const back = { href: "/events", label: "All events" };

  if (!event) {
    return (
      <PageHeader
        eyebrow="Events"
        title="Event not found"
        intro="The event you are looking for does not exist or has been removed."
        back={back}
      />
    );
  }

  return (
    <div className="bg-white">
      {event.status === "draft" && (
        <div className="flex items-center justify-center gap-4 bg-[#373737] px-6 py-2 text-sm text-white">
          <span>Preview — this event is a draft</span>
        </div>
      )}
      <PageHeader
        eyebrow="Event"
        title={event.title}
        intro={event.summary || undefined}
        back={back}
      />
      <div className={`${container} py-12 md:py-16`}>
        <div className="max-w-3xl">
          <dl className="border-rule mb-10 grid gap-6 border-b pb-8 sm:grid-cols-2">
            <div>
              <dt className="text-theme-red text-xs font-semibold tracking-[0.08em] uppercase">
                When
              </dt>
              <dd className="text-ink mt-2 text-lg leading-snug">
                {formatEventWhen(event)}
              </dd>
            </div>
            {event.location ? (
              <div>
                <dt className="text-theme-red text-xs font-semibold tracking-[0.08em] uppercase">
                  Where
                </dt>
                <dd className="text-ink mt-2 text-lg leading-snug">
                  {event.location}
                </dd>
              </div>
            ) : null}
          </dl>
          {event.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element -- the static site can't optimize images
            <img
              src={event.cover_image_url}
              alt=""
              className="mb-10 w-full rounded-2xl object-cover"
            />
          )}
          <MarkdownRenderer content={event.body} />
        </div>
      </div>
    </div>
  );
}
