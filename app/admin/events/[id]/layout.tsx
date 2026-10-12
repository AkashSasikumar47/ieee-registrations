import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@ieee/ui/components/badge";
import { Button } from "@ieee/ui/components/button";
import { AdminFooter } from "@/components/admin-footer";
import { AdminHeader } from "@/components/admin-header";
import { AdminIntro } from "@/components/admin-intro";
import { EventTabs } from "@/components/event-tabs";
import { loadAdminEvent } from "@/lib/admin-event";

export default async function EventLayout({
  children,
  params,
}: LayoutProps<"/admin/events/[id]">) {
  const { event } = await loadAdminEvent((await params).id);
  const published = event.status === "published";

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader />
      <main className="flex-1">
        <AdminIntro
          label={
            <span className="flex items-center gap-2">
              <Link href="/admin" className="hover:text-foreground">
                Events
              </Link>
              <span aria-hidden="true">/</span>
              <span>/{event.slug}</span>
              {!published && (
                <Badge variant="outline" className="font-mono uppercase">
                  Draft
                </Badge>
              )}
            </span>
          }
          title={event.name}
        >
          {published && (
            <Button variant="outline" className="font-mono uppercase" asChild>
              <Link href={`/${event.slug}`} target="_blank">
                View page <ArrowUpRight />
              </Link>
            </Button>
          )}
        </AdminIntro>
        <EventTabs id={event.id} />
        {children}
      </main>
      <AdminFooter />
    </div>
  );
}
