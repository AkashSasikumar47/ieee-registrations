import type { Event } from "@/lib/events";

export function SeatsBar({ event, taken }: { event: Event; taken: number }) {
  if (event.capacity === null) {
    return <p className="text-sm text-muted-foreground">Open to everyone</p>;
  }
  const left = Math.max(event.capacity - taken, 0);
  const filled = Math.min((taken / event.capacity) * 100, 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">
          {left > 0 ? `${left} seats left` : "Full · waitlist open"}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {taken}/{event.capacity}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground"
          style={{ width: `${filled}%` }}
        />
      </div>
    </div>
  );
}
