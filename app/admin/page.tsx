import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@ieee/ui/components/button";
import { createClient } from "@ieee/supabase/server";
import { AdminFooter } from "@/components/admin-footer";
import { AdminHeader } from "@/components/admin-header";
import { AdminIntro } from "@/components/admin-intro";
import { AdminEventRow } from "@/components/admin-event-row";
import { loadAdminEvents } from "@/lib/admin-events";
import { getAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Events | Registrations admin",
  robots: { index: false },
};

export default async function AdminPage() {
  const supabase = await createClient();
  const admin = await getAdmin(supabase);
  if (!admin) redirect("/admin/login");

  const { events, counts } = await loadAdminEvents(supabase);
  const published = events.filter((event) => event.status === "published");

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader />
      <main className="flex-1">
        <AdminIntro
          label={`Admin · ${admin.email ?? ""}`}
          title="Events"
          lead={`${events.length} events · ${published.length} published · ${events.length - published.length} drafts`}
        >
          <Button size="lg" className="font-mono uppercase" asChild>
            <Link href="/admin/events/new">
              <Plus /> New event
            </Link>
          </Button>
        </AdminIntro>
        {events.length === 0 ? (
          <p className="px-gutter py-16 font-mono text-sm text-muted-foreground uppercase">
            No events yet. Create the first one.
          </p>
        ) : (
          <ul className="flex flex-col">
            {events.map((event, index) => (
              <AdminEventRow
                key={event.id}
                event={event}
                counts={counts.get(event.id)}
                index={index}
              />
            ))}
          </ul>
        )}
      </main>
      <AdminFooter />
    </div>
  );
}
