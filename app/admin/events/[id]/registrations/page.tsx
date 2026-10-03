import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@ieee/ui/components/button";
import { AdminFooter } from "@/components/admin-footer";
import { AdminHeader } from "@/components/admin-header";
import { AdminIntro } from "@/components/admin-intro";
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
  const count = (status: string) =>
    entries.filter((entry) => entry.status === status).length;
  const confirmed = count("confirmed");
  const stats = [
    {
      label: "Confirmed",
      value: event.capacity
        ? `${confirmed} / ${event.capacity}`
        : `${confirmed}`,
    },
    { label: "Waitlisted", value: `${count("waitlisted")}` },
    { label: "Cancelled", value: `${count("cancelled")}` },
    {
      label: "Checked in",
      value: `${entries.filter((entry) => entry.checked_in_at).length}`,
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader />
      <main className="flex-1">
        <AdminIntro label={`Admin · /${event.slug}`} title={event.name}>
          <Button className="font-mono uppercase" asChild>
            <a href={`/api/admin/events/${event.id}/csv`} download>
              <Download /> Download CSV
            </a>
          </Button>
          <Button variant="outline" className="font-mono uppercase" asChild>
            <Link href={`/admin/events/${event.id}/check-in`}>Check-in</Link>
          </Button>
          <Button variant="outline" className="font-mono uppercase" asChild>
            <Link href={`/admin/events/${event.id}`}>Edit</Link>
          </Button>
        </AdminIntro>
        <dl className="grid grid-cols-2 gap-3 px-site-4 py-8 md:grid-cols-4 md:px-site-5">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 border-t pt-3">
              <dt className="font-mono text-xs text-muted-foreground uppercase">
                {stat.label}
              </dt>
              <dd className="font-display text-4xl font-black tracking-[-0.04em] tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="pb-12">
          <RegistrationsTable
            entries={entries}
            fields={parseFields(event.fields)}
            over={new Date(event.ends_at) <= new Date()}
          />
        </div>
      </main>
      <AdminFooter />
    </div>
  );
}
