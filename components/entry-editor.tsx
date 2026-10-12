"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@ieee/ui/components/button";
import { Input } from "@ieee/ui/components/input";
import { Label } from "@ieee/ui/components/label";
import { Textarea } from "@ieee/ui/components/textarea";
import { Choice } from "@/components/choice";
import type { AdminEntry } from "@/lib/admin-entries";
import type { Field } from "@/lib/events";
import { send } from "@/lib/send";

const EDITABLE = ["text", "textarea", "number", "email", "url", "select"];
const LABEL = "font-mono text-xs text-muted-foreground uppercase";

export function EntryEditor({
  entry,
  fields,
  onDone,
}: {
  entry: AdminEntry;
  fields: Field[];
  onDone: () => void;
}) {
  const router = useRouter();
  const editable = fields.filter((field) => EDITABLE.includes(field.type));
  const [values, setValues] = useState({
    name: entry.name,
    register_number: entry.register_number,
    email: entry.email,
    phone: entry.phone,
  });
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      editable.map((field) => [field.key, entry.answers[field.key] ?? ""]),
    ),
  );
  const [pending, setPending] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const { error } = await send(
      `/api/admin/entries/${entry.id}/details`,
      { method: "PATCH", body: JSON.stringify({ ...values, answers }) },
      "Couldn't save the details.",
    );
    setPending(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(`Saved ${values.name}'s details.`);
    onDone();
    router.refresh();
  }

  const basics = [
    { key: "name", label: "Name", type: "text" },
    { key: "register_number", label: "Register number", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Mobile", type: "tel" },
  ] as const;

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      {basics.map((item) => (
        <div key={item.key} className="flex flex-col gap-1.5">
          <Label htmlFor={`edit-${item.key}`} className={LABEL}>
            {item.label}
          </Label>
          <Input
            id={`edit-${item.key}`}
            type={item.type}
            required={item.key !== "phone"}
            className={item.key === "register_number" ? "font-mono" : ""}
            value={values[item.key]}
            onChange={(change) =>
              setValues((current) => ({
                ...current,
                [item.key]: change.target.value,
              }))
            }
          />
        </div>
      ))}
      {editable.map((field) => (
        <div key={field.key} className="flex flex-col gap-1.5">
          <Label htmlFor={`edit-${field.key}`} className={LABEL}>
            {field.label}
          </Label>
          {field.type === "select" ? (
            <Choice
              id={`edit-${field.key}`}
              value={answers[field.key] ?? ""}
              placeholder="Choose one"
              onChange={(value) =>
                setAnswers((current) => ({ ...current, [field.key]: value }))
              }
              options={(field.options ?? []).map((option) => ({
                value: option,
                label: option,
              }))}
            />
          ) : field.type === "textarea" ? (
            <Textarea
              id={`edit-${field.key}`}
              value={answers[field.key] ?? ""}
              onChange={(change) =>
                setAnswers((current) => ({
                  ...current,
                  [field.key]: change.target.value,
                }))
              }
            />
          ) : (
            <Input
              id={`edit-${field.key}`}
              value={answers[field.key] ?? ""}
              onChange={(change) =>
                setAnswers((current) => ({
                  ...current,
                  [field.key]: change.target.value,
                }))
              }
            />
          )}
        </div>
      ))}
      <div className="flex gap-2">
        <Button
          type="submit"
          className="font-mono uppercase"
          disabled={pending}
        >
          {pending ? "Saving…" : "Save details"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="font-mono uppercase"
          onClick={onDone}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
