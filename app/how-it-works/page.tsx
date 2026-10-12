import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@ieee/ui/components/button";
import { Reveal } from "@/components/motion/reveal";
import { PageIntro } from "@/components/page-intro";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { STEPS } from "@/lib/site";

export const metadata: Metadata = { title: "How it works | Registrations" };

export default function HowItWorksPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageIntro
          label="How it works"
          title="Three steps to your seat"
          lead="No accounts and no waiting. Register, and your ticket is ready the moment you finish."
        />
        <ol className="grid border-b px-gutter md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal
              as="li"
              key={step.title}
              delay={index * 0.1}
              className="flex min-h-72 flex-col justify-between gap-10 border-b py-8 md:border-r md:border-b-0 md:px-6 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
            >
              <span className="font-display text-[clamp(2.5rem,4.5vw,4.25rem)] leading-[0.8] font-black tracking-[-0.06em]">
                0{index + 1}
              </span>
              <span className="flex flex-col gap-2">
                <span className="font-mono text-sm font-semibold uppercase">
                  {step.title}
                </span>
                <span className="max-w-sm text-muted-foreground">
                  {step.description}
                </span>
              </span>
            </Reveal>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3 px-gutter py-7 md:py-9">
          <Button size="lg" asChild>
            <Link href="/events">
              Browse events <ArrowRight />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/find">Find my ticket</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
