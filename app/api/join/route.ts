import { NextResponse } from "next/server";
import { createClient } from "@ieee/supabase/server";
import { errorMessage } from "@/lib/errors";
import { readJson, readParticipant } from "@/lib/validate";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body || typeof body.invite_code !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const participant = readParticipant(body);
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("ieee_registrations_join", {
      p_invite_code: body.invite_code,
      p_name: participant.name,
      p_email: participant.email,
      p_register_number: participant.register_number,
      p_phone: participant.phone,
      p_answers: participant.answers,
    })
    .single();

  if (error || !data) {
    return NextResponse.json(
      {
        error: errorMessage(
          error?.message,
          "Couldn't join the team. Try again.",
        ),
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ ticket_code: data.ticket_code }, { status: 201 });
}
