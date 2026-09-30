import { ImageResponse } from "next/og";
import { formatDateRange } from "@/lib/format";
import { qrSvg, ticketUrl } from "@/lib/qr";
import { getTicket } from "@/lib/tickets";

export async function GET(
  request: Request,
  { params }: RouteContext<"/t/[code]/image">,
) {
  const ticket = await getTicket((await params).code);
  if (!ticket || ticket.status === "cancelled") {
    return new Response("Not found", { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const qr = await qrSvg(ticketUrl(origin, ticket.ticket_code));
  const qrSrc = `data:image/svg+xml;base64,${Buffer.from(qr).toString("base64")}`;
  const details = [
    ["Name", ticket.name],
    ["Register number", ticket.register_number],
    ...(ticket.team ? [["Team", ticket.team.name]] : []),
    ["Status", ticket.status === "confirmed" ? "Confirmed" : "Waitlisted"],
  ];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        color: "#0a0a0a",
        padding: 64,
        gap: 40,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontSize: 24, color: "#737373", letterSpacing: 2 }}>
          IEEE SRMIST
        </span>
        <span style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>
          {ticket.event.name}
        </span>
        <span style={{ fontSize: 28, color: "#737373" }}>
          {formatDateRange(ticket.event.starts_at, ticket.event.ends_at)}
          {ticket.event.venue ? ` · ${ticket.event.venue}` : ""}
        </span>
      </div>
      <img
        src={qrSrc}
        width={560}
        height={560}
        style={{ alignSelf: "center" }}
        alt=""
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        {details.map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "2px solid #e5e5e5",
              padding: "20px 0",
              fontSize: 28,
            }}
          >
            <span style={{ color: "#737373" }}>{label}</span>
            <span style={{ fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>,
    {
      width: 800,
      height: 1280,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
