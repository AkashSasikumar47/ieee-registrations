import { createClient } from "@ieee/supabase/server";
import { FindForm } from "@/components/find-form";
import { PageIntro } from "@/components/page-intro";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default async function FindPage() {
  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("ieee_registrations_events")
    .select("slug, name")
    .eq("status", "published")
    .order("starts_at", { ascending: false });

  if (error) console.error("Failed to load events:", error.message);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageIntro
          label="Find my ticket"
          title="Lost your ticket? Get it back"
          lead="Enter the event and the details you registered with. We'll take you straight to your ticket page."
        />
        <div className="grid gap-6 px-gutter py-10 md:grid-cols-4 md:gap-3 md:py-14">
          <p className="font-mono text-xs uppercase">Your details</p>
          <div className="border p-6 md:col-span-2 md:p-8">
            {events && events.length > 0 ? (
              <FindForm events={events} />
            ) : (
              <p className="text-sm text-muted-foreground">No events yet.</p>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
