"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut } from "lucide-react";
import { Button } from "@ieee/ui/components/button";
import { AdminFooter } from "@/components/admin-footer";
import { formatDateRange } from "@/lib/format";
import { SCAN_EVENT_KEY } from "@/lib/scan";

type PickerEvent = {
  id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  venue: string;
  format: string;
  confirmed: number;
  checkedIn: number;
};

function EventRow({ event }: { event: PickerEvent }) {
  return (
    <li>
      <Link
        href={`/scan/${event.id}`}
        className="group flex items-center justify-between gap-4 border-b py-4 transition-colors hover:bg-muted"
      >
        <span className="flex min-w-0 flex-col gap-1">
          <span className="font-display truncate text-2xl leading-tight font-black tracking-[-0.03em] uppercase">
            {event.name}
          </span>
          <span className="truncate font-mono text-xs text-muted-foreground uppercase">
            {formatDateRange(event.starts_at, event.ends_at)} ·{" "}
            {event.format === "online" ? "Online" : event.venue || "SRMIST"} ·{" "}
            {event.checkedIn} / {event.confirmed} in
          </span>
        </span>
        <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
      </Link>
    </li>
  );
}

export function ScanEventPicker({
  current,
  past,
  remember,
}: {
  current: PickerEvent[];
  past: PickerEvent[];
  remember: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!remember) return;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(SCAN_EVENT_KEY);
    } catch {}
    if (saved && current.some((event) => event.id === saved)) {
      router.replace(`/scan/${saved}`);
    }
  }, [remember, current, router]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-background px-gutter pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <span className="font-mono text-sm font-semibold tracking-wide uppercase">
          IEEE SRMIST <span className="text-primary">· Check-in</span>
        </span>
        <form action="/api/auth/logout" method="post">
          <input type="hidden" name="from" value="scan" />
          <Button type="submit" variant="outline" size="sm">
            <LogOut /> Sign out
          </Button>
        </form>
      </header>
      <main className="flex flex-1 flex-col gap-10 px-gutter py-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-5xl leading-none font-black tracking-[-0.05em] uppercase">
            Pick an event
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose the event you&apos;re checking people in for. This phone
            remembers it next time.
          </p>
        </div>
        <section className="flex flex-col gap-2">
          <h2 className="font-mono text-xs text-muted-foreground uppercase">
            Now and upcoming
          </h2>
          {current.length ? (
            <ul className="flex flex-col border-t">
              {current.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </ul>
          ) : (
            <p className="border-y py-6 text-sm text-muted-foreground">
              No events are on right now.
            </p>
          )}
        </section>
        {past.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-xs text-muted-foreground uppercase">
              Past events
            </h2>
            <ul className="flex flex-col border-t">
              {past.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </ul>
          </section>
        )}
      </main>
      <AdminFooter />
    </div>
  );
}
