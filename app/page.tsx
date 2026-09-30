import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@ieee/ui/components/button";
import { Faq } from "@ieee/ui/event/faq";
import { gridColumns, Section, SectionHeading } from "@ieee/ui/event/section";
import { EventCard } from "@/components/event-card";
import { SiteEnd } from "@/components/site-end";
import { SiteHeader } from "@/components/site-header";
import { TicketPreview } from "@/components/ticket-preview";
import { getPhase } from "@/lib/events";
import { FAQS } from "@/lib/faqs";
import { formatDateRange, formatDayTime } from "@/lib/format";
import { loadEvents } from "@/lib/load-events";

const STEPS = [
  {
    title: "Pick an event",
    description:
      "Browse what's open and check the dates, format and seats left.",
  },
  {
    title: "Register",
    description:
      "Sign up on your own, or create a team and invite your teammates with a code.",
  },
  {
    title: "Get your ticket",
    description:
      "Your QR ticket is ready instantly. Show it at the venue to check in.",
  },
];

export default async function HomePage() {
  const { events, taken } = await loadEvents();
  const all = events ?? [];
  const open = all.filter((event) => getPhase(event) === "open");
  const upcoming = all.filter((event) => getPhase(event) === "upcoming");
  const past = all
    .filter((event) => ["closed", "over"].includes(getPhase(event)))
    .reverse();
  const [featured] = open;

  return (
    <div className="flex-1">
      <SiteHeader />
      <main>
        <section className="border-b">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
            <div className="flex flex-col gap-6">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                IEEE SRMIST Student Branch
              </p>
              <h1 className="text-5xl leading-[0.95] font-extrabold tracking-tighter text-balance md:text-7xl">
                Every event. One place to register.
              </h1>
              <p className="text-lg text-muted-foreground">
                Hackathons, workshops and ideathons from IEEE SRMIST. Register
                in a minute, bring your team, and get your ticket instantly.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <a href="#events">
                    Browse events <ArrowRight />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/find">Find my ticket</Link>
                </Button>
              </div>
            </div>
            {featured ? (
              <TicketPreview
                event={featured}
                taken={taken.get(featured.id) ?? 0}
              />
            ) : (
              <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                No registrations are open right now. Check back soon.
              </div>
            )}
          </div>
        </section>

        <Section id="events">
          <SectionHeading
            eyebrow="Open now"
            title="Register before seats run out."
          />
          {open.length > 0 ? (
            <div className={`grid gap-3 ${gridColumns(open.length)}`}>
              {open.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  taken={taken.get(event.id) ?? 0}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nothing is open right now.</p>
          )}
        </Section>

        {upcoming.length > 0 && (
          <Section id="upcoming" className="pt-0 md:pt-0">
            <SectionHeading eyebrow="Coming soon" title="Opening shortly." />
            <ul className="flex flex-col">
              {upcoming.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/${event.slug}`}
                    className="grid gap-1 border-t py-5 hover:bg-accent/40 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8"
                  >
                    <span className="flex flex-col gap-1">
                      <span className="font-semibold">{event.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDateRange(event.starts_at, event.ends_at)}
                        {event.venue && ` · ${event.venue}`}
                      </span>
                    </span>
                    <span className="text-sm font-medium">
                      Opens {formatDayTime(event.opens_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section id="how-it-works" className="border-y">
          <SectionHeading
            eyebrow="How it works"
            title="Three steps to your seat."
          />
          <ol className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex flex-col gap-3 border-t pt-4"
              >
                <span className="text-5xl font-extrabold tracking-tighter text-muted-foreground tabular-nums">
                  0{index + 1}
                </span>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        {past.length > 0 && (
          <Section id="past">
            <SectionHeading
              eyebrow="Past events"
              title="Registrations closed."
            />
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {past.map((event) => (
                <li
                  key={event.id}
                  className="flex justify-between gap-4 border-t py-4 text-sm"
                >
                  <span className="font-medium">{event.name}</span>
                  <span className="text-muted-foreground">
                    {formatDateRange(event.starts_at, event.ends_at)}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Faq faqs={FAQS} />
        <SiteEnd />
      </main>
    </div>
  );
}
