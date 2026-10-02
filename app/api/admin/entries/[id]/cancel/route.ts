import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { UUID } from "@/lib/validate";

export async function POST(
  _request: Request,
  { params }: RouteContext<"/api/admin/entries/[id]/cancel">,
) {
  const supabase = await getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: entry } = await supabase
    .from("ieee_registrations_entries")
    .select("ticket_code")
    .eq("id", id)
    .maybeSingle();
  if (!entry) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 },
    );
  }

  const { error } = await supabase.rpc("ieee_registrations_cancel", {
    p_code: entry.ticket_code,
  });
  if (error) {
    return NextResponse.json(
      { error: errorMessage(error.message, "Couldn't cancel. Try again.") },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
