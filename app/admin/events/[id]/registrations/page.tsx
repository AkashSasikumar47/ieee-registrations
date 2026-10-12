import type { Metadata } from "next";
import { RegistrationsTable } from "@/components/registrations-table";
import { loadAdminEventPage } from "@/lib/admin-page";
import { parseFields } from "@/lib/events";

export const metadata: Metadata = {
  title: "Registrations | Registrations admin",
  robots: { index: false },
};

export default async function RegistrationsPage({
  params,
}: PageProps<"/admin/events/[id]/registrations">) {
  const { event, entries } = await loadAdminEventPage(params);

  return (
    <div className="pb-12">
      <RegistrationsTable
        eventId={event.id}
        team={event.mode === "team"}
        capacity={event.capacity}
        entries={entries}
        fields={parseFields(event.fields)}
      />
    </div>
  );
}
