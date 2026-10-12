import type { Metadata } from "next";
import { EventEditor } from "@/components/event-editor";
import { loadAdminEvent } from "@/lib/admin-event";

export const metadata: Metadata = {
  title: "Settings | Registrations admin",
  robots: { index: false },
};

export default async function EventSettingsPage({
  params,
}: PageProps<"/admin/events/[id]/settings">) {
  const { supabase, event } = await loadAdminEvent((await params).id);
  const { count } = await supabase
    .from("ieee_registrations_entries")
    .select("id", { count: "exact", head: true })
    .eq("event_id", event.id);

  return <EventEditor event={event} registrations={count ?? 0} />;
}
