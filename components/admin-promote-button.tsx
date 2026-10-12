"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@ieee/ui/components/button";
import { send } from "@/lib/send";

export function AdminPromoteButton({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function promote() {
    setError("");
    setPending(true);
    const { error: failure } = await send(
      `/api/admin/entries/${id}/promote`,
      { method: "POST" },
      "Couldn't confirm. Try again.",
    );
    setPending(false);
    if (failure) setError(failure);
    else router.refresh();
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="font-mono uppercase"
      disabled={pending}
      title={error || "Confirm from the waitlist, even if the seats are full"}
      onClick={promote}
    >
      {error ? "Retry confirm" : "Confirm"}
    </Button>
  );
}
