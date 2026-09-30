const TIME_ZONE = "Asia/Kolkata";

const DAY = new Intl.DateTimeFormat("en-IN", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
});

const DAY_TIME = new Intl.DateTimeFormat("en-IN", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDay(value: string) {
  return DAY.format(new Date(value));
}

export function formatDayTime(value: string) {
  return DAY_TIME.format(new Date(value));
}

export function formatDateRange(start: string, end: string) {
  const from = formatDay(start);
  const to = formatDay(end);
  return from === to ? from : `${from} – ${to}`;
}
