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

export default async function NewEventPage({
  searchParams,
}: PageProps<"/admin/events/new">) {
  const supabase = await createClient();
  if (!(await getAdmin(supabase))) redirect("/admin/login");

  const from = (await searchParams).from;
  const { data: template } =
    typeof from === "string"
      ? await supabase
          .from("ieee_registrations_events")
          .select("*")
          .eq("id", from)
          .maybeSingle()
      : { data: null };

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader />
      <main className="flex-1">
        <AdminIntro
          label="Admin · New event"
          title={template ? `Copy of ${template.name}` : "New event"}
          lead={
            template
              ? "The details, format and form are copied. Give it a name, a link and new dates."
              : "It stays a draft until you publish it."
          }
        />
        <EventEditor template={template ?? undefined} />
      </main>
      <AdminFooter />
    </div>
  );
}
