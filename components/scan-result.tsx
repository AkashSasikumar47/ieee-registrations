"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Undo2, X } from "lucide-react";
import { Button } from "@ieee/ui/components/button";
import { EASE_OUT } from "@/components/motion/timing";
import type { ScanResult } from "@/components/use-live-check-ins";
import { formatDayTime } from "@/lib/format";

const TITLES: Record<ScanResult["result"], string> = {
  in: "Checked in",
  already: "Already checked in",
  waitlisted: "On the waitlist",
  cancelled: "Registration cancelled",
  other_event: "Ticket for another event",
  unknown: "Not a valid ticket",
  offline: "Couldn't reach the server",
};

export function ScanResultCard({
  scan,
  undoing,
  onUndo,
}: {
  scan: ScanResult | null;
  undoing: boolean;
  onUndo: () => void;
}) {
  const ok = scan?.result === "in";
  const detail = !scan
    ? ""
    : scan.result === "already" && scan.person?.checked_in_at
      ? `Came in at ${formatDayTime(scan.person.checked_in_at)}. Don't let them in twice.`
      : scan.result === "waitlisted"
        ? "Not confirmed, so they can't check in."
        : scan.result === "cancelled"
          ? "This registration was cancelled."
          : scan.result === "other_event"
            ? "Check the event this ticket is for."
            : scan.result === "unknown"
              ? "This QR code isn't an IEEE SRMIST ticket."
              : scan.result === "offline"
                ? "Check the connection and scan again."
                : "";

  return (
    <div aria-live="polite" className="min-h-28">
      <AnimatePresence mode="wait" initial={false}>
        {scan ? (
          <motion.div
            key={scan.at}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className={`flex items-start gap-4 border border-l-4 p-4 ${ok ? "border-l-primary" : "border-l-destructive"}`}
          >
            <span
              className={`flex size-9 shrink-0 items-center justify-center ${ok ? "bg-primary text-primary-foreground" : "bg-destructive text-primary-foreground"}`}
            >
              {ok ? <Check className="size-5" /> : <X className="size-5" />}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="font-mono text-xs tracking-wide uppercase">
                {TITLES[scan.result]}
              </p>
              {scan.person && (
                <p className="truncate text-xl leading-tight font-bold">
                  {scan.person.name}
                </p>
              )}
              {scan.person && (
                <p className="truncate font-mono text-xs text-muted-foreground uppercase">
                  {scan.person.register_number}
                  {scan.person.team && ` · ${scan.person.team}`}
                </p>
              )}
              {detail && (
                <p className="text-sm text-muted-foreground">{detail}</p>
              )}
            </div>
            {ok && (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 font-mono uppercase"
                disabled={undoing}
                onClick={onUndo}
              >
                <Undo2 /> Undo
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.p
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-28 items-center justify-center border border-dashed p-4 text-center font-mono text-xs text-muted-foreground uppercase"
          >
            Point the camera at a ticket&apos;s QR code
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
