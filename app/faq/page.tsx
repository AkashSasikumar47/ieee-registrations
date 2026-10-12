import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ieee/ui/components/accordion";
import { Reveal } from "@/components/motion/reveal";
import { PageIntro } from "@/components/page-intro";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FAQS } from "@/lib/faqs";

export const metadata: Metadata = { title: "FAQ | Registrations" };

export default function FaqPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageIntro
          label="FAQ"
          title="Questions, answered"
          lead="Everything about registering, teams, waitlists and tickets."
        />
        <div className="grid gap-6 px-gutter py-7 md:grid-cols-4 md:gap-3 md:py-9">
          <p className="font-mono text-xs uppercase">{FAQS.length} questions</p>
          <Reveal className="md:col-span-3">
            <Accordion
              type="single"
              collapsible
              defaultValue="faq-0"
              className="border-t"
            >
              {FAQS.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
                  value={`faq-${index}`}
                  className="last:border-b"
                >
                  <AccordionTrigger className="items-baseline gap-6 rounded-none py-4 hover:no-underline">
                    <span className="flex items-baseline gap-6">
                      <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-lg font-bold tracking-[-0.02em] md:text-xl">
                        {faq.question}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="max-w-2xl pb-6 pl-12 text-base text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
