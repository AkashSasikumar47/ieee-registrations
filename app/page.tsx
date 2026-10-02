import { EventStrip } from "@/components/event-strip";
import { FlapWordmark } from "@/components/flap-wordmark";
import { HomeBar } from "@/components/home-bar";
import { SiteHeader } from "@/components/site-header";
import { loadEvents } from "@/lib/load-events";
import { toStripItems } from "@/lib/strip";

export default async function HomePage() {
  const { events } = await loadEvents();

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <SiteHeader sticky={false} />
      <main className="flex min-h-0 flex-1 flex-col">
        <h1 className="sr-only">IEEE Registrations</h1>
        <EventStrip items={toStripItems(events ?? [])} />
        <div
          aria-hidden="true"
          className="@container px-4 pt-6 md:px-5 md:pt-8"
        >
          <FlapWordmark className="font-display -ml-[0.06em] flex flex-col text-[length:calc(100cqw/7.67)] leading-[0.8] font-black tracking-[-0.055em] whitespace-nowrap uppercase md:flex-row md:gap-[0.14em] md:text-[length:calc(100cqw/9.83)] md:leading-[0.78]" />
        </div>
        <HomeBar />
      </main>
    </div>
  );
}
