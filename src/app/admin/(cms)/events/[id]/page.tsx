import { Metadata } from "next";
import { notFound } from "next/navigation";
import DeleteButton from "@/components/admin/DeleteButton";
import PageHeader, { SecondaryLink } from "@/components/admin/PageHeader";
import SavedNotice from "@/components/admin/SavedNotice";
import { requireAdmin } from "@/lib/cms/auth";
import { eventHref } from "@/lib/events";
import { siteUrl } from "@/lib/site";
import { deleteEvent, updateEvent } from "../actions";
import EventForm from "../EventForm";

export const metadata: Metadata = {
  title: "Edit event",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditEventPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { saved } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!event) notFound();

  // Drafts are previewed on this (CMS) deployment, where the admin's session
  // can read them
  const isDraft = event.status === "draft";
  const viewHref = isDraft
    ? eventHref(event.slug)
    : siteUrl(eventHref(event.slug));

  return (
    <>
      <PageHeader
        title="Edit event"
        backHref="/admin/events"
        backLabel="All events"
        actions={
          <>
            <SecondaryLink href={viewHref} icon="eye" external>
              {isDraft ? "Preview" : "View on site"}
            </SecondaryLink>
            <DeleteButton
              action={deleteEvent.bind(null, event.id)}
              confirmMessage={`Delete "${event.title}"? This cannot be undone.`}
            />
          </>
        }
      />
      {saved && <SavedNotice />}
      <EventForm event={event} action={updateEvent.bind(null, event.id)} />
    </>
  );
}
