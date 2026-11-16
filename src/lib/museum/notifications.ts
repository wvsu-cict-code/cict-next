import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;
export type Notification = Tables<"notifications">;

/** The signed-in user's newest 20 notifications (RLS limits rows to their own). */
export async function fetchNotifications(
  client: Client,
): Promise<Notification[]> {
  const { data, error } = await client
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function markAllNotificationsRead(client: Client): Promise<void> {
  const { error } = await client
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);
  if (error) throw error;
}
