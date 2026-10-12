import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, Download } from "lucide-react";
import { Button } from "@ieee/ui/components/button";
import { createClient } from "@ieee/supabase/server";
import { CancelButton } from "@/components/cancel-button";
import { CopyButton } from "@/components/copy-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TicketCard } from "@/components/ticket-card";
import { TicketCheckIn } from "@/components/ticket-check-in";
import { getAdmin } from "@/lib/auth";
import { getOrigin } from "@/lib/origin";
import { qrSvg, ticketUrl } from "@/lib/qr";
import { getTicket, type TicketStatus } from "@/lib/tickets";

export const metadata: Metadata = {
  title: "Your ticket | Registrations",
  robots: { index: false },
};

const STATUS: Record<TicketStatus, { label: string; note: string }> = {
  confirmed: {
    label: "Confirmed",
    note: "Show this QR code at the venue to check in.",
  },
  waitlisted: {
    label: "Waitlisted",
    note: "The event is full. If a seat opens up, you're confirmed automatically, so check back here.",
  },
  cancelled: {
    label: "Cancelled",
    note: "This registration was cancelled.",
  },
};

export default async function TicketPage({
  params,
  searchParams,
}: PageProps<"/t/[code]">) {
  const ticket = await getTicket((await params).code);
  if (!ticket) notFound();

  const fresh = (await searchParams).new === "1";
  const origin = await getOrigin();
  const qr =
    ticket.status === "cancelled"
      ? null
      : await qrSvg(ticketUrl(origin, ticket.ticket_code));
  const status = STATUS[ticket.status];
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("ieee_registrations_events")
    .select("accent, backdrop, kind, format")
    .eq("slug", ticket.event.slug)
    .maybeSingle();
  const entry = (await getAdmin(supabase))
    ? (
        await supabase
          .from("ieee_registrations_entries")
          .select("id, checked_in_at")
          .eq("ticket_code", ticket.ticket_code)
          .maybeSingle()
      ).data
    : null;
  const team = ticket.team;
  const over = new Date(ticket.event.ends_at) <= new Date();
  const joinUrl = team?.invite_code
    ? `${origin}/${ticket.event.slug}/join?code=${team.invite_code}`
    : null;

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-gutter py-8 md:py-10">
          {fresh && ticket.status !== "cancelled" && (
            <div className="flex items-start gap-3">
              <CircleCheck className="mt-1 size-6 shrink-0" />
              <div className="flex flex-col gap-1">
                <h1 className="font-display text-3xl font-black tracking-[-0.04em] uppercase md:text-4xl">
                  {ticket.status === "confirmed"
                    ? "You're registered."
                    : "You're on the waitlist."}
                </h1>
                <p className="text-muted-foreground">
                  This page is your registration. Bookmark it or download the
                  ticket below.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <TicketCard
              ticket={ticket}
              qr={qr}
              accent={event?.accent ?? ""}
              backdrop={event?.backdrop ?? ""}
              kind={event?.kind ?? ""}
              online={event?.format === "online"}
            />
            <p className="text-center text-sm text-muted-foreground">
              {status.note}
            </p>
          </div>

          {entry ? (
            <TicketCheckIn
              entry={entry}
              confirmed={ticket.status === "confirmed"}
            >
              {qr && (
                <Button size="lg" asChild>
                  <a
                    href={`/t/${ticket.ticket_code}/image`}
                    download={`${ticket.register_number}.png`}
                  >
                    <Download /> Download ticket
                  </a>
                </Button>
              )}
              {ticket.status !== "cancelled" && !over && (
                <CancelButton
                  code={ticket.ticket_code}
                  leader={ticket.role === "leader"}
                />
              )}
            </TicketCheckIn>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {qr && (
                <Button size="lg" asChild>
                  <a
                    href={`/t/${ticket.ticket_code}/image`}
                    download={`${ticket.register_number}.png`}
                  >
                    <Download /> Download ticket
                  </a>
                </Button>
              )}
              {ticket.status !== "cancelled" && !over && (
                <CancelButton
                  code={ticket.ticket_code}
                  leader={ticket.role === "leader"}
                />
              )}
            </div>
          )}

          {team && ticket.status !== "cancelled" && (
            <section className="grid gap-8 border-t pt-10 md:grid-cols-2 md:gap-12">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Team · {team.members.length} of {ticket.event.team_max}
                  </p>
                  <h2 className="font-display text-3xl leading-[0.9] font-black tracking-[-0.04em] uppercase">
                    {team.name}
                  </h2>
                  {team.members.length < ticket.event.team_min && (
                    <p className="text-sm text-muted-foreground">
                      Your team needs at least {ticket.event.team_min} members.
                    </p>
                  )}
                </div>
                <ul className="flex flex-col">
                  {team.members.map((member, index) => (
                    <li
                      key={`${member.name}-${index}`}
                      className="flex justify-between gap-4 border-t py-3 text-sm"
                    >
                      <span className="font-semibold">{member.name}</span>
                      <span className="text-muted-foreground">
                        {member.role === "leader" ? "Lead" : "Member"}
                        {member.status === "waitlisted" && " · waitlisted"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              {joinUrl && team.members.length < ticket.event.team_max && (
                <div className="flex flex-col justify-between gap-6 border p-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">
                      Share this code with your teammates
                    </span>
                    <span className="font-mono text-4xl font-semibold tracking-widest">
                      {team.invite_code}
                    </span>
                  </div>
                  <CopyButton text={joinUrl} label="Copy invite link" />
                </div>
              )}
            </section>
          )}

          <p className="text-sm text-muted-foreground">
            Lost this page later?{" "}
            <Link
              href="/find"
              className="font-medium text-foreground underline underline-offset-4 hover:opacity-60"
            >
              Find your ticket
            </Link>{" "}
            with your register number and mobile number.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
