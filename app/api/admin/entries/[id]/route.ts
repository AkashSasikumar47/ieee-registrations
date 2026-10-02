import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/auth";
import { readJson, UUID } from "@/lib/validate";

export async function PATCH(
  request: Request,
  { params }: RouteContext<"/api/admin/entries/[id]">,
) {
  const supabase = await getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await readJson(request);
  if (!UUID.test(id) || typeof body?.checked_in !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const checked_in_at = body.checked_in ? new Date().toISOString() : null;
  const { data, error } = await supabase
    .from("ieee_registrations_entries")
    .update({ checked_in_at })
    .eq("id", id)
    .eq("status", "confirmed")
    .select("checked_in_at")
    .maybeSingle();

  if (error) {
    console.error("Failed to check in:", error.message);
    return NextResponse.json(
      { error: "Couldn't update the check-in." },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "Only confirmed registrations can be checked in." },
      { status: 409 },
    );
  }

  return NextResponse.json({ checked_in_at: data.checked_in_at });
}
