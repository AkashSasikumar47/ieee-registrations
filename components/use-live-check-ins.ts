"use client";

import { useCallback, useEffect, useState } from "react";
import type { CheckInEntry } from "@/lib/check-ins";
import { send } from "@/lib/send";

const POLL_MS = 5000;

export type ScanResult = {
  result:
    | "in"
    | "already"
    | "waitlisted"
    | "cancelled"
    | "other_event"
    | "unknown"
    | "offline";
  person?: Pick<
    CheckInEntry,
    "id" | "name" | "register_number" | "team" | "checked_in_at"
  >;
  at: number;
};

export function useLiveCheckIns(eventId: string, initial: CheckInEntry[]) {
  const [entries, setEntries] = useState(initial);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/admin/events/${eventId}/check-ins`, {
      cache: "no-store",
    }).catch(() => null);
    if (!response?.ok) return;
    const body = (await response.json()) as { entries: CheckInEntry[] };
    setEntries(body.entries);
  }, [eventId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    const wake = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", wake);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [refresh]);

  function set(id: string, checked_in_at: string | null) {
    setEntries((list) =>
      list.map((entry) =>
        entry.id === id ? { ...entry, checked_in_at } : entry,
      ),
    );
  }

  async function toggle(entry: Pick<CheckInEntry, "id" | "checked_in_at">) {
    setError("");
    setPending(entry.id);
    const { data, error: failure } = await send(
      `/api/admin/entries/${entry.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ checked_in: !entry.checked_in_at }),
      },
      "Couldn't update the check-in.",
    );
    setPending(null);
    if (failure) {
      setError(failure);
      return false;
    }
    set(entry.id, (data.checked_in_at as string | null) ?? null);
    return true;
  }

  async function scan(code: string): Promise<ScanResult> {
    const { data, error: failure } = await send(
      "/api/admin/scan",
      { method: "POST", body: JSON.stringify({ event_id: eventId, code }) },
      "offline",
    );
    if (failure) return { result: "offline", at: Date.now() };
    const result = data as Omit<ScanResult, "at">;
    if (result.result === "in" && result.person) {
      set(result.person.id, result.person.checked_in_at);
    }
    return { ...result, at: Date.now() };
  }

  return { entries, pending, error, toggle, scan };
}
