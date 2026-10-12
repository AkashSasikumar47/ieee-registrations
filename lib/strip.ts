import { getPhase, type Event } from "@/lib/events";
import { formatShortDay, formatMonth } from "@/lib/format";
import type { StripItem } from "@/components/event-strip";

const ORDER = { open: 0, upcoming: 1, closed: 2, over: 3 };

function status(event: Event) {
  const phase = getPhase(event);
  if (phase === "open" && event.closes_at)
    return `Open · Closes ${formatShortDay(event.closes_at)}`;
  if (phase === "upcoming" && event.opens_at)
    return `Opens ${formatShortDay(event.opens_at)}`;
  if (phase === "closed") return `Closed · ${formatShortDay(event.starts_at)}`;
  return `Held · ${formatMonth(event.starts_at)}`;
}

export function toStripItems(events: Event[]): StripItem[] {
  return [...events]
    .sort(
      (a, b) =>
        ORDER[getPhase(a)] - ORDER[getPhase(b)] ||
        b.starts_at.localeCompare(a.starts_at),
    )
    .map((event) => ({
      slug: event.slug,
      name: event.name,
      kind: event.kind,
      accent: event.accent,
      backdrop: event.backdrop,
      status: status(event),
    }));
}
