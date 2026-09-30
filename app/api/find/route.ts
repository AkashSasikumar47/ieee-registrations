import { NextResponse } from "next/server";
import { createClient } from "@ieee/supabase/server";
import { readJson } from "@/lib/validate";

export async function POST(request: Request) {
  const body = await readJson(request);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const registerNumber =
    typeof body?.register_number === "string" ? body.register_number : "";
  const phone = typeof body?.phone === "string" ? body.phone : "";
  if (!slug || !registerNumber || !phone) {
    return NextResponse.json(
      { error: "Fill in every field." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ieee_registrations_find", {
    p_slug: slug,
    p_register_number: registerNumber,
    p_phone: phone,
  });

  if (error) console.error("Find failed:", error.message);
  if (!data) {
    return NextResponse.json(
      { error: "No registration matches those details." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ticket_code: data });
}
