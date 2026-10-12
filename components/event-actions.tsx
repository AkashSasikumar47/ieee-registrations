"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Download, Eye, EyeOff, Files, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@ieee/ui/components/button";
import { send } from "@/lib/send";

type Action = "publish" | "unpublish" | "open" | "close";

const DONE: Record<Action, string> = {
  publish: "Event created. It's live on the site.",
  unpublish: "Moved back to draft. Only admins can see it.",
  open: "Registrations are open.",
  close: "Registrations are closed.",
};

export function EventActions({
  id,
  slug,
  published,
  open,
  registers,
}: {
  id: string;
  slug: string;
  published: boolean;
  open: boolean;
  registers: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<Action | null>(null);

  async function run(action: Action) {
    setPending(action);
    const { error } = await send(
      `/api/admin/events/${id}/quick`,
      { method: "POST", body: JSON.stringify({ action }) },
      "Couldn't update the event.",
    );
    setPending(null);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(DONE[action]);
    router.refresh();
  }

  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    toast.success("Link copied.");
  }

  const item =
    "h-auto shrink-0 gap-2 rounded-none px-3 py-3 font-mono text-xs font-semibold tracking-wide text-muted-foreground uppercase hover:bg-transparent hover:text-foreground";

  return (
    <>
      <Button
        variant="ghost"
        className={item}
        disabled={pending !== null}
        onClick={() => run(published ? "unpublish" : "publish")}
      >
        {published ? <EyeOff /> : <Eye />}
        {published ? "Move back to draft" : "Create event"}
      </Button>
      {registers && (
        <Button
          variant="ghost"
          className={item}
          disabled={pending !== null}
          onClick={() => run(open ? "close" : "open")}
        >
          {open ? <Lock /> : <Unlock />}
          {open ? "Close registrations" : "Open registrations"}
        </Button>
      )}
      <Button variant="ghost" className={item} onClick={copy}>
        <Copy /> Copy link
      </Button>
      <Button variant="ghost" className={item} asChild>
        <a href={`/api/admin/events/${id}/csv`} download>
          <Download /> Download CSV
        </a>
      </Button>
      <Button variant="ghost" className={item} asChild>
        <Link href={`/admin/events/new?from=${id}`}>
          <Files /> Duplicate
        </Link>
      </Button>
    </>
  );
}
