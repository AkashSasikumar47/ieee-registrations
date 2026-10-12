import type { Metadata } from "next";
import { EventCard } from "@/components/event-card";
import { Reveal } from "@/components/motion/reveal";
import { PageIntro } from "@/components/page-intro";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPhase } from "@/lib/events";
import { loadEvents } from "@/lib/load-events";

export const metadata: Metadata = { title: "Events | Registrations" };

const GROUPS = [
  { label: "Open now", phases: ["open"] },
  { label: "Coming soon", phases: ["upcoming"] },
  { label: "Past", phases: ["closed", "over"] },
];

export default async function EventsPage() {
  const { events, taken } = await loadEvents();
  const all = events ?? [];

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageIntro
          label="Events"
          title="Every event, one place"
          lead="Hackathons, workshops, ideathons, talks and fests from IEEE SRMIST. Pick one to see the details, and register while it is open."
        />
        {all.length === 0 ? (
          <p className="px-gutter py-16 font-mono text-sm text-muted-foreground uppercase">
            No events yet. Check back soon.
          </p>
        ) : (
          GROUPS.map((group) => {
            const list = all.filter((event) =>
              group.phases.includes(getPhase(event)),
            );
            if (group.label === "Past") list.reverse();
            if (!list.length) return null;
            return (
              <section
                key={group.label}
                className="grid gap-6 border-b px-gutter py-7 md:grid-cols-4 md:gap-3 md:py-9"
              >
                <p className="font-mono text-xs uppercase">
                  {group.label} ({list.length})
                </p>
                <ul className="grid gap-x-3 gap-y-10 sm:grid-cols-2 md:col-span-3 lg:grid-cols-3">
                  {list.map((event, index) => (
                    <Reveal as="li" key={event.id} delay={index * 0.08}>
                      <EventCard
                        event={event}
                        taken={taken.get(event.id) ?? 0}
                      />
                    </Reveal>
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
