import { ImageResponse } from "next/og";
import { createClient } from "@ieee/supabase/server";
import { isLight, popOf } from "@/lib/colour";
import { KIND_LABELS } from "@/lib/events";
import { formatDateRange } from "@/lib/format";
import { qrSvg, ticketUrl } from "@/lib/qr";
import { getTicket } from "@/lib/tickets";

const CANVAS = "#ececec";
const PAPER = "#ffffff";
const INK = "#0a0a0a";
const MUTED = "#737373";
const LINE = "#d4d4d4";

const FONTS = [
  ["Geist", "geist-medium.ttf", 500],
  ["Geist", "geist-extra-bold.ttf", 800],
  ["Geist Mono", "geist-mono-medium.ttf", 500],
  ["Geist Mono", "geist-mono-bold.ttf", 700],
] as const;

export async function GET(
  request: Request,
  { params }: RouteContext<"/t/[code]/image">,
) {
  const ticket = await getTicket((await params).code);
  if (!ticket || ticket.status === "cancelled") {
    return new Response("Not found", { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const supabase = await createClient();
  const [{ data: event }, qr, fonts, logo] = await Promise.all([
    supabase
      .from("ieee_registrations_events")
      .select("accent, backdrop, kind, format")
      .eq("slug", ticket.event.slug)
      .maybeSingle(),
    qrSvg(ticketUrl(origin, ticket.ticket_code)),
    Promise.all(
      FONTS.map(async ([name, file, weight]) => ({
        name,
        weight,
        style: "normal" as const,
        data: await (await fetch(`${origin}/fonts/${file}`)).arrayBuffer(),
      })),
    ),
    fetch(`${origin}/logos/ieee-srmist-logo.png`)
      .then((response) => response.arrayBuffer())
      .then(
        (bytes) =>
          `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`,
      ),
  ]);

  const accent = event?.accent || INK;
  const backdrop = event?.backdrop || (event?.accent ? INK : "#404040");
  const ink = isLight(backdrop) ? INK : PAPER;
  const top = isLight(accent) ? INK : PAPER;
  const pop = event?.accent ? popOf(event.accent) : "#d4d4d4";
  const qrSrc = `data:image/svg+xml;base64,${Buffer.from(qr).toString("base64")}`;
  const where =
    event?.format === "online" ? "Online" : ticket.event.venue || "SRMIST";
  const long = ticket.event.name.length > 14;
  const confirmed = ticket.status === "confirmed";
  const details = [
    ["Name", ticket.name],
    ["Register no.", ticket.register_number],
    ...(ticket.team ? [["Team", ticket.team.name]] : []),
  ];

  const mono = (size: number, weight: 500 | 700 = 700) => ({
    fontFamily: "Geist Mono",
    fontWeight: weight,
    fontSize: size,
    letterSpacing: 3,
  });
  const dot = (size: number, colour: string) => ({
    position: "absolute" as const,
    width: size,
    height: size,
    borderRadius: size,
    background: colour,
  });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: CANVAS,
        padding: 40,
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          borderRadius: 40,
          overflow: "hidden",
          background: PAPER,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 1060 }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: 520,
              padding: 52,
              background: `linear-gradient(160deg, ${accent} 0%, ${accent} 28%, ${backdrop} 72%)`,
              overflow: "hidden",
            }}
          >
            <div style={{ ...dot(340, pop), top: -110, right: -60 }} />
            <div style={{ ...dot(48, PAPER), top: 150, right: 260 }} />
            <div style={{ ...dot(22, pop), top: 230, right: 210 }} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  ...mono(22),
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  color: top,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 48,
                    height: 48,
                    borderRadius: 48,
                    background: PAPER,
                  }}
                >
                  <img src={logo} width={30} height={30} alt="" />
                </span>
                IEEE SRMIST
              </span>
              <span
                style={{
                  ...mono(20),
                  display: "flex",
                  padding: "8px 18px",
                  borderRadius: 40,
                  background: PAPER,
                  color: INK,
                  transform: "rotate(4deg)",
                }}
              >
                ADMIT {ticket.team ? "SQUAD" : "ONE"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <span style={{ ...mono(20), color: ink, opacity: 0.8 }}>
                {(KIND_LABELS[event?.kind ?? ""] ?? "Event").toUpperCase()}
              </span>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: long ? 88 : 116,
                  lineHeight: 0.9,
                  letterSpacing: -4,
                  textTransform: "uppercase",
                  color: ink,
                }}
              >
                {ticket.event.name}
              </span>
              <span
                style={{
                  ...mono(22, 500),
                  letterSpacing: 0,
                  color: ink,
                  opacity: 0.85,
                }}
              >
                {formatDateRange(ticket.event.starts_at, ticket.event.ends_at)}{" "}
                · {where}
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexGrow: 1,
              alignItems: "center",
              gap: 48,
              padding: "0 52px",
            }}
          >
            {details.map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  flex: 1,
                }}
              >
                <span style={{ ...mono(17, 500), color: MUTED }}>
                  {label?.toUpperCase()}
                </span>
                <span
                  style={
                    label === "Register no."
                      ? { ...mono(24), letterSpacing: 1, color: INK }
                      : {
                          fontWeight: 800,
                          fontSize: 30,
                          lineHeight: 1.05,
                          letterSpacing: -0.5,
                          color: INK,
                        }
                  }
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", display: "flex", width: 0 }}>
          <div style={{ ...dot(56, CANVAS), top: -28, left: -28 }} />
          <div style={{ ...dot(56, CANVAS), bottom: -28, left: -28 }} />
          <div
            style={{
              position: "absolute",
              top: 44,
              bottom: 44,
              left: -2,
              borderLeft: `4px dashed ${LINE}`,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
          }}
        >
          <img src={qrSrc} width={300} height={300} alt="" />
          <span style={{ ...mono(24), letterSpacing: 5, color: INK }}>
            #{ticket.ticket_code.slice(0, 8)}
          </span>
          <span
            style={{
              ...mono(20),
              display: "flex",
              padding: "10px 22px",
              borderRadius: 40,
              background: confirmed ? INK : PAPER,
              color: confirmed ? PAPER : INK,
              border: `2px solid ${INK}`,
            }}
          >
            {confirmed ? "CONFIRMED" : "WAITLISTED"}
          </span>
        </div>
      </div>
    </div>,
    {
      width: 1600,
      height: 800,
      fonts,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `inline; filename="${ticket.register_number}.png"`,
      },
    },
  );
}
