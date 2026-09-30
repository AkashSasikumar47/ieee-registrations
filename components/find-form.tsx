"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@ieee/ui/components/alert";
import { Button } from "@ieee/ui/components/button";
import { Input } from "@ieee/ui/components/input";
import { Label } from "@ieee/ui/components/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@ieee/ui/components/native-select";
import { INPUT_PATTERNS } from "@/lib/validate";

export function FindForm({
  events,
}: {
  events: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(events[0]?.slug ?? "");
  const [registerNumber, setRegisterNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, register_number: registerNumber, phone }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ticket_code) {
        setError(data.error ?? "No registration matches those details.");
        setPending(false);
        return;
      }
      router.push(`/t/${data.ticket_code}`);
    } catch {
      setError("Couldn't reach the server. Check your connection.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-2 *:data-[slot=native-select-wrapper]:w-full">
        <Label htmlFor="event">Event</Label>
        <NativeSelect
          id="event"
          required
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        >
          {events.map((event) => (
            <NativeSelectOption key={event.slug} value={event.slug}>
              {event.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="register_number">Register number</Label>
        <Input
          id="register_number"
          placeholder="RA2211003010001"
          required
          pattern={INPUT_PATTERNS.registerNumber}
          value={registerNumber}
          onChange={(event) =>
            setRegisterNumber(event.target.value.toUpperCase())
          }
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Mobile number used to register</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="numeric"
          required
          pattern={INPUT_PATTERNS.phone}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </div>
      <Button type="submit" size="lg" disabled={pending || !slug}>
        {pending ? "Looking…" : "Find my registration"}
      </Button>
    </form>
  );
}
