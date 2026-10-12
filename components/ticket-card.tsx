import Image from "next/image";
import { isLight, popOf } from "@/lib/colour";
import { KIND_LABELS } from "@/lib/events";
import { formatDateRange } from "@/lib/format";
import type { Ticket } from "@/lib/tickets";

export function TicketCard({
  ticket,
  qr,
  accent,
  backdrop,
  kind,
  online,
}: {
  ticket: Ticket;
  qr: string | null;
  accent: string;
  backdrop: string;
  kind: string;
  online: boolean;
}) {
  const coloured = Boolean(accent);
  const ink = !coloured
    ? "text-background"
    : isLight(backdrop || accent)
      ? "text-foreground"
      : "text-background";
  const top =
    coloured && isLight(accent) ? "text-foreground" : "text-background";
  const colours = coloured
    ? {
        "--from": accent,
        "--to":
          backdrop || `color-mix(in oklch, ${accent}, var(--foreground) 55%)`,
        "--pop": popOf(accent),
      }
    : {
        "--from": "var(--foreground)",
        "--to": "color-mix(in oklch, var(--foreground), var(--background) 25%)",
        "--pop": "var(--muted)",
      };
  const where = online ? "Online" : ticket.event.venue || "SRMIST";
  const details = [
    { label: "Name", value: ticket.name, mono: false },
    { label: "Register no.", value: ticket.register_number, mono: true },
    ...(ticket.team
      ? [{ label: "Team", value: ticket.team.name, mono: false }]
      : []),
  ];

  return (
    <article
      style={colours as React.CSSProperties}
      className="flex w-full flex-col overflow-hidden rounded-[2rem] border bg-card md:flex-row"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative flex min-h-64 flex-1 flex-col justify-between gap-8 overflow-hidden bg-[linear-gradient(175deg,var(--from)_0%,var(--from)_18%,var(--to)_62%)] p-6 md:p-8">
          <span
            aria-hidden="true"
            className="absolute -top-20 -right-12 size-52 rounded-full bg-(--pop) md:size-64"
          />
          <span
            aria-hidden="true"
            className="absolute top-24 right-36 size-7 rounded-full bg-background md:top-28 md:right-48"
          />
          <span
            aria-hidden="true"
            className="absolute top-36 right-28 size-3.5 rounded-full bg-(--pop) md:top-40 md:right-40"
          />
          <div className="relative flex items-center justify-between gap-4">
            <span
              className={`flex items-center gap-2.5 font-mono text-xs font-bold tracking-[0.2em] ${top}`}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-background">
                <Image
                  src="/logos/ieee-srmist-logo.png"
                  alt=""
                  width={20}
                  height={20}
                />
              </span>
              IEEE SRMIST
            </span>
            <span className="rotate-3 rounded-full bg-background px-3 py-1 font-mono text-xs font-bold tracking-widest text-foreground">
              ADMIT {ticket.team ? "SQUAD" : "ONE"}
            </span>
          </div>
          <div className={`relative flex flex-col gap-2 ${ink}`}>
            <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase opacity-80">
              {KIND_LABELS[kind] ?? "Event"}
            </span>
            <h2 className="font-display text-4xl leading-[0.9] font-black tracking-[-0.045em] uppercase md:text-6xl">
              {ticket.event.name}
            </h2>
            <p className="font-mono text-xs opacity-85 md:text-sm">
              {formatDateRange(ticket.event.starts_at, ticket.event.ends_at)} ·{" "}
              {where}
            </p>
          </div>
        </div>
        <dl className="grid gap-4 p-6 sm:grid-cols-3 md:px-8 md:py-6">
          {details.map((detail) => (
            <div key={detail.label} className="flex min-w-0 flex-col gap-1">
              <dt className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                {detail.label}
              </dt>
              <dd
                className={
                  detail.mono
                    ? "font-mono text-sm font-bold tracking-wide"
                    : "font-display text-lg leading-tight font-black tracking-[-0.02em] wrap-break-word"
                }
              >
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div aria-hidden="true" className="relative h-0 md:h-auto md:w-0">
        <span className="absolute -top-4 -left-4 size-8 rounded-full border bg-background md:-top-4 md:-left-4" />
        <span className="absolute -top-4 -right-4 size-8 rounded-full border bg-background md:top-auto md:right-auto md:-bottom-4 md:-left-4" />
        <span className="absolute inset-x-6 -top-px border-t-2 border-dashed md:inset-x-auto md:inset-y-6 md:-left-px md:border-t-0 md:border-l-2" />
      </div>

      <div className="flex flex-col items-center justify-center gap-5 p-6 md:w-72 md:p-8">
        {qr ? (
          <div
            className="w-48 [&_svg]:h-auto [&_svg]:w-full"
            role="img"
            aria-label="Ticket QR code"
            dangerouslySetInnerHTML={{ __html: qr }}
          />
        ) : (
          <span className="flex size-48 items-center justify-center border border-dashed font-mono text-xs text-muted-foreground uppercase">
            No QR code
          </span>
        )}
        <span className="font-mono text-sm font-bold tracking-[0.2em]">
          #{ticket.ticket_code.slice(0, 8)}
        </span>
        <span
          className={`rounded-full border-2 border-foreground px-3 py-1 font-mono text-xs font-bold tracking-widest uppercase ${
            ticket.status === "confirmed"
              ? "bg-foreground text-background"
              : ticket.status === "cancelled"
                ? "text-muted-foreground line-through"
                : ""
          }`}
        >
          {ticket.status}
        </span>
      </div>
    </article>
  );
}
