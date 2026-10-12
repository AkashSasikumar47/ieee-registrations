import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@ieee/ui/components/badge";
import { Button } from "@ieee/ui/components/button";
import { EventActions } from "@/components/event-actions";
import { loadAdminEvent } from "@/lib/admin-event";
import { getPhase } from "@/lib/events";
import { formatDateRange, formatDayTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Overview | Registrations admin",
  robots: { index: false },
};

function days(until: string) {
  const count = Math.ceil(
    (new Date(until).getTime() - Date.now()) / 86_400_000,
  );
  return count <= 1 ? "within a day" : `in ${count} days`;
}

export default async function EventOverviewPage({
  params,
}: PageProps<"/admin/events/[id]">) {
  const { supabase, event } = await loadAdminEvent((await params).id);
  const [{ data: counts }, { data: latest }] = await Promise.all([
    supabase.rpc("ieee_registrations_counts"),
    supabase
      .from("ieee_registrations_entries")
      .select(
        "id, name, status, created_at, ticket_code, team:ieee_registrations_teams(name)",
      )
      .eq("event_id", event.id)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const count = counts?.find((row) => row.event_id === event.id);
  const confirmed = count?.confirmed ?? 0;
  const phase = getPhase(event);
  const registers = event.opens_at !== null && event.closes_at !== null;

  const status = !registers
    ? "No registration through this site"
    : phase === "open" && event.closes_at
      ? `Registrations open · close ${days(event.closes_at)} (${formatDayTime(event.closes_at)})`
      : phase === "upcoming" && event.opens_at
        ? `Registrations open ${days(event.opens_at)} (${formatDayTime(event.opens_at)})`
        : "Registrations closed";

  const stats = [
    {
      label: "Confirmed",
      value: event.capacity
        ? `${confirmed} / ${event.capacity}`
        : `${confirmed}`,
    },
    { label: "Waitlisted", value: `${count?.waitlisted ?? 0}` },
    { label: "Checked in", value: `${count?.checked_in ?? 0}` },
    { label: "Cancelled", value: `${count?.cancelled ?? 0}` },
  ];

  return (
    <>
      <div className="flex min-w-0 flex-col gap-8 px-gutter py-6 md:py-8">
        <div className="flex flex-col gap-1">
          <p className="font-semibold">{status}</p>
          <p className="font-mono text-xs text-muted-foreground uppercase">
            {formatDateRange(event.starts_at, event.ends_at)}
            {event.format === "online"
              ? " · Online"
              : event.venue && ` · ${event.venue}`}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 border p-4">
              <dt className="font-mono text-xs text-muted-foreground uppercase">
                {stat.label}
              </dt>
              <dd className="font-display text-3xl font-black tracking-[-0.04em] tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-mono text-xs font-semibold uppercase">
              Latest registrations
            </h2>
            <Button
              variant="link"
              className="h-auto p-0 font-mono text-xs uppercase"
              asChild
            >
              <Link href={`/admin/events/${event.id}/registrations`}>
                See all <ArrowRight />
              </Link>
            </Button>
          </div>
          {latest && latest.length > 0 ? (
            <ul className="flex flex-col border-t">
              {latest.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-4 border-b py-3"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{entry.name}</span>
                    <span className="truncate font-mono text-xs text-muted-foreground uppercase">
                      {entry.team?.name ? `${entry.team.name} · ` : ""}
                      {formatDayTime(entry.created_at)}
                    </span>
                  </span>
                  <Badge
                    variant={
                      entry.status === "confirmed" ? "default" : "outline"
                    }
                    className="font-mono uppercase"
                  >
                    {entry.status}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="border border-dashed p-6 font-mono text-xs text-muted-foreground uppercase">
              No registrations yet.
            </p>
          )}
        </section>
      </div>

      <section
        aria-label="Quick actions"
        className="flex items-center overflow-x-auto border-t px-gutter"
      >
        <h2 className="shrink-0 pr-3 font-mono text-xs font-semibold tracking-wide uppercase">
          Quick actions
        </h2>
        <EventActions
          id={event.id}
          slug={event.slug}
          published={event.status === "published"}
          open={phase === "open"}
          registers={registers}
        />
      </section>
    </>
  );
}
