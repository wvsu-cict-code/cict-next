import { Metadata } from "next";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/cms/auth";
import { createEvent } from "../actions";
import EventForm from "../EventForm";

export const metadata: Metadata = {
  title: "New event",
};

export default async function NewEventPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        title="New event"
        backHref="/admin/events"
        backLabel="All events"
      />
      <EventForm action={createEvent} />
    </>
  );
}
