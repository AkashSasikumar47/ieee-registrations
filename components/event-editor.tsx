"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@ieee/ui/components/alert";
import { Button } from "@ieee/ui/components/button";
import { Input } from "@ieee/ui/components/input";
import { Label } from "@ieee/ui/components/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@ieee/ui/components/native-select";
import { Textarea } from "@ieee/ui/components/textarea";
import { Collapse } from "@/components/motion/collapse";
import { DeleteEventButton } from "@/components/delete-event-button";
import { FieldBuilder, type BuilderField } from "@/components/field-builder";
import { parseFields, type Event } from "@/lib/events";
import { toBuilder, toFields } from "@/lib/field-keys";
import { fromLocalInput, toLocalInput } from "@/lib/ist";
import { send } from "@/lib/send";

type Draft = {
  name: string;
  slug: string;
  summary: string;
  venue: string;
  starts_at: string;
  ends_at: string;
  opens_at: string;
  closes_at: string;
  capacity: string;
  mode: "solo" | "team";
  team_min: string;
  team_max: string;
  status: "draft" | "published";
  fields: BuilderField[];
};

function toDraft(event?: Event): Draft {
  if (!event) {
    return {
      name: "",
      slug: "",
      summary: "",
      venue: "",
      starts_at: "",
      ends_at: "",
      opens_at: "",
      closes_at: "",
      capacity: "",
      mode: "solo",
      team_min: "2",
      team_max: "4",
      status: "draft",
      fields: [],
    };
  }
  return {
    name: event.name,
    slug: event.slug,
    summary: event.summary,
    venue: event.venue,
    starts_at: toLocalInput(event.starts_at),
    ends_at: toLocalInput(event.ends_at),
    opens_at: toLocalInput(event.opens_at),
    closes_at: toLocalInput(event.closes_at),
    capacity: event.capacity ? String(event.capacity) : "",
    mode: event.mode === "team" ? "team" : "solo",
    team_min: String(event.mode === "team" ? event.team_min : 2),
    team_max: String(event.mode === "team" ? event.team_max : 4),
    status: event.status === "published" ? "published" : "draft",
    fields: toBuilder(parseFields(event.fields)),
  };
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

const LABEL = "font-mono text-xs uppercase";

function Section({
  index,
  title,
  note,
  children,
}: {
  index: number;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 border-b px-gutter py-10 md:grid-cols-4 md:gap-3 md:py-12">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase">
          [{String(index).padStart(2, "0")}] {title}
        </p>
        {note && (
          <p className="max-w-60 font-mono text-[0.65rem] leading-relaxed text-muted-foreground uppercase">
            {note}
          </p>
        )}
      </div>
      <div className="md:col-span-3 lg:col-span-2">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  className = "",
  children,
}: {
  id: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Label htmlFor={id} className={LABEL}>
        {label}
      </Label>
      {children}
    </div>
  );
}

export function EventEditor({
  event,
  registrations = 0,
}: {
  event?: Event;
  registrations?: number;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => toDraft(event));
  const [slugTouched, setSlugTouched] = useState(Boolean(event));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setSaved(false);
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function input(key: keyof Draft) {
    return (
      changed: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => set(key, changed.target.value as never);
  }

  async function save(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError("");
    setSaved(false);
    setPending(true);
    const fields = toFields(draft.fields);
    const body = {
      ...draft,
      starts_at: fromLocalInput(draft.starts_at),
      ends_at: fromLocalInput(draft.ends_at),
      opens_at: fromLocalInput(draft.opens_at),
      closes_at: fromLocalInput(draft.closes_at),
      capacity: draft.capacity === "" ? null : Number(draft.capacity),
      team_min: Number(draft.team_min),
      team_max: Number(draft.team_max),
      fields,
    };
    const { data, error: failure } = await send(
      event ? `/api/admin/events/${event.id}` : "/api/admin/events",
      { method: event ? "PATCH" : "POST", body: JSON.stringify(body) },
      "Couldn't save the event.",
    );
    setPending(false);
    if (failure) {
      setError(failure);
      return;
    }
    if (!event) {
      router.push(`/admin/events/${data.id}`);
      return;
    }
    setDraft((current) => ({ ...current, fields: toBuilder(fields) }));
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="flex flex-col">
      <Section index={1} title="Basics">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="name" label="Event name" className="sm:col-span-2">
            <Input
              id="name"
              required
              maxLength={120}
              value={draft.name}
              onChange={(changed) => {
                const name = changed.target.value;
                setSaved(false);
                setDraft((current) => ({
                  ...current,
                  name,
                  slug: slugTouched ? current.slug : toSlug(name),
                }));
              }}
            />
          </Field>
          <Field id="slug" label="Link" className="sm:col-span-2">
            <div className="flex items-stretch">
              <span className="flex items-center border border-r-0 bg-muted px-3 font-mono text-xs text-muted-foreground">
                /
              </span>
              <Input
                id="slug"
                required
                maxLength={60}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                title="Lowercase letters, numbers and dashes"
                className="font-mono"
                value={draft.slug}
                onChange={(changed) => {
                  setSlugTouched(true);
                  set("slug", changed.target.value.toLowerCase());
                }}
              />
            </div>
          </Field>
          <Field id="summary" label="Summary" className="sm:col-span-2">
            <Textarea
              id="summary"
              rows={4}
              maxLength={1000}
              value={draft.summary}
              onChange={input("summary")}
            />
          </Field>
          <Field id="venue" label="Venue" className="sm:col-span-2">
            <Input
              id="venue"
              maxLength={200}
              value={draft.venue}
              onChange={input("venue")}
            />
          </Field>
        </div>
      </Section>

      <Section index={2} title="Dates" note="All times are in IST.">
        <div className="grid gap-5 sm:grid-cols-2">
          {(
            [
              ["starts_at", "Event starts"],
              ["ends_at", "Event ends"],
              ["opens_at", "Registrations open"],
              ["closes_at", "Registrations close"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} id={key} label={label}>
              <Input
                id={key}
                type="datetime-local"
                required
                className="font-mono"
                value={draft[key]}
                onChange={input(key)}
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section
        index={3}
        title="Format"
        note="When the seats fill up, new registrations join the waitlist."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="mode" label="Who registers">
            <NativeSelect id="mode" value={draft.mode} onChange={input("mode")}>
              <NativeSelectOption value="solo">Individuals</NativeSelectOption>
              <NativeSelectOption value="team">Teams</NativeSelectOption>
            </NativeSelect>
          </Field>
          <Field id="capacity" label="Seats (blank for unlimited)">
            <Input
              id="capacity"
              type="number"
              min={1}
              inputMode="numeric"
              value={draft.capacity}
              onChange={input("capacity")}
            />
          </Field>
          {draft.mode === "team" && (
            <>
              <Field id="team_min" label="Smallest team">
                <Input
                  id="team_min"
                  type="number"
                  min={1}
                  max={20}
                  required
                  inputMode="numeric"
                  value={draft.team_min}
                  onChange={input("team_min")}
                />
              </Field>
              <Field id="team_max" label="Largest team">
                <Input
                  id="team_max"
                  type="number"
                  min={Number(draft.team_min) || 1}
                  max={20}
                  required
                  inputMode="numeric"
                  value={draft.team_max}
                  onChange={input("team_max")}
                />
              </Field>
            </>
          )}
        </div>
      </Section>

      <Section
        index={4}
        title="Form"
        note="Extra questions on the registration form. Changing a question keeps the answers already given."
      >
        <FieldBuilder
          fields={draft.fields}
          onChange={(fields) => set("fields", fields)}
        />
      </Section>

      {event && (
        <Section
          index={5}
          title="Delete"
          note="Only events nobody has registered for can be deleted."
        >
          <DeleteEventButton id={event.id} disabled={registrations > 0} />
        </Section>
      )}

      <div className="sticky bottom-0 z-20 flex flex-col gap-3 border-t bg-background px-gutter py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Collapse show={error !== ""}>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Collapse>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Label htmlFor="status" className="sr-only">
              Status
            </Label>
            <NativeSelect
              id="status"
              value={draft.status}
              onChange={input("status")}
            >
              <NativeSelectOption value="draft">Draft</NativeSelectOption>
              <NativeSelectOption value="published">
                Published
              </NativeSelectOption>
            </NativeSelect>
            {event?.status === "published" && (
              <Link
                href={`/${event.slug}`}
                target="_blank"
                className="font-mono text-xs uppercase underline-offset-4 hover:underline"
              >
                View page
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="font-mono text-xs text-muted-foreground uppercase">
                Saved
              </span>
            )}
            <Button
              type="submit"
              size="lg"
              className="font-mono uppercase"
              disabled={pending}
            >
              {pending ? "Saving…" : event ? "Save changes" : "Create event"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
