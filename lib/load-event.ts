import { cache } from "react";
import { createClient } from "@ieee/supabase/server";

export const loadEvent = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data: event, error } = await supabase
    .from("ieee_registrations_events")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) console.error("Failed to load event:", error.message);
  if (!event) return null;

  const { data: taken } = await supabase.rpc("ieee_registrations_taken", {
    p_event_id: event.id,
  });
  return { event, taken: taken ?? 0 };
});
