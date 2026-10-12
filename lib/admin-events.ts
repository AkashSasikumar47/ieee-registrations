import type { createClient } from "@ieee/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type EventCounts = {
  confirmed: number;
  waitlisted: number;
  cancelled: number;
  checkedIn: number;
};

export async function loadAdminEvents(supabase: SupabaseClient) {
  const [{ data: events, error }, { data: rows }] = await Promise.all([
    supabase
      .from("ieee_registrations_events")
      .select("*")
      .order("starts_at", { ascending: false }),
    supabase.rpc("ieee_registrations_counts"),
  ]);

  if (error) console.error("Failed to load events:", error.message);

  const counts = new Map<string, EventCounts>(
    (rows ?? []).map((row) => [
      row.event_id,
      {
        confirmed: row.confirmed,
        waitlisted: row.waitlisted,
        cancelled: row.cancelled,
        checkedIn: row.checked_in,
      },
    ]),
  );

  return { events: events ?? [], counts };
}
