import { createClient } from "@ieee/supabase/server";

export type TicketStatus = "confirmed" | "waitlisted" | "cancelled";

export type Ticket = {
  ticket_code: string;
  status: TicketStatus;
  role: "solo" | "leader" | "member";
  name: string;
  register_number: string;
  created_at: string;
  event: {
    slug: string;
    name: string;
    venue: string;
    starts_at: string;
    ends_at: string;
    team_min: number;
    team_max: number;
  };
  team: {
    name: string;
    invite_code: string | null;
    members: { name: string; role: string; status: TicketStatus }[];
  } | null;
};

export const TICKET_CODE = /^[0-9A-F]{32}$/;

export async function getTicket(code: string) {
  const normalised = code.toUpperCase();
  if (!TICKET_CODE.test(normalised)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ieee_registrations_ticket", {
    p_code: normalised,
  });
  if (error) console.error("Failed to load ticket:", error.message);
  return (data as Ticket | null) ?? null;
}
