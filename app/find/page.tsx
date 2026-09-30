import { createClient } from "@ieee/supabase/server";
import { FindForm } from "@/components/find-form";
import { SiteEnd } from "@/components/site-end";
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
    <div className="flex-1">
      <SiteHeader />
      <main>
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:gap-16 md:px-8 md:py-24">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Find my ticket
            </p>
            <h1 className="text-4xl leading-[0.95] font-extrabold tracking-tighter text-balance md:text-6xl">
              Lost your ticket? Get it back.
            </h1>
            <p className="text-lg text-muted-foreground">
              Enter the event and the details you registered with. We&apos;ll
              take you straight to your ticket page.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm md:p-10">
            {events && events.length > 0 ? (
              <FindForm events={events} />
            ) : (
              <p className="text-sm text-muted-foreground">No events yet.</p>
            )}
          </div>
        </div>
        <SiteEnd />
      </main>
    </div>
  );
}
