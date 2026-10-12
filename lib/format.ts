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

function formatDay(value: string) {
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

const SHORT_DAY = new Intl.DateTimeFormat("en-IN", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
});

export function formatShortDay(value: string) {
  return SHORT_DAY.format(new Date(value));
}

const MONTH = new Intl.DateTimeFormat("en-IN", {
  timeZone: TIME_ZONE,
  month: "short",
  year: "numeric",
});

export function formatMonth(value: string) {
  return MONTH.format(new Date(value));
}
