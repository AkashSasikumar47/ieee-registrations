import { createClient } from "@ieee/supabase/server";

export async function loadEvents() {
  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("ieee_registrations_events")
    .select("*")
    .eq("status", "published")
    .order("starts_at", { ascending: true });

  if (error) console.error("Failed to load events:", error.message);

  const taken = new Map(
    await Promise.all(
      (events ?? []).map(async (event) => {
        const { data } = await supabase.rpc("ieee_registrations_taken", {
          p_event_id: event.id,
        });
        return [event.id, data ?? 0] as const;
      }),
    ),
  );

  return { events, taken };
}
