import Link from "next/link";
import { Button } from "@ieee/ui/components/button";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="flex-1">
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          That page doesn&apos;t exist.
        </p>
        <Button variant="link" asChild>
          <Link href="/">Back to events</Link>
        </Button>
      </main>
    </div>
  );
}
