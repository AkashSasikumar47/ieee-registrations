"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@ieee/ui/components/alert";
import { Button } from "@ieee/ui/components/button";
import { Input } from "@ieee/ui/components/input";
import { Label } from "@ieee/ui/components/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@ieee/ui/components/native-select";
import { Textarea } from "@ieee/ui/components/textarea";
import type { Field } from "@/lib/events";
import { INPUT_PATTERNS } from "@/lib/validate";

type Props = {
  fields: Field[];
  submitLabel: string;
} & (
  | { kind: "register"; slug: string; team: boolean }
  | { kind: "join"; inviteCode: string }
);

type Step = "details" | "questions" | "review";

const STEP_LABELS: Record<Step, string> = {
  details: "Your details",
  questions: "Event questions",
  review: "Review",
};

export function RegistrationForm(props: Props) {
  const router = useRouter();
  const current = useRef<HTMLFieldSetElement>(null);
  const steps: Step[] =
    props.fields.length > 0
      ? ["details", "questions", "review"]
      : ["details", "review"];
  const [step, setStep] = useState<Step>("details");
  const [values, setValues] = useState({
    name: "",
    email: "",
    register_number: "",
    phone: "",
    team_name: "",
    invite_code: props.kind === "join" ? props.inviteCode : "",
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const index = steps.indexOf(step);
  const creatingTeam = props.kind === "register" && props.team;

  function set(key: keyof typeof values, upper = false) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = upper
        ? event.target.value.toUpperCase()
        : event.target.value;
      setValues((existing) => ({ ...existing, [key]: value }));
    };
  }

  function answer(key: string) {
    return (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => setAnswers((existing) => ({ ...existing, [key]: event.target.value }));
  }

  function next() {
    const inputs = current.current?.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("input, select, textarea");
    for (const input of inputs ?? []) {
      if (!input.reportValidity()) return;
    }
    setError("");
    setStep(steps[index + 1] ?? step);
  }

  async function submit() {
    setError("");
    setPending(true);
    const body =
      props.kind === "register"
        ? { slug: props.slug, ...values, answers }
        : { ...values, answers };
    try {
      const response = await fetch(`/api/${props.kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ticket_code) {
        setError(data.error ?? "Couldn't register. Try again.");
        setPending(false);
        return;
      }
      router.push(`/t/${data.ticket_code}?new=1`);
    } catch {
      setError("Couldn't reach the server. Check your connection.");
      setPending(false);
    }
  }

  const review = [
    ...(props.kind === "join"
      ? [{ label: "Invite code", value: values.invite_code }]
      : []),
    ...(creatingTeam ? [{ label: "Team", value: values.team_name }] : []),
    { label: "Name", value: values.name },
    { label: "SRM email", value: values.email },
    { label: "Register number", value: values.register_number },
    { label: "Mobile", value: values.phone },
    ...props.fields.map((field) => ({
      label: field.label,
      value: answers[field.key] || "—",
    })),
  ];

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (step === "review") submit();
        else next();
      }}
      className="flex flex-col gap-6"
    >
      <ol
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
      >
        {steps.map((item, position) => (
          <li key={item} className="flex flex-col gap-2">
            <span
              className={`h-1 rounded-full ${position <= index ? "bg-foreground" : "bg-muted"}`}
            />
            <span
              className={`text-xs ${position === index ? "font-semibold" : "text-muted-foreground"}`}
            >
              {position + 1}. {STEP_LABELS[item]}
            </span>
          </li>
        ))}
      </ol>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <fieldset
        ref={step === "details" ? current : undefined}
        hidden={step !== "details"}
        className="grid gap-4 sm:grid-cols-2"
      >
        {props.kind === "join" && (
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="invite_code">Invite code</Label>
            <Input
              id="invite_code"
              required
              maxLength={8}
              placeholder="From your team lead"
              value={values.invite_code}
              onChange={set("invite_code", true)}
              className="font-mono tracking-widest"
            />
          </div>
        )}
        {creatingTeam && (
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="team_name">Team name</Label>
            <Input
              id="team_name"
              required
              maxLength={60}
              value={values.team_name}
              onChange={set("team_name")}
            />
          </div>
        )}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            autoComplete="name"
            required
            maxLength={100}
            value={values.name}
            onChange={set("name")}
          />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="email">SRM email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ab1234@srmist.edu.in"
            required
            pattern={INPUT_PATTERNS.email}
            title="Use your @srmist.edu.in email"
            value={values.email}
            onChange={set("email")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="register_number">Register number</Label>
          <Input
            id="register_number"
            placeholder="RA2211003010001"
            required
            pattern={INPUT_PATTERNS.registerNumber}
            title="RA followed by 13 digits"
            value={values.register_number}
            onChange={set("register_number", true)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Mobile number</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="9876543210"
            required
            pattern={INPUT_PATTERNS.phone}
            title="A 10-digit mobile number"
            value={values.phone}
            onChange={set("phone")}
          />
        </div>
      </fieldset>

      {props.fields.length > 0 && (
        <fieldset
          ref={step === "questions" ? current : undefined}
          hidden={step !== "questions"}
          className="flex flex-col gap-4"
        >
          {props.fields.map((field) => (
            <div
              key={field.key}
              className="flex flex-col gap-2 *:data-[slot=native-select-wrapper]:w-full"
            >
              <Label htmlFor={`field-${field.key}`}>
                {field.label}
                {!field.required && (
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                )}
              </Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={`field-${field.key}`}
                  required={field.required}
                  maxLength={1000}
                  value={answers[field.key] ?? ""}
                  onChange={answer(field.key)}
                />
              ) : field.type === "select" ? (
                <NativeSelect
                  id={`field-${field.key}`}
                  required={field.required}
                  value={answers[field.key] ?? ""}
                  onChange={answer(field.key)}
                >
                  <NativeSelectOption value="">Choose one</NativeSelectOption>
                  {field.options?.map((option) => (
                    <NativeSelectOption key={option} value={option}>
                      {option}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              ) : (
                <Input
                  id={`field-${field.key}`}
                  type={field.type === "url" ? "url" : "text"}
                  placeholder={field.type === "url" ? "https://" : undefined}
                  required={field.required}
                  maxLength={1000}
                  value={answers[field.key] ?? ""}
                  onChange={answer(field.key)}
                />
              )}
            </div>
          ))}
        </fieldset>
      )}

      {step === "review" && (
        <dl className="flex flex-col">
          {review.map((item) => (
            <div
              key={item.label}
              className="flex justify-between gap-4 border-t py-3 text-sm"
            >
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className="text-right font-medium break-all">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="flex justify-between gap-3">
        {index > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setStep(steps[index - 1] ?? step)}
            disabled={pending}
          >
            <ArrowLeft /> Back
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" size="lg" disabled={pending}>
          {step === "review" ? (
            pending ? (
              "Submitting…"
            ) : (
              props.submitLabel
            )
          ) : (
            <>
              Continue <ArrowRight />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
