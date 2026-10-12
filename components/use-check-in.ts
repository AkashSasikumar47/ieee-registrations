"use client";

import { useState } from "react";
import { send } from "@/lib/send";

export function useCheckIn() {
  const [overrides, setOverrides] = useState<Record<string, string | null>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");

  function checkedInAt(entry: { id: string; checked_in_at: string | null }) {
    return entry.id in overrides
      ? (overrides[entry.id] ?? null)
      : entry.checked_in_at;
  }

  async function toggle(entry: { id: string; checked_in_at: string | null }) {
    setError("");
    setPending(entry.id);
    const { data, error: failure } = await send(
      `/api/admin/entries/${entry.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ checked_in: !checkedInAt(entry) }),
      },
      "Couldn't update the check-in.",
    );
    setPending(null);
    if (failure) {
      setError(failure);
      return false;
    }
    setOverrides((current) => ({
      ...current,
      [entry.id]: (data.checked_in_at as string | null) ?? null,
    }));
    return true;
  }

  return { checkedInAt, toggle, pending, error };
}
