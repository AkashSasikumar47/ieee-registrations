"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Badge } from "@ieee/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ieee/ui/components/table";
import type { EventCounts } from "@/lib/admin-events";
import { getPhase, KIND_LABELS, type Event } from "@/lib/events";
import { formatDateRange } from "@/lib/format";

const ORDER = { open: 0, upcoming: 1, closed: 2, over: 3 };

function state(event: Event, now: Date) {
  if (event.status !== "published") return "Draft";
  const phase = getPhase(event, now);
  if (phase === "open") return "Open";
  if (phase === "upcoming") return "Opens soon";
  if (phase === "closed") return "Closed";
  return "Ended";
}

export function AdminEvents({
  events,
  counts,
}: {
  events: Event[];
  counts: Record<string, EventCounts>;
}) {
  const router = useRouter();
  const [now] = useState(() => new Date());
  const shown = [...events].sort(
    (a, b) =>
      Number(a.status === "published") - Number(b.status === "published") ||
      ORDER[getPhase(a, now)] - ORDER[getPhase(b, now)] ||
      b.starts_at.localeCompare(a.starts_at),
  );

  if (shown.length === 0) {
    return (
      <p className="px-gutter py-12 font-mono text-xs text-muted-foreground uppercase">
        No events yet. Create the first one.
      </p>
    );
  }

  return (
    <div className="px-gutter">
      <Table>
        <TableHeader>
          <TableRow className="font-mono text-xs uppercase">
            <TableHead className="pl-0">Event</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden text-right sm:table-cell">
              Confirmed
            </TableHead>
            <TableHead className="hidden text-right sm:table-cell">
              Waitlist
            </TableHead>
            <TableHead className="hidden text-right sm:table-cell">
              Checked in
            </TableHead>
            <TableHead className="w-10 pr-0" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {shown.map((event) => {
            const count = counts[event.id];
            const confirmed = count?.confirmed ?? 0;
            const href = `/admin/events/${event.id}`;
            return (
              <TableRow
                key={event.id}
                className="cursor-pointer"
                onClick={() => router.push(href)}
              >
                <TableCell className="py-3.5 pl-0">
                  <Link href={href} className="flex flex-col gap-0.5">
                    <span className="font-semibold">{event.name}</span>
                    <span className="font-mono text-xs text-muted-foreground uppercase">
                      {KIND_LABELS[event.kind] ?? event.kind} ·{" "}
                      {formatDateRange(event.starts_at, event.ends_at)}
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      state(event, now) === "Open" ? "default" : "outline"
                    }
                    className="font-mono uppercase"
                  >
                    {state(event, now)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-right tabular-nums sm:table-cell">
                  {event.capacity
                    ? `${confirmed} / ${event.capacity}`
                    : confirmed}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums sm:table-cell">
                  {count?.waitlisted ?? 0}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums sm:table-cell">
                  {count?.checkedIn ?? 0}
                </TableCell>
                <TableCell className="pr-0">
                  <ChevronRight
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
