import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@ieee/ui/components/button";
import { externalLinkProps } from "@ieee/ui/lib/external-link";
import { EventPoster } from "@/components/event-poster";
import { RegisterPanel } from "@/components/register-panel";
import { SeatsBar } from "@/components/seats-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  FORMAT_LABELS,
  getPhase,
  KIND_LABELS,
  parseFields,
  type Event,
} from "@/lib/events";
import { formatDateRange, formatDayTime, formatMonth } from "@/lib/format";
import { loadEvent } from "@/lib/load-event";

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const loaded = await loadEvent((await params).slug);
  return { title: loaded ? `${loaded.event.name} | Registrations` : undefined };
}

function participation(event: Event) {
  if (event.mode === "solo") return "Solo";
  if (event.team_min === 1) return `Solo or teams of up to ${event.team_max}`;
  return `Teams of ${event.team_min}–${event.team_max}`;
}

function registrations(count: number) {
  return `${count} ${count === 1 ? "registration" : "registrations"}`;
}

function daysLeft(until: string) {
  const days = Math.ceil((new Date(until).getTime() - Date.now()) / 86_400_000);
  return days <= 1 ? "Closes within a day" : `Closes in ${days} days`;
}

export default async function EventPage({
  params,
  searchParams,
}: PageProps<"/[slug]">) {
  const loaded = await loadEvent((await params).slug);
  if (!loaded) notFound();

  const { event, taken } = loaded;
  const code = (await searchParams).code;
  const phase = getPhase(event);
  const team = event.mode === "team";

  const hasWindow = event.opens_at && event.closes_at;
  const open = phase === "open" && event.closes_at;
  const details = [
    { label: "When", value: formatDateRange(event.starts_at, event.ends_at) },
    {
      label: "Where",
      value:
        event.format === "online"
          ? FORMAT_LABELS.online
          : event.venue || FORMAT_LABELS.campus,
    },
    { label: "Kind", value: KIND_LABELS[event.kind] ?? event.kind },
    { label: "Participation", value: participation(event) },
    ...(taken > 0
      ? [
          {
            label: "Registered",
            value: registrations(taken),
          },
        ]
      : []),
    ...(phase === "upcoming" && event.opens_at
      ? [{ label: "Opens", value: formatDayTime(event.opens_at) }]
      : open
        ? [{ label: "Closes", value: formatDayTime(open) }]
        : []),
  ];

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="grid w-full gap-10 px-gutter py-8 md:py-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <div className="aspect-[16/9]">
              <EventPoster
                seed={event.slug}
                name={event.name}
                label={KIND_LABELS[event.kind] ?? event.kind}
                accent={event.accent}
                backdrop={event.backdrop}
              />
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                {open
                  ? daysLeft(open)
                  : phase === "upcoming"
                    ? "Opening soon"
                    : phase === "over"
                      ? `Held · ${formatMonth(event.starts_at)}`
                      : "Registrations closed"}
              </p>
              <h1 className="font-display text-3xl leading-[0.9] font-black tracking-[-0.045em] text-balance uppercase md:text-5xl">
                {event.name}
              </h1>
              {event.summary && (
                <p className="whitespace-pre-line text-muted-foreground">
                  {event.summary}
                </p>
              )}
              {event.about && (
                <p className="text-sm whitespace-pre-line text-muted-foreground">
                  {event.about}
                </p>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-x-8">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="flex flex-col gap-1 border-t py-4"
                >
                  <dt className="font-mono text-xs text-muted-foreground uppercase">
                    {detail.label}
                  </dt>
                  <dd className="text-sm font-medium">{detail.value}</dd>
                </div>
              ))}
            </dl>
            {phase === "open" && <SeatsBar event={event} taken={taken} />}
          </aside>

          {phase === "over" || (phase === "closed" && !hasWindow) ? (
            <section className="flex flex-col justify-between gap-10 border bg-card p-6 md:p-10">
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-2xl font-black tracking-[-0.03em] uppercase">
                  {phase === "over"
                    ? "This event has ended"
                    : "No registration here"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {taken > 0
                    ? `${registrations(taken)} for this event.`
                    : hasWindow
                      ? "Registrations for this event have closed."
                      : "Registrations for this event did not run through this site."}
                </p>
              </div>
              {event.website && (
                <Button className="self-start font-mono uppercase" asChild>
                  <a href={event.website} {...externalLinkProps(event.website)}>
                    Visit the event website
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
              )}
            </section>
          ) : (
            <section className="flex flex-col gap-6 border bg-card p-6 md:p-10">
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-2xl font-black tracking-[-0.03em] uppercase">
                  {team ? "Register your team" : "Register"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {team
                    ? "The team lead creates the team and gets an invite code. Teammates join with that code."
                    : "Takes about a minute. Your ticket appears as soon as you're done."}
                </p>
              </div>
              {open ? (
                <RegisterPanel
                  slug={event.slug}
                  team={team}
                  fields={parseFields(event.fields)}
                  inviteCode={
                    typeof code === "string" ? code.toUpperCase() : ""
                  }
                />
              ) : (
                <p className="border border-dashed p-6 text-sm text-muted-foreground">
                  {phase === "upcoming" && event.opens_at
                    ? `Registrations open ${formatDayTime(event.opens_at)}. Come back then.`
                    : "Registrations for this event have closed."}
                </p>
              )}
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
