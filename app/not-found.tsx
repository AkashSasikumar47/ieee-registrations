import Link from "next/link";
import { Button } from "@ieee/ui/components/button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-gutter py-24 text-center">
        <p className="font-display text-[clamp(4rem,14vw,10rem)] leading-[0.8] font-black tracking-[-0.06em]">
          404
        </p>
        <p className="font-mono text-xs text-muted-foreground uppercase">
          That page doesn&apos;t exist.
        </p>
        <Button variant="link" asChild>
          <Link href="/events">Back to events</Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}
