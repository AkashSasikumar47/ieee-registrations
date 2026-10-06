import { Reveal } from "@/components/motion/reveal";
import { RiseText } from "@/components/motion/rise-text";

export function AdminIntro({
  label,
  title,
  lead,
  children,
}: {
  label: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 border-b px-gutter pt-10 pb-8 md:flex-row md:items-end md:justify-between md:pt-14 md:pb-10">
      <div className="flex min-w-0 flex-col gap-4">
        <Reveal
          as="p"
          trigger="mount"
          y={8}
          className="font-mono text-xs tracking-wide uppercase"
        >
          [ {label} ]
        </Reveal>
        <RiseText
          as="h1"
          text={title}
          trigger="mount"
          delay={0.1}
          className="font-display max-w-5xl text-[clamp(2.25rem,5.5vw,5rem)] leading-[0.88] font-black tracking-[-0.05em] text-balance uppercase"
        />
        {lead ? (
          <Reveal
            as="p"
            trigger="mount"
            delay={0.25}
            className="max-w-xl font-mono text-xs leading-relaxed text-muted-foreground uppercase"
          >
            {lead}
          </Reveal>
        ) : null}
      </div>
      {children ? (
        <Reveal
          trigger="mount"
          delay={0.3}
          y={10}
          className="flex flex-wrap gap-2"
        >
          {children}
        </Reveal>
      ) : null}
    </div>
  );
}
