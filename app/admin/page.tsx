import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@ieee/ui/components/button";
import { createClient } from "@ieee/supabase/server";
import { AdminEvents } from "@/components/admin-events";
import { AdminFooter } from "@/components/admin-footer";
import { AdminHeader } from "@/components/admin-header";
import { AdminIntro } from "@/components/admin-intro";
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

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader />
      <main className="flex-1">
        <AdminIntro label={`Signed in as ${admin.email ?? ""}`} title="Events">
          <Button className="font-mono uppercase" asChild>
            <Link href="/admin/events/new">
              <Plus /> New event
            </Link>
          </Button>
        </AdminIntro>
        <AdminEvents events={events} counts={Object.fromEntries(counts)} />
      </main>
      <AdminFooter />
    </div>
  );
}
