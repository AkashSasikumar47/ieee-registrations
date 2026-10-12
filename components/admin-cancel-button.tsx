"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ieee/ui/components/alert-dialog";
import { Button } from "@ieee/ui/components/button";
import { send } from "@/lib/send";

export function AdminCancelButton({
  id,
  name,
  leader,
}: {
  id: string;
  name: string;
  leader: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function cancel() {
    setError("");
    setPending(true);
    const { error: failure } = await send(
      `/api/admin/entries/${id}/cancel`,
      { method: "POST" },
      "Couldn't cancel. Try again.",
    );
    setPending(false);
    if (failure) setError(failure);
    else router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-destructive/40 font-mono text-destructive uppercase hover:bg-destructive/10 hover:text-destructive"
          disabled={pending}
          title={error || undefined}
        >
          {error ? "Retry cancel" : "Cancel"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Cancel {name}&apos;s registration?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {leader
              ? "They lead a team, so the whole team is cancelled. Seats go to the waitlist. This can't be undone."
              : "Their seat goes to the next person on the waitlist. This can't be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={cancel}>
            Cancel registration
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
