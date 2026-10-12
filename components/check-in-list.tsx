"use client";

import Link from "next/link";
import { ScanLine } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@ieee/ui/components/alert";
import { Button } from "@ieee/ui/components/button";
import { CheckInPeople } from "@/components/check-in-people";
import { CheckInProgress } from "@/components/check-in-progress";
import { useLiveCheckIns } from "@/components/use-live-check-ins";
import type { CheckInEntry } from "@/lib/check-ins";
import { formatDayTime } from "@/lib/format";

export function CheckInList({
  eventId,
  initial,
  scanUrl,
  qr,
}: {
  eventId: string;
  initial: CheckInEntry[];
  scanUrl: string;
  qr: string;
}) {
  const { entries, pending, error, toggle } = useLiveCheckIns(eventId, initial);

  async function flip(entry: CheckInEntry) {
    const wasIn = Boolean(entry.checked_in_at);
    if (await toggle(entry)) {
      toast.success(
        wasIn ? `Undid ${entry.name}'s check-in.` : `Checked in ${entry.name}.`,
      );
    }
  }

  const arrived = entries.filter((entry) => entry.checked_in_at);
  const last = arrived.reduce<CheckInEntry | null>(
    (latest, entry) =>
      !latest || (entry.checked_in_at ?? "") > (latest.checked_in_at ?? "")
        ? entry
        : latest,
    null,
  );
  const stats = [
    { label: "Arrived", value: String(arrived.length) },
    { label: "Still to come", value: String(entries.length - arrived.length) },
    {
      label: "Last check-in",
      value: last ? formatDayTime(last.checked_in_at ?? "") : "—",
      note: last?.name,
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="grid gap-6 border-b px-gutter py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-stretch lg:gap-10">
        <div className="flex flex-col justify-between gap-5">
          <CheckInProgress arrived={arrived.length} total={entries.length} />
          <dl className="grid grid-cols-3 border-t">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex min-w-0 flex-col gap-1 border-r py-3 pr-3 not-first:pl-4 last:border-r-0"
              >
                <dt className="font-mono text-xs text-muted-foreground uppercase">
                  {stat.label}
                </dt>
                <dd className="truncate text-lg font-semibold tabular-nums">
                  {stat.value}
                </dd>
                {stat.note && (
                  <dd className="truncate text-xs text-muted-foreground">
                    {stat.note}
                  </dd>
                )}
              </div>
            ))}
          </dl>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <aside className="flex items-center gap-5 border p-4 lg:w-[26rem]">
          <div
            className="w-28 shrink-0 [&_svg]:h-auto [&_svg]:w-full"
            role="img"
            aria-label="QR code for the scanner"
            dangerouslySetInnerHTML={{ __html: qr }}
          />
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="font-mono text-xs uppercase">Scan on a phone</h2>
              <p className="text-sm text-muted-foreground">
                Scan the code to open this event&apos;s scanner, then add it to
                the home screen.
              </p>
            </div>
            <Button
              asChild
              size="sm"
              className="self-start font-mono uppercase"
            >
              <Link href={scanUrl.replace(/^https?:\/\/[^/]+/, "")}>
                <ScanLine /> Open scanner
              </Link>
            </Button>
          </div>
        </aside>
      </div>
      <div className="px-gutter py-6">
        <CheckInPeople entries={entries} pending={pending} onToggle={flip} />
      </div>
    </div>
  );
}
