import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/auth";
import { TICKET_CODE } from "@/lib/tickets";
import { readJson, UUID } from "@/lib/validate";

export async function POST(request: Request) {
  const supabase = await getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readJson(request);
  const eventId = typeof body?.event_id === "string" ? body.event_id : "";
  const code =
    typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!UUID.test(eventId) || !TICKET_CODE.test(code)) {
    return NextResponse.json({ result: "unknown" });
  }

  const { data: entry } = await supabase
    .from("ieee_registrations_entries")
    .select(
      "id, event_id, name, register_number, status, checked_in_at, team:ieee_registrations_teams(name)",
    )
    .eq("ticket_code", code)
    .maybeSingle();
  if (!entry) return NextResponse.json({ result: "unknown" });

  const person = {
    id: entry.id,
    name: entry.name,
    register_number: entry.register_number,
    team: entry.team?.name ?? null,
    checked_in_at: entry.checked_in_at,
  };
  if (entry.event_id !== eventId) {
    return NextResponse.json({ result: "other_event", person });
  }
  if (entry.status !== "confirmed") {
    return NextResponse.json({ result: entry.status, person });
  }

  const { data: updated } = await supabase
    .from("ieee_registrations_entries")
    .update({ checked_in_at: new Date().toISOString() })
    .eq("id", entry.id)
    .eq("status", "confirmed")
    .is("checked_in_at", null)
    .select("checked_in_at")
    .maybeSingle();

  if (!updated) {
    const { data: current } = await supabase
      .from("ieee_registrations_entries")
      .select("checked_in_at")
      .eq("id", entry.id)
      .maybeSingle();
    return NextResponse.json({
      result: "already",
      person: { ...person, checked_in_at: current?.checked_in_at ?? null },
    });
  }

  return NextResponse.json({
    result: "in",
    person: { ...person, checked_in_at: updated.checked_in_at },
  });
}
