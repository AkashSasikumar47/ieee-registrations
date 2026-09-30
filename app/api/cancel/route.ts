import { NextResponse } from "next/server";
import { createClient } from "@ieee/supabase/server";
import { errorMessage } from "@/lib/errors";
import { TICKET_CODE } from "@/lib/tickets";
import { readJson } from "@/lib/validate";

export async function POST(request: Request) {
  const body = await readJson(request);
  const code =
    typeof body?.ticket_code === "string" ? body.ticket_code.toUpperCase() : "";
  if (!TICKET_CODE.test(code)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("ieee_registrations_cancel", {
    p_code: code,
  });

  if (error) {
    return NextResponse.json(
      { error: errorMessage(error.message, "Couldn't cancel. Try again.") },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
