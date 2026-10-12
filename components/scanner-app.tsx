"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, Camera, Check, LogOut, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@ieee/ui/components/alert";
import { Button } from "@ieee/ui/components/button";
import { AdminFooter } from "@/components/admin-footer";
import { CheckInPeople } from "@/components/check-in-people";
import { CheckInProgress } from "@/components/check-in-progress";
import { ScanResultCard } from "@/components/scan-result";
import { TicketScanner } from "@/components/ticket-scanner";
import {
  useLiveCheckIns,
  type ScanResult,
} from "@/components/use-live-check-ins";
import type { CheckInEntry } from "@/lib/check-ins";
import { formatDayTime } from "@/lib/format";
import { SCAN_EVENT_KEY } from "@/lib/scan";

export function ScannerApp({
  event,
  initial,
}: {
  event: { id: string; name: string };
  initial: CheckInEntry[];
}) {
  const { entries, pending, error, toggle, scan } = useLiveCheckIns(
    event.id,
    initial,
  );
  const [camera, setCamera] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SCAN_EVENT_KEY, event.id);
    } catch {}
    if (window.matchMedia("(pointer: coarse)").matches) setCamera(true);
  }, [event.id]);

  async function scanned(code: string) {
    const next = await scan(code);
    setResult(next);
    navigator.vibrate?.(next.result === "in" ? 60 : [40, 60, 40]);
  }

  async function flip(entry: CheckInEntry) {
    const wasIn = Boolean(entry.checked_in_at);
    if (await toggle(entry)) {
      toast.success(
        wasIn ? `Undid ${entry.name}'s check-in.` : `Checked in ${entry.name}.`,
      );
      if (wasIn && result?.person?.id === entry.id) setResult(null);
    }
  }

  const undoTarget =
    result?.result === "in" && result.person
      ? entries.find((entry) => entry.id === result.person?.id)
      : undefined;
  const arrived = entries.filter((entry) => entry.checked_in_at);
  const recent = arrived
    .slice()
    .sort((a, b) =>
      (b.checked_in_at ?? "").localeCompare(a.checked_in_at ?? ""),
    )
    .slice(0, 6);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-background px-gutter pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div className="flex min-w-0 flex-col">
          <span className="font-mono text-xs text-muted-foreground uppercase">
            Check-in
          </span>
          <span className="font-display truncate text-lg leading-tight font-black tracking-[-0.03em] uppercase">
            {event.name}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/scan?pick=1">
              <ArrowLeftRight />{" "}
              <span className="sr-only sm:not-sr-only">Switch</span>
            </Link>
          </Button>
          <form action="/api/auth/logout" method="post">
            <input type="hidden" name="from" value="scan" />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              aria-label="Sign out"
            >
              <LogOut />
            </Button>
          </form>
        </div>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-8 px-gutter py-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:py-8">
        <div className="flex flex-col gap-5">
          {camera ? (
            <div className="flex flex-col gap-3">
              <TicketScanner onCode={scanned} />
              <Button
                variant="outline"
                className="self-center font-mono uppercase"
                onClick={() => setCamera(false)}
              >
                <X /> Close camera
              </Button>
            </div>
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">
                The camera is off. Scan tickets here, or check people in from
                the list.
              </p>
              <Button
                className="font-mono uppercase"
                onClick={() => {
                  setCamera(true);
                  setResult(null);
                }}
              >
                <Camera /> Open camera
              </Button>
            </div>
          )}
          <ScanResultCard
            scan={result}
            undoing={pending === undoTarget?.id}
            onUndo={() => undoTarget && flip(undoTarget)}
          />
          <CheckInProgress arrived={arrived.length} total={entries.length} />
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {recent.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="font-mono text-xs text-muted-foreground uppercase">
                Latest check-ins · every scanner
              </h2>
              <ul className="flex flex-col border-t">
                {recent.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3 border-b py-2 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Check className="size-4 shrink-0 text-primary" />
                      <span className="truncate">{entry.name}</span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {formatDayTime(entry.checked_in_at ?? "")}
                      </span>
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-mono uppercase"
                      disabled={pending === entry.id}
                      onClick={() => flip(entry)}
                    >
                      <Undo2 /> Undo
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="font-mono text-xs text-muted-foreground uppercase">
            No ticket? Find them here
          </h2>
          <CheckInPeople entries={entries} pending={pending} onToggle={flip} />
        </section>
      </main>
      <AdminFooter />
    </div>
  );
}
