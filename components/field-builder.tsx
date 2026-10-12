"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button } from "@ieee/ui/components/button";
import { Input } from "@ieee/ui/components/input";
import { Label } from "@ieee/ui/components/label";
import { Textarea } from "@ieee/ui/components/textarea";
import { FIELD_TYPES, type FieldType } from "@/lib/events";
import { Choice } from "@/components/choice";

export type BuilderField = {
  id: string;
  key: string;
  fresh: boolean;
  label: string;
  type: FieldType;
  required: boolean;
  options: string;
};

const TYPE_LABELS: Record<FieldType, string> = {
  text: "Short answer",
  textarea: "Long answer",
  number: "Number",
  email: "Email",
  url: "Link",
  select: "Dropdown",
  multiselect: "Pick several",
  checkbox: "Tick box",
};

const HAS_OPTIONS: FieldType[] = ["select", "multiselect"];

function newField(): BuilderField {
  return {
    id: crypto.randomUUID(),
    key: "",
    fresh: true,
    label: "",
    type: "text",
    required: false,
    options: "",
  };
}

export function FieldBuilder({
  fields,
  onChange,
}: {
  fields: BuilderField[];
  onChange: (fields: BuilderField[]) => void;
}) {
  function update(id: string, patch: Partial<BuilderField>) {
    onChange(
      fields.map((field) => (field.id === id ? { ...field, ...patch } : field)),
    );
  }

  function move(index: number, by: number) {
    const next = [...fields];
    const [field] = next.splice(index, 1);
    if (!field) return;
    next.splice(index + by, 0, field);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-mono text-xs text-muted-foreground uppercase">
        Name, SRM email, register number and mobile are always asked.
      </p>
      {fields.length > 0 && (
        <ol className="flex flex-col border-t">
          {fields.map((field, index) => (
            <li
              key={field.id}
              className="grid gap-3 border-b py-4 sm:grid-cols-[auto_1fr] sm:gap-4"
            >
              <span className="pt-2.5 font-mono text-xs text-muted-foreground">
                [{String(index + 1).padStart(2, "0")}]
              </span>
              <div className="flex flex-col gap-3">
                <div className="grid gap-3 md:grid-cols-[1fr_10rem_9rem_auto]">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`label-${field.id}`} className="sr-only">
                      Question
                    </Label>
                    <Input
                      id={`label-${field.id}`}
                      required
                      maxLength={80}
                      placeholder="Question, e.g. GitHub profile"
                      value={field.label}
                      onChange={(event) =>
                        update(field.id, { label: event.target.value })
                      }
                    />
                  </div>
                  <Choice
                    label="Answer type"
                    value={field.type}
                    onChange={(type) =>
                      update(field.id, { type: type as FieldType })
                    }
                    options={FIELD_TYPES.map((type) => ({
                      value: type,
                      label: TYPE_LABELS[type],
                    }))}
                  />
                  <Choice
                    label="Required"
                    value={field.required ? "required" : "optional"}
                    onChange={(choice) =>
                      update(field.id, { required: choice === "required" })
                    }
                    options={[
                      { value: "optional", label: "Optional" },
                      { value: "required", label: "Required" },
                    ]}
                  />
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Move down"
                      disabled={index === fields.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Remove question"
                      onClick={() =>
                        onChange(fields.filter((item) => item.id !== field.id))
                      }
                    >
                      <X />
                    </Button>
                  </div>
                </div>
                {HAS_OPTIONS.includes(field.type) && (
                  <Textarea
                    aria-label="Options"
                    required
                    rows={3}
                    placeholder="One option per line"
                    value={field.options}
                    onChange={(event) =>
                      update(field.id, { options: event.target.value })
                    }
                  />
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
      <Button
        type="button"
        variant="outline"
        className="self-start font-mono uppercase"
        onClick={() => onChange([...fields, newField()])}
      >
        <Plus /> Add question
      </Button>
    </div>
  );
}
