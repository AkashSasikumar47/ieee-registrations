import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@ieee/ui/components/button";
import { Card, CardContent, CardFooter } from "@ieee/ui/components/card";
import { EventCover } from "@/components/event-cover";
import { SeatsBar } from "@/components/seats-bar";
import type { Event } from "@/lib/events";
import { formatDateRange, formatDayTime } from "@/lib/format";

export function EventCard({ event, taken }: { event: Event; taken: number }) {
  return (
    <Card className="gap-5 pt-0">
      <Link href={`/${event.slug}`} aria-label={event.name}>
        <EventCover
          event={event}
          className="aspect-[16/10] rounded-b-none border-0 border-b"
        />
      </Link>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">{event.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDateRange(event.starts_at, event.ends_at)}
            {event.venue && ` · ${event.venue}`}
          </p>
        </div>
        <SeatsBar event={event} taken={taken} />
      </CardContent>
      <CardFooter className="mt-auto justify-between gap-4">
        <span className="text-xs text-muted-foreground">
          Closes {formatDayTime(event.closes_at)}
        </span>
        <Button asChild>
          <Link href={`/${event.slug}`}>
            Register <ArrowRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
