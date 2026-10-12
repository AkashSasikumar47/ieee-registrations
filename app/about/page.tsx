import type { Metadata } from "next";
import { ABOUT_IEEE } from "@ieee/ui/content/about-ieee";
import { Reveal } from "@/components/motion/reveal";
import { PageIntro } from "@/components/page-intro";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "About | Registrations" };

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageIntro
          label="About IEEE"
          title={ABOUT_IEEE.title}
          lead={ABOUT_IEEE.statement}
        />
        <div className="px-gutter py-7 md:py-9">
          <Reveal className="flex aspect-[4/3] items-end bg-muted bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-size-[14px_14px] p-4 font-mono text-xs text-muted-foreground uppercase md:aspect-[16/5]">
            IEEE SRMIST team photo
          </Reveal>
        </div>
        <ul className="grid border-t px-site-0 md:grid-cols-3">
          {ABOUT_IEEE.points.map((point, index) => (
            <Reveal
              as="li"
              key={point.title}
              delay={index * 0.1}
              className="flex flex-col gap-3 border-b px-4 py-8 md:border-r md:px-5 md:py-8 md:last:border-r-0"
            >
              <h2 className="font-mono text-sm font-semibold uppercase">
                {point.title}
              </h2>
              <p className="max-w-sm text-muted-foreground">
                {point.description}
              </p>
            </Reveal>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
