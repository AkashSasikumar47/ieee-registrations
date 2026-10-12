import { notFound, redirect } from "next/navigation";
import { createClient } from "@ieee/supabase/server";
import { ScannerApp } from "@/components/scanner-app";
import { getAdmin } from "@/lib/auth";
import { loadCheckIns } from "@/lib/check-ins";
import { UUID } from "@/lib/validate";

export default async function ScanEventPage({
  params,
}: PageProps<"/scan/[id]">) {
  const supabase = await createClient();
  if (!(await getAdmin(supabase))) redirect("/scan/login");

  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const [{ data: event }, entries] = await Promise.all([
    supabase
      .from("ieee_registrations_events")
      .select("id, name")
      .eq("id", id)
      .maybeSingle(),
    loadCheckIns(supabase, id),
  ]);
  if (!event) notFound();

  return <ScannerApp event={event} initial={entries} />;
}
