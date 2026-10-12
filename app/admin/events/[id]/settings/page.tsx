import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@ieee/ui/components/button";
import { createClient } from "@ieee/supabase/server";
import { AdminFooter } from "@/components/admin-footer";
import { AdminHeader } from "@/components/admin-header";
import { AdminIntro } from "@/components/admin-intro";
import { EventEditor } from "@/components/event-editor";
import { getAdmin } from "@/lib/auth";
import { UUID } from "@/lib/validate";

export const metadata: Metadata = {
  title: "Edit event | Registrations admin",
  robots: { index: false },
};

export default async function EditEventPage({
  params,
}: PageProps<"/admin/events/[id]">) {
  const supabase = await createClient();
  if (!(await getAdmin(supabase))) redirect("/admin/login");

  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const [{ data: event }, { count }] = await Promise.all([
    supabase
      .from("ieee_registrations_events")
      .select("*")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("ieee_registrations_entries")
      .select("id", { count: "exact", head: true })
      .eq("event_id", id),
  ]);
  if (!event) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader />
      <main className="flex-1">
        <AdminIntro
          label={`Admin · /${event.slug}`}
          title={event.name}
          lead={`${count ?? 0} registrations`}
        >
          <Button variant="outline" className="font-mono uppercase" asChild>
            <Link href={`/admin/events/${event.id}/registrations`}>
              Registrations
            </Link>
          </Button>
          <Button variant="outline" className="font-mono uppercase" asChild>
            <Link href={`/admin/events/${event.id}/check-in`}>Check-in</Link>
          </Button>
        </AdminIntro>
        <EventEditor event={event} registrations={count ?? 0} />
      </main>
      <AdminFooter />
    </div>
  );
}
