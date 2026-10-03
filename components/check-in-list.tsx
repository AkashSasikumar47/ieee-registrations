"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { Alert, AlertDescription } from "@ieee/ui/components/alert";
import { Button } from "@ieee/ui/components/button";
import { Input } from "@ieee/ui/components/input";
import { DURATION, EASE_OUT } from "@/components/motion/timing";
import { useCheckIn } from "@/components/use-check-in";
import type { AdminEntry } from "@/lib/admin-entries";
import { formatDayTime } from "@/lib/format";

export function CheckInList({ entries }: { entries: AdminEntry[] }) {
  const { checkedInAt, toggle, pending, error } = useCheckIn();
  const [query, setQuery] = useState("");
  const confirmed = entries.filter((entry) => entry.status === "confirmed");
  const arrived = confirmed.filter((entry) => checkedInAt(entry)).length;
  const search = query.trim().toLowerCase();
  const shown = search
    ? confirmed.filter((entry) =>
        [
          entry.name,
          entry.register_number,
          entry.team ?? "",
          entry.ticket_code,
        ].some((value) => value.toLowerCase().includes(search)),
      )
    : confirmed;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 border-b px-site-4 py-6 md:px-site-5">
        <div className="flex items-end justify-between gap-4">
          <p className="font-display text-5xl leading-none font-black tracking-[-0.05em] tabular-nums md:text-6xl">
            {arrived}
            <span className="text-muted-foreground"> / {confirmed.length}</span>
          </p>
          <p className="font-mono text-xs text-muted-foreground uppercase">
            Arrived
          </p>
        </div>
        <div className="h-1.5 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{
              width: `${confirmed.length ? (arrived / confirmed.length) * 100 : 0}%`,
            }}
            transition={{ duration: DURATION.collapse, ease: EASE_OUT }}
          />
        </div>
        <Input
          type="search"
          autoFocus
          aria-label="Search"
          placeholder="Name, register number, team or ticket code"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-12 text-base"
        />
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
      {shown.length === 0 ? (
        <p className="px-site-4 py-12 font-mono text-xs text-muted-foreground uppercase md:px-site-5">
          {confirmed.length === 0
            ? "No confirmed registrations yet."
            : "Nobody matches that search."}
        </p>
      ) : (
        <ul className="flex flex-col">
          {shown.map((entry) => {
            const at = checkedInAt(entry);
            return (
              <li
                key={entry.id}
                className={`flex items-center justify-between gap-4 border-b px-site-4 py-4 md:px-site-5 ${at ? "bg-muted" : ""}`}
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-lg font-semibold">
                    {entry.name}
                  </span>
                  <span className="truncate font-mono text-xs text-muted-foreground uppercase">
                    {entry.register_number}
                    {entry.team && ` · ${entry.team}`}
                    {at && ` · In at ${formatDayTime(at)}`}
                  </span>
                </div>
                <Button
                  size="lg"
                  variant={at ? "outline" : "default"}
                  className="shrink-0 font-mono uppercase"
                  disabled={pending === entry.id}
                  onClick={() => toggle(entry)}
                >
                  {at ? (
                    <>
                      <Check /> In
                    </>
                  ) : (
                    "Check in"
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
