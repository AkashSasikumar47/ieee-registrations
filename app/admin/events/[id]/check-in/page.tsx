import type { Metadata } from "next";
import { CheckInList } from "@/components/check-in-list";
import { loadAdminEvent } from "@/lib/admin-event";
import { loadCheckIns } from "@/lib/check-ins";
import { getOrigin } from "@/lib/origin";
import { qrSvg } from "@/lib/qr";

export const metadata: Metadata = {
  title: "Check-in | Registrations admin",
  robots: { index: false },
};

export default async function CheckInPage({
  params,
}: PageProps<"/admin/events/[id]/check-in">) {
  const { supabase, event } = await loadAdminEvent((await params).id);
  const [entries, origin] = await Promise.all([
    loadCheckIns(supabase, event.id),
    getOrigin(),
  ]);
  const scanUrl = `${origin}/scan/${event.id}`;

  return (
    <CheckInList
      eventId={event.id}
      initial={entries}
      scanUrl={scanUrl}
      qr={await qrSvg(scanUrl)}
    />
  );
}
