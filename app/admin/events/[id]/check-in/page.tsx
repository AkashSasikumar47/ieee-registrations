import type { Metadata } from "next";
import { CheckInList } from "@/components/check-in-list";
import { loadAdminEventPage } from "@/lib/admin-page";

export const metadata: Metadata = {
  title: "Check-in | Registrations admin",
  robots: { index: false },
};

export default async function CheckInPage({
  params,
}: PageProps<"/admin/events/[id]/check-in">) {
  const { entries } = await loadAdminEventPage(params);
  return <CheckInList entries={entries} />;
}
