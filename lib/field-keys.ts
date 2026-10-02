import type { Field } from "@/lib/events";
import type { BuilderField } from "@/components/field-builder";

function toKey(label: string) {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 36) || "question"
  );
}

export function toFields(builder: BuilderField[]): Field[] {
  const used = new Set(
    builder.filter((field) => !field.fresh).map((field) => field.key),
  );
  return builder.map((field) => {
    let key = field.key;
    if (field.fresh) {
      const base = toKey(field.label);
      key = base;
      for (let n = 2; used.has(key); n += 1) key = `${base}_${n}`;
      used.add(key);
    }
    return {
      key,
      label: field.label.trim(),
      type: field.type,
      required: field.required,
      ...(field.type === "select"
        ? {
            options: field.options
              .split("\n")
              .map((option) => option.trim())
              .filter(Boolean),
          }
        : {}),
    };
  });
}

export function toBuilder(fields: Field[]): BuilderField[] {
  return fields.map((field) => ({
    id: field.key,
    key: field.key,
    fresh: false,
    label: field.label,
    type: field.type,
    required: field.required,
    options: (field.options ?? []).join("\n"),
  }));
}
