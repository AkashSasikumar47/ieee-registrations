import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@ieee/supabase/server";
import { getAdmin } from "@/lib/auth";
import { UUID } from "@/lib/validate";

export const loadAdminEvent = cache(async (id: string) => {
  const supabase = await createClient();
  if (!(await getAdmin(supabase))) redirect("/admin/login");
  if (!UUID.test(id)) notFound();

  const { data: event } = await supabase
    .from("ieee_registrations_events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!event) notFound();
  return { supabase, event };
});
