import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/auth";
import { eventError, readEventInput } from "@/lib/event-input";
import { readJson } from "@/lib/validate";

export async function POST(request: Request) {
  const supabase = await getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readJson(request);
  if (!body)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const parsed = readEventInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ieee_registrations_events")
    .insert(parsed.event)
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create event:", error.message);
    return NextResponse.json(
      { error: eventError(error.code, "Couldn't create the event.") },
      { status: 400 },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
