"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@ieee/ui/components/button";
import { Input } from "@ieee/ui/components/input";
import type { CheckInEntry } from "@/lib/check-ins";
import { formatDayTime } from "@/lib/format";

export function CheckInPeople({
  entries,
  pending,
  onToggle,
}: {
  entries: CheckInEntry[];
  pending: string | null;
  onToggle: (entry: CheckInEntry) => void;
}) {
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const shown = (
    search
      ? entries.filter((entry) =>
          [
            entry.name,
            entry.register_number,
            entry.team ?? "",
            entry.ticket_code,
          ].some((value) => value.toLowerCase().includes(search)),
        )
      : entries
  )
    .slice()
    .sort(
      (a, b) =>
        Number(Boolean(a.checked_in_at)) - Number(Boolean(b.checked_in_at)),
    );

  return (
    <div className="flex flex-col">
      <Input
        type="search"
        aria-label="Search people"
        placeholder="Name, register number, team or ticket code"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="h-12 text-base"
      />
      {shown.length === 0 ? (
        <p className="py-12 font-mono text-xs text-muted-foreground uppercase">
          {entries.length === 0
            ? "No confirmed registrations yet."
            : "Nobody matches that search."}
        </p>
      ) : (
        <ul className="mt-3 flex flex-col border-t">
          {shown.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-4 border-b py-3"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-semibold">{entry.name}</span>
                <span className="truncate font-mono text-xs text-muted-foreground uppercase">
                  {entry.register_number}
                  {entry.team && ` · ${entry.team}`}
                  {entry.checked_in_at &&
                    ` · In at ${formatDayTime(entry.checked_in_at)}`}
                </span>
              </div>
              <Button
                variant={entry.checked_in_at ? "outline" : "default"}
                className="shrink-0 font-mono uppercase"
                disabled={pending === entry.id}
                onClick={() => onToggle(entry)}
              >
                {entry.checked_in_at ? (
                  <>
                    <Check /> In
                  </>
                ) : (
                  "Check in"
                )}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
