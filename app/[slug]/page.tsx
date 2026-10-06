import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventPoster } from "@/components/event-poster";
import { RegisterPanel } from "@/components/register-panel";
import { SeatsBar } from "@/components/seats-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPhase, parseFields } from "@/lib/events";
import { formatDateRange, formatDayTime } from "@/lib/format";
import { loadEvent } from "@/lib/load-event";

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const loaded = await loadEvent((await params).slug);
  return { title: loaded ? `${loaded.event.name} | Registrations` : undefined };
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

  const details = [
    { label: "When", value: formatDateRange(event.starts_at, event.ends_at) },
    ...(event.venue ? [{ label: "Where", value: event.venue }] : []),
    {
      label: "Format",
      value: team ? `Teams of ${event.team_min}–${event.team_max}` : "Solo",
    },
    {
      label: phase === "upcoming" ? "Opens" : "Closes",
      value: formatDayTime(
        phase === "upcoming" ? event.opens_at : event.closes_at,
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="grid w-full gap-10 px-gutter py-10 md:py-16 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <div className="aspect-[16/9]">
              <EventPoster name={event.name} mode={event.mode} />
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                {phase === "open"
                  ? daysLeft(event.closes_at)
                  : phase === "upcoming"
                    ? "Opening soon"
                    : "Registrations closed"}
              </p>
              <h1 className="font-display text-4xl leading-[0.9] font-black tracking-[-0.045em] text-balance uppercase md:text-6xl">
                {event.name}
              </h1>
              {event.summary && (
                <p className="whitespace-pre-line text-muted-foreground">
                  {event.summary}
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
            {phase === "open" ? (
              <RegisterPanel
                slug={event.slug}
                team={team}
                fields={parseFields(event.fields)}
                inviteCode={typeof code === "string" ? code.toUpperCase() : ""}
              />
            ) : (
              <p className="border border-dashed p-6 text-sm text-muted-foreground">
                {phase === "upcoming"
                  ? `Registrations open ${formatDayTime(event.opens_at)}. Come back then.`
                  : "Registrations for this event have closed."}
              </p>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
