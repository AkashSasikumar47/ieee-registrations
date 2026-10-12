"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@ieee/ui/components/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ieee/ui/components/alert-dialog";
import { Button } from "@ieee/ui/components/button";
import { Input } from "@ieee/ui/components/input";
import { Label } from "@ieee/ui/components/label";
import { Textarea } from "@ieee/ui/components/textarea";
import { Collapse } from "@/components/motion/collapse";
import { DeleteEventButton } from "@/components/delete-event-button";
import { FieldBuilder, type BuilderField } from "@/components/field-builder";
import {
  FORMAT_LABELS,
  KIND_LABELS,
  parseFields,
  type Event,
} from "@/lib/events";
import { toBuilder, toFields } from "@/lib/field-keys";
import { fromLocalInput, toLocalInput } from "@/lib/ist";
import { send } from "@/lib/send";
import { Choice } from "@/components/choice";

type Draft = {
  name: string;
  slug: string;
  kind: string;
  format: "campus" | "online";
  summary: string;
  about: string;
  website: string;
  accent: string;
  backdrop: string;
  venue: string;
  registers: boolean;
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

function toDraft(event?: Event, copy = false): Draft {
  if (!event) {
    return {
      name: "",
      slug: "",
      kind: "workshop",
      format: "campus",
      summary: "",
      about: "",
      website: "",
      accent: "",
      backdrop: "",
      venue: "",
      registers: true,
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
    name: copy ? "" : event.name,
    slug: copy ? "" : event.slug,
    kind: event.kind,
    format: event.format === "online" ? "online" : "campus",
    summary: event.summary,
    about: event.about,
    website: copy ? "" : event.website,
    accent: event.accent,
    backdrop: event.backdrop,
    venue: event.venue,
    registers: copy || event.opens_at !== null,
    starts_at: copy ? "" : toLocalInput(event.starts_at),
    ends_at: copy ? "" : toLocalInput(event.ends_at),
    opens_at: copy || !event.opens_at ? "" : toLocalInput(event.opens_at),
    closes_at: copy || !event.closes_at ? "" : toLocalInput(event.closes_at),
    capacity: event.capacity ? String(event.capacity) : "",
    mode: event.mode === "team" ? "team" : "solo",
    team_min: String(event.mode === "team" ? event.team_min : 2),
    team_max: String(event.mode === "team" ? event.team_max : 4),
    status: !copy && event.status === "published" ? "published" : "draft",
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

const SECTIONS = ["Basics", "Dates", "Format", "Form", "Delete"];

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
    <section
      id={`section-${title.toLowerCase()}`}
      className="grid scroll-mt-20 gap-6 border-b px-gutter py-8 md:grid-cols-4 md:gap-3 md:py-10"
    >
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
  template,
  registrations = 0,
}: {
  event?: Event;
  template?: Event;
  registrations?: number;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(() =>
    template ? toDraft(template, true) : toDraft(event),
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(event));
  const [error, setError] = useState("");
  const [baseline, setBaseline] = useState(() => JSON.stringify(draft));
  const form = useRef<HTMLFormElement>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const dirty = JSON.stringify(draft) !== baseline;
  const guarded = dirty || !event;

  useEffect(() => {
    if (!guarded) return;
    const leave = (event: BeforeUnloadEvent) => event.preventDefault();
    const click = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target || form.current?.contains(target)) return;
      const link = target.closest("a[href]");
      const exit =
        (link &&
          link.getAttribute("target") !== "_blank" &&
          !link.hasAttribute("download") &&
          !link.getAttribute("href")?.startsWith("#")) ||
        target.closest('button[type="submit"]');
      if (!exit) return;
      event.preventDefault();
      event.stopPropagation();
      setLeaving(link?.getAttribute("href") ?? "");
    };
    window.addEventListener("beforeunload", leave);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", leave);
      document.removeEventListener("click", click, true);
    };
  }, [guarded]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function input(key: keyof Draft) {
    return (
      changed: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => set(key, changed.target.value as never);
  }

  async function save(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const submitter = (formEvent.nativeEvent as SubmitEvent).submitter;
    const create = submitter?.dataset.action === "create";
    const status = create ? "published" : draft.status;
    setError("");
    setPending(true);
    const fields = toFields(draft.fields);
    const body = {
      ...draft,
      status,
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
    const next = { ...draft, status, fields: toBuilder(fields) };
    setDraft(next);
    setBaseline(JSON.stringify(next));
    toast.success(
      create
        ? "Event created. It's live on the site."
        : status === "draft"
          ? "Draft saved. Only admins can see it."
          : "Changes saved.",
    );
    if (!event) {
      router.push(`/admin/events/${data.id}`);
      return;
    }
    router.refresh();
  }

  return (
    <form ref={form} onSubmit={save} className="flex flex-col">
      <nav
        aria-label="Sections"
        className="flex gap-1 overflow-x-auto border-b px-gutter py-2"
      >
        {SECTIONS.filter((title) => event || title !== "Delete").map(
          (title) => (
            <a
              key={title}
              href={`#section-${title.toLowerCase()}`}
              className="shrink-0 px-2 py-1 font-mono text-xs text-muted-foreground uppercase first:pl-0 hover:text-foreground"
            >
              {title}
            </a>
          ),
        )}
      </nav>
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
          <Field id="kind" label="Kind">
            <Choice
              id="kind"
              value={draft.kind}
              onChange={(kind) => set("kind", kind)}
              options={Object.entries(KIND_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Field>
          <Field id="format" label="Where">
            <Choice
              id="format"
              value={draft.format}
              onChange={(format) => set("format", format as Draft["format"])}
              options={Object.entries(FORMAT_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Field>
          {draft.format === "campus" && (
            <Field id="venue" label="Venue" className="sm:col-span-2">
              <Input
                id="venue"
                maxLength={200}
                placeholder="e.g. Mini Hall 2, T P Ganesan Auditorium"
                value={draft.venue}
                onChange={input("venue")}
              />
            </Field>
          )}
          <Field id="summary" label="Summary" className="sm:col-span-2">
            <Textarea
              id="summary"
              rows={3}
              maxLength={1000}
              value={draft.summary}
              onChange={input("summary")}
            />
          </Field>
          <Field id="about" label="More details" className="sm:col-span-2">
            <Textarea
              id="about"
              rows={6}
              maxLength={5000}
              value={draft.about}
              onChange={input("about")}
            />
          </Field>
          {(
            [
              ["accent", "Poster colour"],
              ["backdrop", "Poster fade to"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} id={key} label={label}>
              <div className="flex items-stretch gap-2">
                <span
                  aria-hidden="true"
                  style={{ background: draft[key] || undefined }}
                  className="w-10 shrink-0 border bg-[repeating-linear-gradient(135deg,var(--border)_0_1px,transparent_1px_6px)]"
                />
                <Input
                  id={key}
                  maxLength={7}
                  pattern="#[0-9a-f]{6}"
                  title="A hex colour like #e85a16, or blank"
                  placeholder="Blank for a pattern"
                  className="font-mono"
                  value={draft[key]}
                  onChange={(changed) =>
                    set(key, changed.target.value.trim().toLowerCase())
                  }
                />
              </div>
            </Field>
          ))}
          <Field id="website" label="Event website" className="sm:col-span-2">
            <Input
              id="website"
              type="url"
              maxLength={200}
              placeholder="https://"
              pattern="https://.*"
              value={draft.website}
              onChange={input("website")}
            />
          </Field>
        </div>
      </Section>

      <Section index={2} title="Dates" note="All times are in IST.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="registers" label="Registration" className="sm:col-span-2">
            <Choice
              id="registers"
              value={draft.registers ? "yes" : "no"}
              onChange={(choice) => set("registers", choice === "yes")}
              options={[
                { value: "yes", label: "Register through this site" },
                {
                  value: "no",
                  label: "No registration here (a record of the event)",
                },
              ]}
            />
          </Field>
          {(
            [
              ["starts_at", "Event starts"],
              ["ends_at", "Event ends"],
              ...(draft.registers
                ? ([
                    ["opens_at", "Registrations open"],
                    ["closes_at", "Registrations close"],
                  ] as const)
                : []),
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
        {registrations > 0 && (
          <Alert className="mb-5">
            <AlertDescription>
              {registrations}{" "}
              {registrations === 1 ? "person has" : "people have"} registered.
              Changing who registers or the team size now can leave existing
              teams too small or too big.
            </AlertDescription>
          </Alert>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="mode" label="Who registers">
            <Choice
              id="mode"
              value={draft.mode}
              onChange={(mode) => set("mode", mode as Draft["mode"])}
              options={[
                { value: "solo", label: "Individuals" },
                { value: "team", label: "Teams" },
              ]}
            />
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
        {registrations > 0 && (
          <Alert className="mb-5">
            <AlertDescription>
              People have already answered this form. New required questions
              only apply to new registrations, and removed questions drop out of
              the export.
            </AlertDescription>
          </Alert>
        )}
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
          <p className="font-mono text-xs text-muted-foreground uppercase">
            {dirty
              ? "Unsaved changes"
              : draft.status === "published"
                ? "Live on the site"
                : "Draft · only admins can see it"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {(dirty || !event) && (
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="font-mono uppercase"
                disabled={pending}
                onClick={() => {
                  setDraft(JSON.parse(baseline) as Draft);
                  setError("");
                  if (event) {
                    toast("Changes discarded.");
                    return;
                  }
                  toast("New event discarded.");
                  router.push("/admin");
                }}
              >
                {event ? "Discard changes" : "Discard"}
              </Button>
            )}
            <Button
              type="submit"
              data-action="save"
              size="lg"
              variant={draft.status === "published" ? "default" : "outline"}
              className="font-mono uppercase"
              disabled={pending || (Boolean(event) && !dirty)}
            >
              {event ? "Save changes" : "Save draft"}
            </Button>
            {draft.status !== "published" && (
              <Button
                type="submit"
                data-action="create"
                size="lg"
                className="font-mono uppercase"
                disabled={pending}
              >
                Create event
              </Button>
            )}
          </div>
        </div>
      </div>
      <AlertDialog
        open={leaving !== null}
        onOpenChange={(open) => {
          if (!open) setLeaving(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {event ? "Leave without saving?" : "Discard this new event?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {event
                ? "Your changes to this event haven't been saved. Save them first, or discard them and leave."
                : "This new event hasn't been saved. Save it as a draft first, or discard it and leave."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                const href = leaving;
                setDraft(JSON.parse(baseline) as Draft);
                setLeaving(null);
                if (href) router.push(href);
              }}
            >
              Discard and leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
