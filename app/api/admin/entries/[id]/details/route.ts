import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/auth";
import { parseFields } from "@/lib/events";
import { readJson, UUID } from "@/lib/validate";

const EDITABLE = ["text", "textarea", "number", "email", "url", "select"];

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function PATCH(
  request: Request,
  { params }: RouteContext<"/api/admin/entries/[id]/details">,
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

  const name = text(body.name, 100);
  const register_number = text(body.register_number, 20).toUpperCase();
  const email = text(body.email, 120).toLowerCase();
  const phone = text(body.phone, 15);
  if (!name)
    return NextResponse.json({ error: "Enter a name." }, { status: 400 });
  if (!/^RA\d{13}$/.test(register_number)) {
    return NextResponse.json(
      { error: "Enter a register number like RA2211003010001." },
      { status: 400 },
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email." },
      { status: 400 },
    );
  }
  if (phone && !/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json(
      { error: "Enter a 10-digit mobile number, or leave it blank." },
      { status: 400 },
    );
  }

  const { data: entry } = await supabase
    .from("ieee_registrations_entries")
    .select("answers, event:ieee_registrations_events(fields)")
    .eq("id", id)
    .maybeSingle();
  if (!entry) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 },
    );
  }

  const given =
    typeof body.answers === "object" && body.answers !== null
      ? (body.answers as Record<string, unknown>)
      : {};
  const answers = {
    ...(typeof entry.answers === "object" &&
    entry.answers !== null &&
    !Array.isArray(entry.answers)
      ? entry.answers
      : {}),
  };
  for (const field of parseFields(entry.event?.fields ?? [])) {
    if (!EDITABLE.includes(field.type) || !(field.key in given)) continue;
    const value = text(given[field.key], 1000);
    if (field.type === "select" && value && !field.options?.includes(value)) {
      return NextResponse.json(
        { error: `Pick a listed option for "${field.label}".` },
        { status: 400 },
      );
    }
    if (value) answers[field.key] = value;
    else delete answers[field.key];
  }

  const { error } = await supabase
    .from("ieee_registrations_entries")
    .update({ name, register_number, email, phone, answers })
    .eq("id", id);
  if (error) {
    return NextResponse.json(
      {
        error:
          error.code === "23505"
            ? "Someone else in this event already has that register number."
            : "Couldn't save the details.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
