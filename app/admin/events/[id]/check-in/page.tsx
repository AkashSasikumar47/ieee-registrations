import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@ieee/ui/components/button";
import { AdminFooter } from "@/components/admin-footer";
import { AdminHeader } from "@/components/admin-header";
import { AdminIntro } from "@/components/admin-intro";
import { CheckInList } from "@/components/check-in-list";
import { loadAdminEventPage } from "@/lib/admin-page";

export const metadata: Metadata = {
  title: "Check-in | Registrations admin",
  robots: { index: false },
};

export default async function CheckInPage({
  params,
}: PageProps<"/admin/events/[id]/check-in">) {
  const { event, entries } = await loadAdminEventPage(params);

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader />
      <main className="flex-1">
        <AdminIntro
          label={`Check-in · /${event.slug}`}
          title={event.name}
          lead="Scan tickets with this device's camera, or search by name."
        >
          <Button variant="outline" className="font-mono uppercase" asChild>
            <Link href={`/admin/events/${event.id}/registrations`}>
              Registrations
            </Link>
          </Button>
        </AdminIntro>
        <CheckInList entries={entries} />
      </main>
      <AdminFooter />
    </div>
  );
}
