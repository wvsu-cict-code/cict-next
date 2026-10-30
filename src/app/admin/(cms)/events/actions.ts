"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/cms/auth";
import {
  assertDbOk,
  getBoolean,
  getOptionalString,
  getString,
  handleForm,
  parseManilaDateTime,
  requireValue,
  FormError,
  resolveMediaField,
  type FormState,
} from "@/lib/cms/forms";
import { slugify } from "@/lib/format";

/** All-day events are stored at midnight Philippine time on their dates. */
function parseEventTime(value: string, allDay: boolean) {
  return parseManilaDateTime(
    allDay && value ? `${value.slice(0, 10)}T00:00` : value,
  );
}

async function eventFromForm(formData: FormData) {
  const { supabase } = await requireAdmin();

  const title = requireValue(
    getString(formData, "title"),
    "Title is required.",
  );
  const slug = requireValue(
    slugify(getString(formData, "slug") || title),
    "Could not build a slug from the title. Enter one manually.",
  );
  const allDay = getBoolean(formData, "all_day");
  const startsAt = parseEventTime(getString(formData, "starts_at"), allDay);
  if (!startsAt) throw new FormError("Enter when the event starts.");
  const endsAt = parseEventTime(getString(formData, "ends_at"), allDay);
  if (endsAt && endsAt < startsAt) {
    throw new FormError("The end can't be before the start.");
  }

  const values = {
    title,
    slug,
    status:
      getString(formData, "status") === "published" ? "published" : "draft",
    starts_at: startsAt,
    // An all-day event ending on its start date is a one-day event
    ends_at: allDay && endsAt === startsAt ? null : endsAt,
    all_day: allDay,
    location: getOptionalString(formData, "location"),
    summary: getOptionalString(formData, "summary"),
    body: getString(formData, "body"),
    cover_image_url: await resolveMediaField(
      supabase,
      formData,
      "cover_image_url",
      "events",
    ),
  } as const;

  return { supabase, values };
}

export async function createEvent(_state: FormState, formData: FormData) {
  return handleForm(async () => {
    const { supabase, values } = await eventFromForm(formData);
    const { data, error } = await supabase
      .from("events")
      .insert(values)
      .select("id")
      .single();
    assertDbOk(error);

    redirect(`/admin/events/${data!.id}?saved=1`);
  });
}

export async function updateEvent(
  id: string,
  _state: FormState,
  formData: FormData,
) {
  return handleForm(async () => {
    const { supabase, values } = await eventFromForm(formData);
    const { error } = await supabase.from("events").update(values).eq("id", id);
    assertDbOk(error);

    redirect(`/admin/events/${id}?saved=1`);
  });
}

export async function deleteEvent(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("events").delete().eq("id", id);
  assertDbOk(error);

  redirect("/admin/events");
}
