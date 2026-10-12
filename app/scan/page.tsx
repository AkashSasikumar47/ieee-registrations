import { redirect } from "next/navigation";
import { createClient } from "@ieee/supabase/server";
import { ScanEventPicker } from "@/components/scan-event-picker";
import { getAdmin } from "@/lib/auth";

const RECENT_MS = 12 * 60 * 60 * 1000;

export default async function ScanPage({ searchParams }: PageProps<"/scan">) {
  const supabase = await createClient();
  if (!(await getAdmin(supabase))) redirect("/scan/login");

  const [{ data: events }, { data: counts }, { pick }] = await Promise.all([
    supabase
      .from("ieee_registrations_events")
      .select("id, name, starts_at, ends_at, venue, format")
      .eq("status", "published")
      .order("starts_at", { ascending: false }),
    supabase.rpc("ieee_registrations_counts"),
    searchParams,
  ]);

  const cutoff = Date.now() - RECENT_MS;
  const list = (events ?? []).map((event) => {
    const count = counts?.find((row) => row.event_id === event.id);
    return {
      ...event,
      confirmed: count?.confirmed ?? 0,
      checkedIn: count?.checked_in ?? 0,
    };
  });

  return (
    <ScanEventPicker
      current={list
        .filter((event) => new Date(event.ends_at).getTime() >= cutoff)
        .reverse()}
      past={list.filter((event) => new Date(event.ends_at).getTime() < cutoff)}
      remember={pick === undefined}
    />
  );
}
