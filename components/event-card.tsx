import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EventPoster } from "@/components/event-poster";
import { SeatsBar } from "@/components/seats-bar";
import { getPhase, KIND_LABELS, FORMAT_LABELS, type Event } from "@/lib/events";
import { formatDateRange } from "@/lib/format";
import { toStripItems } from "@/lib/strip";

export function EventCard({ event, taken }: { event: Event; taken: number }) {
  const [item] = toStripItems([event]);
  const open = getPhase(event) === "open";

  return (
    <Link
      href={`/${event.slug}`}
      className="group flex flex-col gap-3 border-t pt-3"
    >
      <span className="block aspect-[4/5] overflow-hidden">
        <span className="block size-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105">
          <EventPoster
            seed={event.slug}
            name={event.name}
            label={KIND_LABELS[event.kind] ?? event.kind}
            accent={event.accent}
            backdrop={event.backdrop}
          />
        </span>
      </span>
      <span className="flex items-start justify-between gap-3 font-mono text-xs uppercase">
        <span className="flex flex-col">
          <span className="font-semibold">{event.name}</span>
          <span className="text-muted-foreground">{item?.status}</span>
        </span>
        <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
      </span>
      <span className="font-mono text-xs text-muted-foreground uppercase">
        {formatDateRange(event.starts_at, event.ends_at)}
        {` · ${event.format === "online" ? FORMAT_LABELS.online : event.venue || FORMAT_LABELS.campus}`}
      </span>
      {open ? <SeatsBar event={event} taken={taken} /> : null}
    </Link>
  );
}
