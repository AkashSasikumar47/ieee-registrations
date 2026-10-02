import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/auth";
import { eventError, readEventInput } from "@/lib/event-input";
import { readJson, UUID } from "@/lib/validate";

export async function PATCH(
  request: Request,
  { params }: RouteContext<"/api/admin/events/[id]">,
) {
  const supabase = await getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await readJson(request);
  if (!UUID.test(id) || !body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = readEventInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ieee_registrations_events")
    .update(parsed.event)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to update event:", error.message);
    return NextResponse.json(
      { error: eventError(error.code, "Couldn't save the event.") },
      { status: 400 },
    );
  }
  if (!data) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ id: data.id });
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/admin/events/[id]">,
) {
  const supabase = await getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { count, error: countError } = await supabase
    .from("ieee_registrations_entries")
    .select("id", { count: "exact", head: true })
    .eq("event_id", id);

  if (countError || count === null) {
    return NextResponse.json(
      { error: "Couldn't check the registrations." },
      { status: 500 },
    );
  }
  if (count > 0) {
    return NextResponse.json(
      {
        error:
          "People have registered for this event, so it can't be deleted. Unpublish it instead.",
      },
      { status: 409 },
    );
  }

  const { error } = await supabase
    .from("ieee_registrations_events")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete event:", error.message);
    return NextResponse.json(
      { error: "Couldn't delete the event." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
