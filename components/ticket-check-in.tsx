"use client";

import { Check } from "lucide-react";
import { Alert, AlertDescription } from "@ieee/ui/components/alert";
import { Button } from "@ieee/ui/components/button";
import { Reveal } from "@/components/motion/reveal";
import { useCheckIn } from "@/components/use-check-in";
import { formatDayTime } from "@/lib/format";

export function TicketCheckIn({
  entry,
  confirmed,
}: {
  entry: { id: string; checked_in_at: string | null };
  confirmed: boolean;
}) {
  const { checkedInAt, toggle, pending, error } = useCheckIn();
  const at = checkedInAt(entry);

  return (
    <Reveal
      trigger="mount"
      y={12}
      className={`flex flex-col gap-4 border p-5 md:flex-row md:items-center md:justify-between md:p-6 ${at ? "bg-foreground text-background" : ""}`}
    >
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase opacity-70">
          Admin · Check-in
        </span>
        <span className="font-display text-3xl font-black tracking-[-0.04em] uppercase">
          {!confirmed
            ? "Not confirmed"
            : at
              ? `In at ${formatDayTime(at)}`
              : "Not checked in"}
        </span>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {confirmed && (
        <Button
          size="lg"
          variant={at ? "secondary" : "default"}
          className="h-14 px-8 font-mono text-base uppercase"
          disabled={pending === entry.id}
          onClick={() => toggle(entry)}
        >
          {at ? (
            "Undo check-in"
          ) : (
            <>
              <Check /> Check in
            </>
          )}
        </Button>
      )}
    </Reveal>
  );
}
