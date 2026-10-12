import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/auth";
import { loadCheckIns } from "@/lib/check-ins";
import { UUID } from "@/lib/validate";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/admin/events/[id]/check-ins">,
) {
  const supabase = await getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  return NextResponse.json(
    { entries: await loadCheckIns(supabase, id) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
