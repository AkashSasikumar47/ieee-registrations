import type { createClient } from "@ieee/supabase/server";
import type { TicketStatus } from "@/lib/tickets";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type AdminEntry = {
  id: string;
  name: string;
  email: string;
  register_number: string;
  phone: string;
  role: "solo" | "leader" | "member";
  status: TicketStatus;
  team: string | null;
  short: boolean;
  ticket_code: string;
  answers: Record<string, string>;
  created_at: string;
  checked_in_at: string | null;
};

export async function loadAdminEntries(supabase: SupabaseClient, id: string) {
  const [{ data: event }, { data: rows, error }] = await Promise.all([
    supabase
      .from("ieee_registrations_events")
      .select("*")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("ieee_registrations_entries")
      .select(
        "id, team_id, name, email, register_number, phone, role, status, ticket_code, answers, created_at, checked_in_at, team:ieee_registrations_teams(name)",
      )
      .eq("event_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (error) console.error("Failed to load registrations:", error.message);
  if (!event) return null;

  const sizes = new Map<string, number>();
  for (const row of rows ?? []) {
    if (row.team_id && row.status !== "cancelled") {
      sizes.set(row.team_id, (sizes.get(row.team_id) ?? 0) + 1);
    }
  }

  const entries: AdminEntry[] = (rows ?? []).map(({ team_id, ...row }) => ({
    ...row,
    role: row.role as AdminEntry["role"],
    status: row.status as TicketStatus,
    team: row.team?.name ?? null,
    short:
      team_id !== null &&
      row.status !== "cancelled" &&
      (sizes.get(team_id) ?? 0) < event.team_min,
    answers:
      typeof row.answers === "object" &&
      row.answers !== null &&
      !Array.isArray(row.answers)
        ? Object.fromEntries(
            Object.entries(row.answers).map(([key, value]) => [
              key,
              typeof value === "string"
                ? value
                : Array.isArray(value)
                  ? value.join(", ")
                  : "",
            ]),
          )
        : {},
  }));

  return { event, entries };
}
