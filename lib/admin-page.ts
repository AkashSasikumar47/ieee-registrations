import { notFound, redirect } from "next/navigation";
import { createClient } from "@ieee/supabase/server";
import { loadAdminEntries } from "@/lib/admin-entries";
import { getAdmin } from "@/lib/auth";
import { UUID } from "@/lib/validate";

export async function loadAdminEventPage(params: Promise<{ id: string }>) {
  const supabase = await createClient();
  if (!(await getAdmin(supabase))) redirect("/admin/login");

  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const loaded = await loadAdminEntries(supabase, id);
  if (!loaded) notFound();
  return loaded;
}
