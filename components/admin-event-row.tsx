import Link from "next/link";
import { Button } from "@ieee/ui/components/button";
import { Reveal } from "@/components/motion/reveal";
import type { EventCounts } from "@/lib/admin-events";
import { getPhase, type Event } from "@/lib/events";
import { formatDateRange } from "@/lib/format";
import { PHASE_LABELS } from "@/lib/phase";

export function AdminEventRow({
  event,
  counts,
  index,
}: {
  event: Event;
  counts?: EventCounts;
  index: number;
}) {
  const draft = event.status !== "published";
  const confirmed = counts?.confirmed ?? 0;
  const stats = [
    {
      label: "Seats",
      value: event.capacity
        ? `${confirmed} / ${event.capacity}`
        : `${confirmed}`,
    },
    { label: "Waitlist", value: `${counts?.waitlisted ?? 0}` },
    { label: "Checked in", value: `${counts?.checkedIn ?? 0}` },
  ];

  return (
    <Reveal
      as="li"
      delay={Math.min(index, 6) * 0.06}
      y={16}
      className="grid gap-5 border-b px-4 py-6 md:grid-cols-4 md:gap-3 md:px-5 md:py-8"
    >
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase">
        <span
          className={`px-2 py-0.5 font-semibold ${draft ? "border" : "bg-foreground text-background"}`}
        >
          {draft ? "Draft" : "Published"}
        </span>
        <span className="text-muted-foreground">
          {PHASE_LABELS[getPhase(event)]}
        </span>
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <Link
          href={`/admin/events/${event.id}`}
          className="font-display text-3xl leading-[0.9] font-black tracking-[-0.045em] text-balance uppercase hover:opacity-60 md:text-4xl"
        >
          {event.name}
        </Link>
        <p className="font-mono text-xs text-muted-foreground uppercase">
          /{event.slug} · {formatDateRange(event.starts_at, event.ends_at)}
          {event.mode === "team" &&
            ` · Teams of ${event.team_min}–${event.team_max}`}
        </p>
        <dl className="mt-3 grid max-w-md grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 border-t pt-2">
              <dt className="font-mono text-[0.65rem] text-muted-foreground uppercase">
                {stat.label}
              </dt>
              <dd className="font-display text-xl font-bold tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
        <Button variant="outline" className="font-mono uppercase" asChild>
          <Link href={`/admin/events/${event.id}`}>Edit</Link>
        </Button>
        <Button variant="outline" className="font-mono uppercase" asChild>
          <Link href={`/admin/events/${event.id}/registrations`}>
            Registrations
          </Link>
        </Button>
        <Button variant="outline" className="font-mono uppercase" asChild>
          <Link href={`/admin/events/${event.id}/check-in`}>Check-in</Link>
        </Button>
      </div>
    </Reveal>
  );
}
