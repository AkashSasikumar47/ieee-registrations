"use client";

import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@ieee/ui/components/button";
import { useCheckIn } from "@/components/use-check-in";
import { formatDayTime } from "@/lib/format";

export function TicketCheckIn({
  entry,
  confirmed,
  children,
}: {
  entry: { id: string; checked_in_at: string | null };
  confirmed: boolean;
  children: React.ReactNode;
}) {
  const { checkedInAt, toggle, pending } = useCheckIn();
  const at = checkedInAt(entry);

  async function tap() {
    if (await toggle(entry)) {
      toast.success(at ? "Check-in undone." : "Checked in.");
    } else {
      toast.error("Couldn't update the check-in.");
    }
  }

  return (
    <div className="flex flex-col gap-4 border p-5 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col">
        <span className="font-mono text-xs text-muted-foreground uppercase">
          Admin · Check-in
        </span>
        <span className="font-display text-xl font-black tracking-[-0.03em] uppercase">
          {!confirmed
            ? "Not confirmed"
            : at
              ? `In at ${formatDayTime(at)}`
              : "Not checked in"}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {confirmed && (
          <Button
            size="lg"
            variant={at ? "outline" : "default"}
            className="font-mono uppercase"
            disabled={pending === entry.id}
            onClick={tap}
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
        {children}
      </div>
    </div>
  );
}
