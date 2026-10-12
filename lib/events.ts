import type { Json, Tables } from "@ieee/supabase/types";

export type Event = Tables<"ieee_registrations_events">;

export const FIELD_TYPES = [
  "text",
  "textarea",
  "number",
  "email",
  "url",
  "select",
  "multiselect",
  "checkbox",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
};

export const KIND_LABELS: Record<string, string> = {
  hackathon: "Hackathon",
  workshop: "Workshop",
  ideathon: "Ideathon",
  talks: "Talks",
  fest: "Fest",
};

export const FORMAT_LABELS: Record<string, string> = {
  campus: "On campus",
  online: "Online",
};

export type Phase = "upcoming" | "open" | "closed" | "over";

export function parseFields(json: Json): Field[] {
  if (!Array.isArray(json)) return [];
  return json.flatMap((item) => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return [];
    }
    const { key, label, type, required, options } = item;
    if (
      typeof key !== "string" ||
      typeof label !== "string" ||
      !FIELD_TYPES.includes(type as FieldType)
    ) {
      return [];
    }
    return [
      {
        key,
        label,
        type: type as FieldType,
        required: required === true,
        options: Array.isArray(options)
          ? options.filter((option) => typeof option === "string")
          : undefined,
      },
    ];
  });
}

export function getPhase(event: Event, now = new Date()): Phase {
  if (event.opens_at && event.closes_at) {
    if (now < new Date(event.opens_at)) return "upcoming";
    if (now < new Date(event.closes_at)) return "open";
  }
  if (now < new Date(event.ends_at)) return "closed";
  return "over";
}
