import type { TablesInsert } from "@ieee/supabase/types";
import { FIELD_TYPES, type Field, type FieldType } from "@/lib/events";

export type EventInput = Omit<
  TablesInsert<"ieee_registrations_events">,
  "id" | "created_at" | "updated_at"
>;

export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const FIELD_KEY = /^[a-z0-9_]{1,40}$/;

function text(value: unknown, max: number) {
  return typeof value === "string" && value.trim().length <= max
    ? value.trim()
    : null;
}

function time(value: unknown) {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function readFields(value: unknown): Field[] | string {
  if (!Array.isArray(value) || value.length > 30) return "Too many questions.";
  const keys = new Set<string>();
  const fields: Field[] = [];
  for (const item of value) {
    const { key, label, type, required, options } = (item ?? {}) as Record<
      string,
      unknown
    >;
    const cleanLabel = text(label, 80);
    if (!cleanLabel) return "Every question needs a label.";
    if (typeof key !== "string" || !FIELD_KEY.test(key) || keys.has(key)) {
      return `Check the question "${cleanLabel}".`;
    }
    if (!FIELD_TYPES.includes(type as FieldType)) {
      return `Pick a type for "${cleanLabel}".`;
    }
    keys.add(key);
    const field: Field = {
      key,
      label: cleanLabel,
      type: type as FieldType,
      required: required === true,
    };
    if (type === "select") {
      const list = Array.isArray(options)
        ? options
            .map((option) => text(option, 80))
            .filter((option): option is string => Boolean(option))
        : [];
      if (list.length === 0 || list.length > 30) {
        return `Add options to "${cleanLabel}".`;
      }
      field.options = [...new Set(list)];
    }
    fields.push(field);
  }
  return fields;
}

export function readEventInput(
  body: Record<string, unknown>,
): { event: EventInput } | { error: string } {
  const name = text(body.name, 120);
  if (!name) return { error: "Enter an event name of up to 120 characters." };
  const slug = text(body.slug, 60);
  if (!slug || !SLUG.test(slug)) {
    return {
      error: "Use lowercase letters, numbers and dashes for the link.",
    };
  }
  const summary = text(body.summary, 1000);
  const venue = text(body.venue, 200);
  if (summary === null || venue === null) {
    return { error: "The summary or venue is too long." };
  }

  const starts_at = time(body.starts_at);
  const ends_at = time(body.ends_at);
  const opens_at = time(body.opens_at);
  const closes_at = time(body.closes_at);
  if (!starts_at || !ends_at || !opens_at || !closes_at) {
    return { error: "Fill in every date and time." };
  }
  if (ends_at < starts_at) return { error: "The event ends before it starts." };
  if (closes_at <= opens_at) {
    return { error: "Registrations must close after they open." };
  }

  const capacity =
    body.capacity === null || body.capacity === ""
      ? null
      : Number(body.capacity);
  if (capacity !== null && (!Number.isInteger(capacity) || capacity < 1)) {
    return { error: "Capacity must be a whole number above zero." };
  }

  const mode = body.mode === "team" ? "team" : "solo";
  const team_min = mode === "team" ? Number(body.team_min) : 1;
  const team_max = mode === "team" ? Number(body.team_max) : 1;
  if (
    !Number.isInteger(team_min) ||
    !Number.isInteger(team_max) ||
    team_min < 1 ||
    team_max < team_min ||
    team_max > 20
  ) {
    return { error: "Team size must be between 1 and 20, minimum first." };
  }

  const fields = readFields(body.fields);
  if (typeof fields === "string") return { error: fields };

  const status = body.status === "published" ? "published" : "draft";

  return {
    event: {
      name,
      slug,
      summary,
      venue,
      starts_at,
      ends_at,
      opens_at,
      closes_at,
      capacity,
      mode,
      team_min,
      team_max,
      fields,
      status,
    },
  };
}

export function eventError(code: string | undefined, fallback: string) {
  return code === "23505" ? "Another event already uses this link." : fallback;
}
