import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@ieee/ui/components/button";
import { SeatsBar } from "@/components/seats-bar";
import type { Event } from "@/lib/events";
import { formatDateRange } from "@/lib/format";

export function TicketPreview({
  event,
  taken,
}: {
  event: Event;
  taken: number;
}) {
  return (
    <div className="relative flex flex-col rounded-xl border bg-card shadow-sm">
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Featured · Open now
          </span>
          <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
            {event.mode === "team"
              ? `Teams of ${event.team_min}–${event.team_max}`
              : "Solo"}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl leading-tight font-bold tracking-tight md:text-4xl">
            {event.name}
          </h2>
          <p className="text-muted-foreground">
            {formatDateRange(event.starts_at, event.ends_at)}
            {event.venue && ` · ${event.venue}`}
          </p>
        </div>
        <SeatsBar event={event} taken={taken} />
      </div>
      <div className="relative flex items-center">
        <span className="absolute -left-3 size-6 rounded-full border-r bg-background" />
        <span className="w-full border-t border-dashed" />
        <span className="absolute -right-3 size-6 rounded-full border-l bg-background" />
      </div>
      <div className="flex items-center justify-between gap-4 p-6 md:px-8">
        <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          Admit one · IEEE SRMIST
        </span>
        <Button asChild>
          <Link href={`/${event.slug}`}>
            Register <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
