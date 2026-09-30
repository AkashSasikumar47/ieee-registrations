"use client";

import { Button } from "@ieee/ui/components/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm text-muted-foreground">Something went wrong.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
