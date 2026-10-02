import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, Download } from "lucide-react";
import { Button } from "@ieee/ui/components/button";
import { CancelButton } from "@/components/cancel-button";
import { CopyButton } from "@/components/copy-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatDateRange, formatDayTime } from "@/lib/format";
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
  const team = ticket.team;
  const over = new Date(ticket.event.ends_at) <= new Date();
  const joinUrl = team?.invite_code
    ? `${origin}/${ticket.event.slug}/join?code=${team.invite_code}`
    : null;

  const details = [
    { label: "Name", value: ticket.name },
    { label: "Register number", value: ticket.register_number },
    ...(team ? [{ label: "Team", value: team.name }] : []),
    { label: "Starts", value: formatDayTime(ticket.event.starts_at) },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10 md:px-5 md:py-16">
          {fresh && ticket.status !== "cancelled" && (
            <div className="flex items-start gap-3">
              <CircleCheck className="mt-1 size-6 shrink-0" />
              <div className="flex flex-col gap-1">
                <h1 className="font-display text-3xl font-black tracking-[-0.04em] uppercase md:text-5xl">
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

          <article className="grid overflow-hidden border bg-card md:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-8 p-6 md:p-10">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                  IEEE SRMIST · Ticket
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ticket.status === "confirmed" ? "bg-foreground text-background" : "border"}`}
                >
                  {status.label}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-4xl leading-[0.9] font-black tracking-[-0.045em] text-balance uppercase md:text-5xl">
                  {ticket.event.name}
                </h2>
                <p className="text-muted-foreground">
                  {formatDateRange(
                    ticket.event.starts_at,
                    ticket.event.ends_at,
                  )}
                  {ticket.event.venue && ` · ${ticket.event.venue}`}
                </p>
              </div>
              <dl className="grid gap-x-8 sm:grid-cols-2">
                {details.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex flex-col gap-1 border-t py-4"
                  >
                    <dt className="font-mono text-xs text-muted-foreground uppercase">
                      {detail.label}
                    </dt>
                    <dd className="font-medium">{detail.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-sm text-muted-foreground">{status.note}</p>
            </div>

            <div className="relative flex flex-col items-center justify-center gap-4 border-t border-dashed p-6 md:w-80 md:border-t-0 md:border-l md:p-10">
              <span className="absolute -top-3 -left-3 size-6 rounded-full border bg-background md:-top-3 md:-left-3" />
              <span className="absolute -top-3 -right-3 size-6 rounded-full border bg-background md:top-auto md:right-auto md:-bottom-3 md:-left-3" />
              {qr ? (
                <div
                  className="w-full max-w-52 [&_svg]:h-auto [&_svg]:w-full"
                  role="img"
                  aria-label="Ticket QR code"
                  dangerouslySetInnerHTML={{ __html: qr }}
                />
              ) : (
                <span className="text-sm text-muted-foreground">
                  No QR code
                </span>
              )}
              <span className="font-mono text-xs tracking-widest text-muted-foreground">
                {ticket.ticket_code.slice(0, 8)}
              </span>
            </div>
          </article>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {qr && (
              <Button size="lg" asChild>
                <a
                  href={`/t/${ticket.ticket_code}/image`}
                  download="ticket.png"
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

          {team && ticket.status !== "cancelled" && (
            <section className="grid gap-8 border-t pt-10 md:grid-cols-2 md:gap-12">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Team · {team.members.length} of {ticket.event.team_max}
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight">
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
                      <span className="font-medium">{member.name}</span>
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
              className="font-medium text-foreground underline-offset-4 hover:underline"
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
