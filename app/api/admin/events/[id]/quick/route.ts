import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/auth";
import { readJson, UUID } from "@/lib/validate";

const ACTIONS = ["publish", "unpublish", "open", "close"] as const;

export async function POST(
  request: Request,
  { params }: RouteContext<"/api/admin/events/[id]/quick">,
) {
  const supabase = await getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await readJson(request);
  const action = ACTIONS.find((item) => item === body?.action);
  if (!UUID.test(id) || !action) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: event } = await supabase
    .from("ieee_registrations_events")
    .select("opens_at, closes_at")
    .eq("id", id)
    .maybeSingle();
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const now = new Date();
  let update: {
    status?: string;
    opens_at?: string;
    closes_at?: string;
  };
  if (action === "publish" || action === "unpublish") {
    update = { status: action === "publish" ? "published" : "draft" };
  } else if (action === "open") {
    if (!event.closes_at || new Date(event.closes_at) <= now) {
      return NextResponse.json(
        {
          error:
            "Set when registrations close in Settings, then open them here.",
        },
        { status: 400 },
      );
    }
    update = { opens_at: now.toISOString() };
  } else {
    if (!event.opens_at) {
      return NextResponse.json(
        { error: "This event has no registration to close." },
        { status: 400 },
      );
    }
    const opens = new Date(event.opens_at);
    update = {
      closes_at: now.toISOString(),
      opens_at: (opens < now
        ? opens
        : new Date(now.getTime() - 1000)
      ).toISOString(),
    };
  }

  const { error } = await supabase
    .from("ieee_registrations_events")
    .update(update)
    .eq("id", id);
  if (error) {
    console.error("Failed to update event:", error.message);
    return NextResponse.json(
      { error: "Couldn't update the event." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
