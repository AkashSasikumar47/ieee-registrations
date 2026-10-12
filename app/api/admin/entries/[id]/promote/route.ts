import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { UUID } from "@/lib/validate";

export async function POST(
  _request: Request,
  { params }: RouteContext<"/api/admin/entries/[id]/promote">,
) {
  const supabase = await getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error } = await supabase.rpc("ieee_registrations_promote", {
    p_entry_id: id,
  });
  if (error) {
    return NextResponse.json(
      { error: errorMessage(error.message, "Couldn't confirm. Try again.") },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
