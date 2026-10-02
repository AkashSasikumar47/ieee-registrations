import type { createClient } from "@ieee/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type EventCounts = {
  confirmed: number;
  waitlisted: number;
  cancelled: number;
  checkedIn: number;
};

export async function loadAdminEvents(supabase: SupabaseClient) {
  const [{ data: events, error }, { data: entries }] = await Promise.all([
    supabase
      .from("ieee_registrations_events")
      .select("*")
      .order("starts_at", { ascending: false }),
    supabase
      .from("ieee_registrations_entries")
      .select("event_id, status, checked_in_at"),
  ]);

  if (error) console.error("Failed to load events:", error.message);

  const counts = new Map<string, EventCounts>();
  for (const entry of entries ?? []) {
    const count = counts.get(entry.event_id) ?? {
      confirmed: 0,
      waitlisted: 0,
      cancelled: 0,
      checkedIn: 0,
    };
    if (entry.status === "confirmed") count.confirmed += 1;
    if (entry.status === "waitlisted") count.waitlisted += 1;
    if (entry.status === "cancelled") count.cancelled += 1;
    if (entry.status === "confirmed" && entry.checked_in_at) {
      count.checkedIn += 1;
    }
    counts.set(entry.event_id, count);
  }

  return { events: events ?? [], counts };
}
