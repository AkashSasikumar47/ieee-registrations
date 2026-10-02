const PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function toLocalInput(iso: string) {
  const parts = Object.fromEntries(
    PARTS.formatToParts(new Date(iso)).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function fromLocalInput(value: string) {
  const date = new Date(`${value}:00+05:30`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}
