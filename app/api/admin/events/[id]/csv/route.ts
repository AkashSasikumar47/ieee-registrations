import { NextResponse } from "next/server";
import { loadAdminEntries } from "@/lib/admin-entries";
import { getAdminClient } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { parseFields } from "@/lib/events";
import { formatDayTime } from "@/lib/format";
import { UUID } from "@/lib/validate";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/admin/events/[id]/csv">,
) {
  const supabase = await getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const loaded = await loadAdminEntries(supabase, id);
  if (!loaded) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const { event, entries } = loaded;
  const fields = parseFields(event.fields);
  const rows = [
    [
      "Name",
      "Email",
      "Register number",
      "Phone",
      "Team",
      "Team short",
      "Role",
      "Status",
      "Checked in",
      "Registered",
      ...fields.map((field) => field.label),
    ],
    ...entries.map((entry) => [
      entry.name,
      entry.email,
      entry.register_number,
      entry.phone,
      entry.team ?? "",
      entry.short ? "Yes" : "",
      entry.role,
      entry.status,
      entry.checked_in_at ? formatDayTime(entry.checked_in_at) : "",
      formatDayTime(entry.created_at),
      ...fields.map((field) => entry.answers[field.key] ?? ""),
    ]),
  ];

  return new NextResponse(`﻿${toCsv(rows)}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}-registrations.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
