import type { Event } from "@/lib/events";

export function EventCover({
  event,
  className = "",
}: {
  event: Pick<Event, "name" | "mode">;
  className?: string;
}) {
  const name = event.name.replace(/^Sample:\s*/, "");

  return (
    <div
      className={`relative flex overflow-hidden rounded-xl border bg-muted bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-size-[16px_16px] ${className}`}
    >
      <span className="mt-auto p-5 text-3xl leading-none font-extrabold tracking-tighter text-balance md:text-4xl">
        {name}
      </span>
      <span className="absolute top-4 right-4 rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium">
        {event.mode === "team" ? "Team" : "Solo"}
      </span>
    </div>
  );
}
