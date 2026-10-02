import { getPhase, type Event } from "@/lib/events";
import { formatShortDay } from "@/lib/format";
import type { StripItem } from "@/components/event-strip";

const ORDER = { open: 0, upcoming: 1, closed: 2, over: 3 };

function status(event: Event) {
  const phase = getPhase(event);
  if (phase === "open")
    return `Open · Closes ${formatShortDay(event.closes_at)}`;
  if (phase === "upcoming") return `Opens ${formatShortDay(event.opens_at)}`;
  if (phase === "closed") return `Closed · ${formatShortDay(event.starts_at)}`;
  return `Ended · ${formatShortDay(event.starts_at)}`;
}

export function toStripItems(events: Event[]): StripItem[] {
  return [...events]
    .sort((a, b) => ORDER[getPhase(a)] - ORDER[getPhase(b)])
    .map((event) => ({
      slug: event.slug,
      name: event.name,
      mode: event.mode,
      status: status(event),
    }));
}
