import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@ieee/supabase/server";
import { AdminFooter } from "@/components/admin-footer";
import { AdminHeader } from "@/components/admin-header";
import { AdminIntro } from "@/components/admin-intro";
import { EventEditor } from "@/components/event-editor";
import { getAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "New event | Registrations admin",
  robots: { index: false },
};

export default async function NewEventPage() {
  if (!(await getAdmin(await createClient()))) redirect("/admin/login");

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader />
      <main className="flex-1">
        <AdminIntro
          label="Admin · New event"
          title="New event"
          lead="It stays a draft until you publish it."
        />
        <EventEditor />
      </main>
      <AdminFooter />
    </div>
  );
}
