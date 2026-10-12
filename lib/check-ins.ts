import type { createClient } from "@ieee/supabase/server";
import type { TicketStatus } from "@/lib/tickets";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type CheckInEntry = {
  id: string;
  name: string;
  register_number: string;
  team: string | null;
  status: TicketStatus;
  ticket_code: string;
  checked_in_at: string | null;
};

export async function loadCheckIns(supabase: SupabaseClient, eventId: string) {
  const { data } = await supabase
    .from("ieee_registrations_entries")
    .select(
      "id, name, register_number, status, ticket_code, checked_in_at, team:ieee_registrations_teams(name)",
    )
    .eq("event_id", eventId)
    .eq("status", "confirmed")
    .order("name");

  return (data ?? []).map(({ team, ...row }): CheckInEntry => ({
    ...row,
    status: row.status as TicketStatus,
    team: team?.name ?? null,
  }));
}
